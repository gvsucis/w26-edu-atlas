import json
from app.models.schemas import GenerateRequest
from app.services.retrieval import retrieve, build_rag_queries
from app.services.request_builder import build_generation_prompt
from app.services.generation import generate_final, regenerate_with_feedback
from app.services.validation import validate_output

# Main orchestration function using direct frontend inputs and mandatory RAG retrieval
def run_pipeline(req: GenerateRequest, max_attempts: int = 3) -> dict:
    rag_queries = build_rag_queries(req)

    print("\nRAG QUERIES")
    print(json.dumps(rag_queries, indent=2))

    rag_pack = retrieve(rag_queries)

    if not rag_pack or not rag_pack.strip():
        raise ValueError("RAG retrieval returned empty content. Standards/context are required for generation.")

    print("\nRAG PACK PREVIEW")
    print(rag_pack[:1000])

    generation_prompt = build_generation_prompt(req, rag_pack)

    def passes_validation(validation: dict) -> bool:
        return not (
            validation["grounding"]["score"] < 0.8
            or validation["constraints"]["score"] < 0.8
            or validation["judge"]["overall_score"] < 0.75
            or validation["judge"]["should_regenerate"]
        )

    # First generation attempt
    current_output = generate_final(generation_prompt)
    current_validation = validate_output(
        user_request=generation_prompt,
        plan_json={
            "subject": req.subject,
            "lesson_topic": req.lesson_topic,
            "deliverable_type": req.deliverable_type,
            "duration_minutes": req.duration_minutes,
            "objectives": [obj.model_dump() for obj in req.objectives],
        },
        rag_pack=rag_pack,
        search_pack=None,
        output=current_output,
    )

    print("\nATTEMPT 1 VALIDATION")
    print(json.dumps(current_validation, indent=2))

    if passes_validation(current_validation):
        print("\nGeneration passed validation on attempt 1.")
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
                "rag_queries": rag_queries,
            },
        }

    # Sequential regeneration attempts
    for attempt in range(2, max_attempts + 1):
        print(f"\nAttempt {attempt - 1} failed validation. Regenerating (attempt {attempt})...\n")

        current_output = regenerate_with_feedback(
            generation_prompt=generation_prompt,
            previous_output=current_output,
            validation=current_validation,
        )

        current_validation = validate_output(
            user_request=generation_prompt,
            plan_json={
                "subject": req.subject,
                "lesson_topic": req.lesson_topic,
                "deliverable_type": req.deliverable_type,
                "duration_minutes": req.duration_minutes,
                "objectives": [obj.model_dump() for obj in req.objectives],
            },
            rag_pack=rag_pack,
            search_pack=None,
            output=current_output,
        )

        print(f"\nATTEMPT {attempt} VALIDATION")
        print(json.dumps(current_validation, indent=2))

        if passes_validation(current_validation):
            print(f"\nGeneration passed validation on attempt {attempt}.")
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
                    "rag_queries": rag_queries,
                },
            }

    print(f"\nGeneration failed validation after {max_attempts} total attempts.")

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
            "rag_queries": rag_queries,
        },
    }