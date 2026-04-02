import json
import re
from google.genai import types
from app.core.ai_client import client
from app.core.config import DEFAULT_MODEL
from app.models.schemas import EVAL_SCHEMA
from datetime import datetime


# Extract standards-like codes from visible output text for diagnostics only
def extract_standard_codes(text: str) -> list[str]:
    pattern = r"\b[A-Z]{1,3}(?:\.[A-Z0-9]+)+(?:\.[0-9]+)?\b|\b[A-Z]{1,4}-[A-Z0-9.-]+\b"
    return sorted(set(re.findall(pattern, text)))


# Check whether the generated output satisfies the requested constraints
def check_constraints(output: str, request_context: dict) -> dict:
    constraints = request_context.get("generation_constraints", [])
    if not constraints:
        return {
            "score": 1.0,
            "missed": [],
            "used": [],
        }

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
        "used": constraints,
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
            "Grounding guidance:\n"
            "- grounding_score measures whether the generated content is consistent with and supported by the retrieved standards.\n"
            "- Student-facing outputs do NOT need to visibly show standards codes or titles.\n"
            "- Do NOT lower grounding_score simply because standards codes are hidden from the final deliverable.\n"
            "- Judge grounding based on alignment of concepts, difficulty, tasks, and objectives to the retrieved standards.\n"
            "- If the generated content clearly matches the retrieved standards, grounding_score should still be high even when no codes appear in the output.\n\n"
            "Constraint guidance:\n"
            "- constraint_score measures how well the output follows the requested deliverable type, answer key expectations, and other explicit requirements.\n\n"
            "Age appropriateness guidance:\n"
            "- age_appropriateness_score measures whether the language, difficulty, and task design fit the learner level implied by the request context.\n\n"
            f"USER REQUEST:\n{user_request}\n\n"
            f"REQUEST CONTEXT:\n{json.dumps(request_context, indent=2)}\n\n"
            f"RETRIEVED STANDARDS:\n{json.dumps(retrieval_result, indent=2)}\n\n"
            f"GENERATED OUTPUT:\n{output}\n\n"
            "Evaluate whether the output:\n"
            "1. aligns with the retrieved standards,\n"
            "2. satisfies the requested deliverable and constraints,\n"
            "3. is age-appropriate,\n"
            "4. should be regenerated.\n"
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EVAL_SCHEMA,
            temperature=0.1,
        ),
    )
    return json.loads(resp.text)


# Format the validation dict into your pretty report string
def format_validation_report(validation: dict, request_context: dict) -> str:
    date = datetime.today().strftime('%Y-%m-%d')

    standards_used = validation.get("standards_used", [])
    explicit_codes_in_output = validation.get("explicit_codes_in_output", [])
    constraints = validation.get("constraints", {})
    judge = validation.get("judge", {})

    standards_block = "\n".join(standards_used) if standards_used else "No standards used"
    visible_codes_block = "\n".join(explicit_codes_in_output) if explicit_codes_in_output else "No visible codes in output"
    constraints_used_block = "\n".join(constraints.get("used", [])) if constraints.get("used") else "No constraints used"
    constraints_missed_block = "\n".join(constraints.get("missed", [])) if constraints.get("missed") else "No constraints missed"

    issues = judge.get("issues", [])
    issues_block = "\n".join(issues) if issues else "No issues to report"

    return f"""

{request_context["subject"]} {request_context["deliverable_type"]} for grades {request_context["grade_band"]}


Standards Used

{standards_block}


Visible Codes in Output

{visible_codes_block}


Constraints Used

{constraints_used_block}


Constraints Missed

{constraints_missed_block}


Final Validation Scores (0 = Worst, 1 = Best)

Structure OK: {judge.get("structure_ok")}
Standards Grounding Score: {judge.get("grounding_score")}
Constraints Score: {constraints.get("score")}
Age-Appropriateness Score: {judge.get("age_appropriateness_score")}

Issues
{issues_block}

FINAL SCORE: {judge.get("overall_score")}
    """.strip()


# Run all validation checks and combine results into a report
def validate_output(
    user_request: str,
    request_context: dict,
    retrieval_result: dict,
    output: str,
) -> dict:
    standards_used = [
        f"Code {std['code']}: {std['title']}"
        for std in retrieval_result.get("standards", [])
    ]

    explicit_codes_in_output = extract_standard_codes(output)
    constraints = check_constraints(output, request_context)
    judge = judge_output(user_request, request_context, retrieval_result, output)

    validation = {
        "standards_used": standards_used,
        "explicit_codes_in_output": explicit_codes_in_output,
        "constraints": constraints,
        "judge": judge,
    }

    validation["report"] = format_validation_report(validation, request_context)
    return validation