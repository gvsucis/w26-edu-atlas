import json
import re
from google.genai import types
from app.core.ai_client import client
from app.core.config import DEFAULT_MODEL
from app.models.schemas import EVAL_SCHEMA

# Extract standards-like codes from visible output text for diagnostics only
def extract_standard_codes(text: str) -> list[str]:
    pattern = r"\b[A-Z]{1,3}(?:\.[A-Z0-9]+)+(?:\.[0-9]+)?\b|\b[A-Z]{1,4}-[A-Z0-9.-]+\b"
    return sorted(set(re.findall(pattern, text)))


# Check whether the generated output satisfies the requested constraints
def check_constraints(output: str, request_context: dict) -> dict:
    constraints = request_context.get("generation_constraints", [])
    if not constraints:
        return {"score": 1.0, "missed": []}

    output_lower = output.lower()
    missed = []

    for constraint in constraints:
        c = constraint.lower()

        if "answer key" in c and "answer key" not in output_lower:
            missed.append(constraint)
        elif "rubric" in c and "rubric" not in output_lower:
            missed.append(constraint)
        elif "standards" in c and "standard" not in output_lower:
            missed.append(constraint)

    score = (len(constraints) - len(missed)) / len(constraints) if constraints else 1.0
    return {
        "score": round(score, 3),
        "missed": missed,
    }


# Use Gemini as an evaluator to score the generated output
def judge_output(user_request: str, request_context: dict, retrieval_result: dict, output: str) -> dict:
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=(
            "Evaluate the generated K-12 deliverable.\n"
            "Be strict. Return ONLY JSON matching the schema.\n\n"
            "Scoring rules:\n"
            "- grounding_score must be a decimal from 0.0 to 1.0 only.\n"
            "- constraint_score must be a decimal from 0.0 to 1.0 only.\n"
            "- age_appropriateness_score must be a decimal from 0.0 to 1.0 only.\n"
            "- overall_score must be a decimal from 0.0 to 1.0 only.\n"
            "- Do not use a 1-5 scale.\n\n"
            f"REQUEST CONTEXT:\n{json.dumps(request_context, indent=2)}\n\n"
            f"RETRIEVED STANDARDS:\n{json.dumps(retrieval_result, indent=2)}\n\n"
            f"GENERATED OUTPUT:\n{output}\n\n"
            "Judge whether the output is consistent with the retrieved standards, satisfies the request, "
            "and is age-appropriate. Student-facing outputs do not need to visibly show standards codes."
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EVAL_SCHEMA,
            temperature=0.1,
        ),
    )
    return json.loads(resp.text)


# Run all validation checks and combine results into a report
def validate_output(
    user_request: str,
    request_context: dict,
    retrieval_result: dict,
    output: str,
) -> dict:
    standards_used = [
        {
            "code": std["code"],
            "title": std["title"],
        }
        for std in retrieval_result.get("standards", [])
    ]

    explicit_codes_in_output = extract_standard_codes(output)
    constraints = check_constraints(output, request_context)
    judge = judge_output(user_request, request_context, retrieval_result, output)

    return {
        "standards_used": standards_used,
        "explicit_codes_in_output": explicit_codes_in_output,
        "constraints": constraints,
        "judge": judge,
    }