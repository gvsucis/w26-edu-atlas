from app.models.schemas import GenerateRequest
from app.services.request_builder import build_user_request
from app.services.retrieval import plan, retrieve, web_search_context
from app.services.generation import generate_final, regenerate_with_feedback
from app.services.validation import validate_output


# Main orchestration function with sequential regeneration attempts
def run_pipeline(req: GenerateRequest, max_attempts: int = 3) -> dict:
    user_request = build_user_request(req)

    plan_json = plan(user_request)
    rag_pack = retrieve(plan_json["rag_queries"]) #if plan_json.get("standards_needed", True) else ""
    search_pack = web_search_context(user_request, plan_json) if plan_json.get("needs_web_search", True) else None

    def passes_validation(validation: dict) -> bool:
        return not (
            validation["grounding"]["score"] < 0.8
            or validation["constraints"]["score"] < 0.8
            or validation["judge"]["overall_score"] < 0.75
            or validation["judge"]["should_regenerate"]
        )

    current_output = generate_final(user_request, plan_json, rag_pack, search_pack)
    current_validation = validate_output(user_request, plan_json, rag_pack, search_pack, current_output)

    if passes_validation(current_validation):
        return {
            "deliverable": {
                "content": current_output,
                "type": req.deliverable_type,
            },
            "validation": {
                "report": current_validation,
                "success": True,
                "attempts_used": 1,
            },
            "metadata": {
                "plan": plan_json,
            },
        }

    for attempt in range(2, max_attempts + 1):
        current_output = regenerate_with_feedback(
            user_request=user_request,
            plan_json=plan_json,
            rag_pack=rag_pack,
            search_pack=search_pack,
            previous_output=current_output,
            validation=current_validation,
        )

        current_validation = validate_output(
            user_request,
            plan_json,
            rag_pack,
            search_pack,
            current_output
        )

        if passes_validation(current_validation):
            return {
                "deliverable": {
                    "content": current_output,
                    "type": req.deliverable_type,
                },
                "validation": {
                    "report": current_validation,
                    "success": True,
                    "attempts_used": attempt,
                },
                "metadata": {
                    "plan": plan_json,
                },
            }

    return {
        "deliverable": {
            "content": current_output,
            "type": req.deliverable_type,
        },
        "validation": {
            "report": current_validation,
            "success": False,
            "attempts_used": max_attempts,
            "message": f"Generation failed validation after {max_attempts} attempts.",
        },
        "metadata": {
            "plan": plan_json,
        },
    }