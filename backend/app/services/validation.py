import json
import re
from google.genai import types
from app.core.ai_client import client
from app.core.config import DEFAULT_MODEL
from app.models.schemas import EVAL_SCHEMA

# Extract potential education standard codes from generated text
def extract_standard_codes(text: str) -> list[str]:
    # Looks for dot separated or hyphen separated codes, not exact but good for validation
    pattern = r"\b[A-Z]{1,3}(?:\.[A-Z0-9]+)+(?:\.[0-9]+)?\b|\b[A-Z]{1,4}-[A-Z0-9.-]+\b"
    return sorted(set(re.findall(pattern, text)))


# Verify that cited standards appear in the retrieved RAG content
def check_grounding(output: str, rag_pack: str) -> dict:
    cited_codes = extract_standard_codes(output)
    grounded_codes = [code for code in cited_codes if code in rag_pack]
    ungrounded_codes = [code for code in cited_codes if code not in rag_pack]

    # Check all codes and see which were in rag pack and which weren't
    score = 1.0
    if cited_codes:
        score = len(grounded_codes) / len(cited_codes)

    return {
        "cited_codes": cited_codes,
        "grounded_codes": grounded_codes,
        "ungrounded_codes": ungrounded_codes,
        "score": round(score, 3),
    }


# Check whether the generated output satisfies the requested constraints
def check_constraints(output: str, plan_json: dict) -> dict:
    constraints = plan_json.get("generation_constraints", [])
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

    score = (len(constraints) - len(missed)) / len(constraints)
    return {
        "score": round(score, 3),
        "missed": missed,
    }


# Use Gemini as an evaluator to score the generated output
def judge_output(user_request: str, plan_json: dict, rag_pack: str, search_pack: str | None, output: str) -> dict:
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=(
            "Evaluate the generated K-12 deliverable.\n"
            "Be strict. Return ONLY JSON matching the schema.\n\n"
            f"USER REQUEST:\n{user_request}\n\n"
            f"PLAN JSON:\n{json.dumps(plan_json, indent=2)}\n\n"
            f"RAG PACK:\n{rag_pack}\n\n"
            f"SEARCH PACK:\n{search_pack or 'N/A'}\n\n"
            f"GENERATED OUTPUT:\n{output}\n\n"
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=EVAL_SCHEMA,
            temperature=0.1,
        ),
    )
    return json.loads(resp.text)


# Run all validation checks and combine results into a report
def validate_output(user_request: str, plan_json: dict, rag_pack: str, search_pack: str | None, output: str) -> dict:
    grounding = check_grounding(output, rag_pack)
    constraints = check_constraints(output, plan_json)
    judge = judge_output(user_request, plan_json, rag_pack, search_pack, output)

    return {
        "grounding": grounding,
        "constraints": constraints,
        "judge": judge,
    }