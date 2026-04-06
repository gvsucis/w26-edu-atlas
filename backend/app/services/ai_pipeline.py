import json
from app.models.schemas import GenerateRequest
from app.services.retrieval import retrieve, build_rag_queries
from app.services.request_builder import build_generation_prompt
from app.services.generation import generate_final, regenerate_with_feedback
from app.services.validation import validate_output

# Will be used to determine if we should regenerate the content or not
def passes_validation(validation: dict) -> bool:
    constraints = validation.get("constraints", {})
    judge = validation.get("judge", {})

    constraint_score = constraints.get("score", 0.0)
    overall_score = judge.get("overall_score", 0.0)
    should_regenerate = judge.get("should_regenerate", True)
    judge_mode = judge.get("judge_mode", "llm")

    # If we used the cheap validator, trust constraints + cheap regeneration signal
    if judge_mode == "fast":
        return not (
            constraint_score < 0.8
            or should_regenerate
        )

    # If we used the full LLM judge, also require overall score
    return not (
        constraint_score < 0.8
        or overall_score < 0.75
        or should_regenerate
    )


# Main orchestration function using structured retrieval metadata
def run_pipeline(req: GenerateRequest, max_attempts: int = 3) -> dict:
    rag_queries = build_rag_queries(req)

    print("\nRAG QUERIES")
    print(json.dumps(rag_queries, indent=2))

    retrieval_result = retrieve(rag_queries)

    print("\nRETRIEVAL RESULT")
    print(json.dumps(retrieval_result, indent=2)[:1500])

    generation_prompt = build_generation_prompt(req, retrieval_result)

    request_context = {
        "grade_band": req.grade_band,
        "subject": req.subject,
        "lesson_topic": req.lesson_topic,
        "deliverable_type": req.deliverable_type,
        "duration_minutes": req.duration_minutes,
        "classroom_context": req.classroom_context,
        "objectives": [obj.model_dump() for obj in req.objectives],
        "generation_constraints": (
            ["include answer key"]
            if req.deliverable_type in {"Quiz", "Exam", "Homework", "Worksheet"}
            else []
        ),
    }

    current_output = generate_final(generation_prompt)
    current_validation = validate_output(
        user_request=generation_prompt,
        request_context=request_context,
        retrieval_result=retrieval_result,
        output=current_output,
        force_judge=False,
    )

    print("\nATTEMPT 1 VALIDATION")
    print(current_validation["report"])

    if passes_validation(current_validation):
        return {
            "deliverable": {
                "content": current_output,
                "type": req.deliverable_type,
            },
            "validation": {
                "report": current_validation["report"],
                "raw": current_validation,
                "success": True,
                "attempts_used": 1,
            },
            "metadata": {
                "rag_queries": rag_queries,
            },
        }

    for attempt in range(2, max_attempts + 1):
        print(f"\nAttempt {attempt - 1} failed validation. Regenerating (attempt {attempt})...\n")

        current_output = regenerate_with_feedback(
            generation_prompt=generation_prompt,
            previous_output=current_output,
            validation=current_validation,
        )

        current_validation = validate_output(
            user_request=generation_prompt,
            request_context=request_context,
            retrieval_result=retrieval_result,
            output=current_output,
            force_judge=True,
        )

        print(f"\nATTEMPT {attempt} VALIDATION")
        print(current_validation["report"])

        if passes_validation(current_validation):
            return {
                "deliverable": {
                    "content": current_output,
                    "type": req.deliverable_type,
                },
                "validation": {
                    "report": current_validation["report"],
                    "raw": current_validation,
                    "success": True,
                    "attempts_used": attempt,
                },
                "metadata": {
                    "rag_queries": rag_queries,
                },
            }

    return {
        "deliverable": {
            "content": current_output,
            "type": req.deliverable_type,
        },
        "validation": {
            "report": current_validation["report"],
            "raw": current_validation,
            "success": False,
            "attempts_used": max_attempts,
            "message": f"Generation failed validation after {max_attempts} attempts.",
        },
        "metadata": {
            "rag_queries": rag_queries,
        },
    }