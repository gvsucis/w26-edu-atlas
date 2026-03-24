import json
from app.services.retrieval import plan, retrieve, web_search_context
from app.services.generation import generate_final, regenerate_with_feedback
from app.services.validation import validate_output

# Main orchestration function that runs planning, retrieval, search, generation, and validation
import json
from app.services.retrieval import plan, retrieve, web_search_context
from app.services.generation import generate_final, regenerate_with_feedback
from app.services.validation import validate_output


# Main orchestration function with sequential regeneration attempts
def run_pipeline(user_request: str, max_attempts: int = 3) -> dict:
    plan_json = plan(user_request)
    rag_pack = retrieve(plan_json["rag_queries"]) if plan_json.get("standards_needed", True) else ""
    search_pack = web_search_context(user_request, plan_json) if plan_json.get("needs_web_search", False) else None

    def passes_validation(validation: dict) -> bool:
        return not (
            validation["grounding"]["score"] < 0.8
            or validation["constraints"]["score"] < 0.8
            or validation["judge"]["overall_score"] < 0.75
            or validation["judge"]["should_regenerate"]
        )

    # First generation attempt
    current_output = generate_final(user_request, plan_json, rag_pack, search_pack)
    current_validation = validate_output(user_request, plan_json, rag_pack, search_pack, current_output)

    print("\nATTEMPT 1 VALIDATION")
    print(json.dumps(current_validation, indent=2))

    if passes_validation(current_validation):
        print("\nGeneration passed validation on attempt 1.")
        return {
            "output": current_output,
            "validation": current_validation,
            "plan": plan_json,
            "success": True,
            "attempts_used": 1,
        }

    # Retry only if validation failed
    for attempt in range(2, max_attempts + 1):
        print(f"\nAttempt {attempt - 1} failed validation. Regenerating (attempt {attempt})...\n")

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

        print(f"\nATTEMPT {attempt} VALIDATION")
        print(json.dumps(current_validation, indent=2))

        if passes_validation(current_validation):
            print(f"\nGeneration passed validation on attempt {attempt}.")
            return {
                "deliverable": {
                    "content": current_output,
                    "type": plan_json.get("deliverable_type"),
                },
                "validation": {
                    "report": current_validation,
                    "success": True,
                    "attempts_used": attempt,
                },
                "plan": plan_json,
            }

    print(f"\nGeneration failed validation after {max_attempts} total attempts.")

    return {
    "deliverable": {
        "content": current_output,
        "type": plan_json.get("deliverable_type"),
    },
    "validation": {
        "report": current_validation,
        "success": False,
        "attempts_used": max_attempts,
        "message": f"Generation failed validation after {max_attempts} attempts.",
    },
    "plan": plan_json,
    }