from google import genai
from google.genai import types
from google.oauth2 import service_account
import json
import time
from dotenv import load_dotenv
import os
import re

load_dotenv()

RAG_CORPUS = "projects/eduatlas-487900/locations/us-east5/ragCorpora/6917529027641081856"

client = genai.Client(
    vertexai=True,
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_LOCATION"),
    http_options=types.HttpOptions(api_version="v1")
)
    


rag_tool = types.Tool(
    retrieval=types.Retrieval(
        vertex_rag_store=types.VertexRagStore(
            rag_resources=[types.VertexRagStoreRagResource(rag_corpus=RAG_CORPUS)],
            similarity_top_k=8,
        )
    )
)

search_tool = types.Tool(google_search=types.GoogleSearch())

PLAN_SCHEMA = types.Schema(
    type="OBJECT",
    properties={
        "grade_band": types.Schema(type="STRING"),
        "grade": types.Schema(type="STRING"),
        "subject": types.Schema(type="STRING"),
        "deliverable_type": types.Schema(type="STRING"),
        "standards_needed": types.Schema(type="BOOLEAN"),
        "needs_web_search": types.Schema(type="BOOLEAN"),
        "rag_queries": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
        "generation_constraints": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
    },
    required=[
        "grade_band",
        "subject",
        "deliverable_type",
        "standards_needed",
        "needs_web_search",
        "rag_queries",
        "generation_constraints",
    ],
)

EVAL_SCHEMA = types.Schema(
    type="OBJECT",
    properties={
        "structure_ok": types.Schema(type="BOOLEAN"),
        "grounding_score": types.Schema(type="NUMBER"),
        "constraint_score": types.Schema(type="NUMBER"),
        "age_appropriateness_score": types.Schema(type="NUMBER"),
        "overall_score": types.Schema(type="NUMBER"),
        "issues": types.Schema(type="ARRAY", items=types.Schema(type="STRING")),
        "should_regenerate": types.Schema(type="BOOLEAN"),
    },
    required=[
        "structure_ok",
        "grounding_score",
        "constraint_score",
        "age_appropriateness_score",
        "overall_score",
        "issues",
        "should_regenerate",
    ],
)


# Convert user request into a structured execution plan
def plan(user_request: str) -> dict:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Return ONLY JSON matching the schema.\n"
            "If an exact grade is not specified, omit `grade` or set it to an empty string.\n"
            f"USER REQUEST: {user_request}"
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PLAN_SCHEMA,
            temperature=0.2,
        ),
    )
    return json.loads(resp.text)


# Retrieve relevant standards and excerpts from the RAG corpus
def retrieve(rag_queries: list[str]) -> str:
    q = "\n".join(f"- {x}" for x in rag_queries)
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Use ONLY the RAG corpus. Retrieve the most relevant official standards/snippets.\n"
            "Return a structured result:\n"
            "1) Standards list with codes + exact titles\n"
            "2) Short excerpts (quoted) if available\n"
            "3) Notes on grade/subject alignment\n\n"
            f"RAG QUERIES:\n{q}"
        ),
        config=types.GenerateContentConfig(
            tools=[rag_tool],
            system_instruction="RAG only. No outside knowledge.",
        ),
    )
    return resp.text


# Gather supplemental background/context using Google Search if needed
def web_search_context(user_request: str, plan_json: dict) -> str:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Use Google Search to gather a small amount of high-quality background/context "
            "to support the deliverable. Prefer authoritative sources (state DOE, districts, "
            "major publishers, universities). Summarize in 8-12 bullets.\n\n"
            f"REQUEST: {user_request}\n"
            f"CONSTRAINTS: {plan_json.get('generation_constraints', [])}"
        ),
        config=types.GenerateContentConfig(
            tools=[search_tool],
            system_instruction="Google Search only.",
        ),
    )
    return resp.text


# Generate the final educational artifact using the plan, RAG results, and optional web context
def generate_final(user_request: str, plan_json: dict, rag_pack: str, search_pack: str | None) -> str:
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Create the requested K-12 deliverable.\n"
            "You MUST ground standards and official requirements ONLY in the RAG pack.\n"
            "You MAY use the search pack only for examples/context, not for standards.\n\n"
            f"USER REQUEST:\n{user_request}\n\n"
            f"PLAN JSON:\n{plan_json}\n\n"
            f"RAG PACK (standards + official snippets):\n{rag_pack}\n\n"
            f"SEARCH PACK (optional context):\n{search_pack or 'N/A'}\n\n"
            "Output requirements:\n"
            "- Clearly label standards used (codes + titles) and map each item/task to standards.\n"
            "- Keep language age-appropriate for the grade.\n"
            "- Include answer key/rubric when relevant.\n"
        ),
    )
    return resp.text


# Extract potential education standard codes from generated text
def extract_standard_codes(text: str) -> list[str]:
    """
    Very simple regex for common standards-style codes.
    You may want to tune this later for Michigan-specific formatting.
    """
    pattern = r"\b[A-Z]{1,3}(?:\.[A-Z0-9]+)+(?:\.[0-9]+)?\b|\b[A-Z]{1,4}-[A-Z0-9.-]+\b"
    return sorted(set(re.findall(pattern, text)))


# Check that required sections (e.g., standards, answer key) exist in the output
def check_structure(output: str, plan_json: dict) -> dict:
    required_markers = ["standards"]
    deliverable = plan_json.get("deliverable_type", "").lower()
    constraints = [c.lower() for c in plan_json.get("generation_constraints", [])]

    if "answer key" in " ".join(constraints) or deliverable in {"quiz", "exam", "test"}:
        required_markers.append("answer key")

    missing = [marker for marker in required_markers if marker not in output.lower()]

    return {
        "ok": len(missing) == 0,
        "missing": missing,
    }


# Verify that cited standards appear in the retrieved RAG content
def check_grounding(output: str, rag_pack: str) -> dict:
    cited_codes = extract_standard_codes(output)
    grounded_codes = [code for code in cited_codes if code in rag_pack]
    ungrounded_codes = [code for code in cited_codes if code not in rag_pack]

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
        model="gemini-2.5-flash",
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
    # structure = check_structure(output, plan_json)
    grounding = check_grounding(output, rag_pack)
    constraints = check_constraints(output, plan_json)
    judge = judge_output(user_request, plan_json, rag_pack, search_pack, output)

    return {
        # "structure": structure,
        "grounding": grounding,
        "constraints": constraints,
        "judge": judge,
    }


# Regenerate the response using validation feedback if quality is insufficient
def regenerate_with_feedback(
    user_request: str,
    plan_json: dict,
    rag_pack: str,
    search_pack: str | None,
    previous_output: str,
    validation: dict,
) -> str:
    feedback_parts = []

    # if not validation["structure"]["ok"]:
    #     feedback_parts.append(
    #         f"Missing required sections: {validation['structure']['missing']}"
    #     )

    if validation["grounding"]["ungrounded_codes"]:
        feedback_parts.append(
            f"These cited standards were not found in the RAG pack: {validation['grounding']['ungrounded_codes']}"
        )

    if validation["constraints"]["missed"]:
        feedback_parts.append(
            f"Missed constraints: {validation['constraints']['missed']}"
        )

    if validation["judge"]["issues"]:
        feedback_parts.append(
            f"Evaluator issues: {validation['judge']['issues']}"
        )

    feedback = "\n".join(f"- {x}" for x in feedback_parts) if feedback_parts else "- Improve clarity."

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=(
            "Create a NEW, COMPLETE, CLEAN final version of the deliverable.\n"
            "Do NOT continue or partially edit the previous version.\n"
            "Do NOT repeat sections.\n"
            "Do NOT include notes about revision, evaluation, or validation.\n"
            "Return only the final deliverable text.\n\n"
            "You MUST ground standards and official requirements ONLY in the RAG pack.\n"
            "You MAY use the search pack only for examples/context, not for standards.\n\n"
            f"USER REQUEST:\n{user_request}\n\n"
            f"PLAN JSON:\n{json.dumps(plan_json, indent=2)}\n\n"
            f"RAG PACK:\n{rag_pack}\n\n"
            f"SEARCH PACK:\n{search_pack or 'N/A'}\n\n"
            f"PREVIOUS OUTPUT:\n{previous_output}\n\n"
            f"VALIDATION FEEDBACK:\n{feedback}\n\n"
            "Produce a corrected final version."
        ),
    )
    return resp.text


# Main orchestration function that runs planning, retrieval, search, generation, and validation
def run(user_request: str) -> str:
    plan_json = plan(user_request)
    rag_pack = retrieve(plan_json["rag_queries"]) if plan_json.get("standards_needed", True) else ""
    search_pack = web_search_context(user_request, plan_json) if plan_json.get("needs_web_search", False) else None

    original_output = generate_final(user_request, plan_json, rag_pack, search_pack)
    original_validation = validate_output(user_request, plan_json, rag_pack, search_pack, original_output)

    print("\nVALIDATION REPORT")
    print(json.dumps(original_validation, indent=2))

    should_regenerate = (
        original_validation["grounding"]["score"] < 0.8
        or original_validation["constraints"]["score"] < 0.8
        or original_validation["judge"]["overall_score"] < 0.75
        or original_validation["judge"]["should_regenerate"]
    )

    if not should_regenerate:
        return original_output

    print("\nRegenerating once based on validation feedback...\n")

    regenerated_output = regenerate_with_feedback(
        user_request=user_request,
        plan_json=plan_json,
        rag_pack=rag_pack,
        search_pack=search_pack,
        previous_output=original_output,
        validation=original_validation,
    )

    regenerated_validation = validate_output(
        user_request,
        plan_json,
        rag_pack,
        search_pack,
        regenerated_output
    )

    print("\nSECOND VALIDATION REPORT")
    print(json.dumps(regenerated_validation, indent=2))

    original_score = original_validation["judge"]["overall_score"]
    regenerated_score = regenerated_validation["judge"]["overall_score"]

    original_grounding = original_validation["grounding"]["score"]
    regenerated_grounding = regenerated_validation["grounding"]["score"]

    original_constraints = original_validation["constraints"]["score"]
    regenerated_constraints = regenerated_validation["constraints"]["score"]

    if (
        regenerated_grounding > original_grounding
        or regenerated_constraints > original_constraints
        or regenerated_score >= original_score
    ):
        return regenerated_output

    return original_output

print(run("Create a 7th grade science quiz on ecosystems with Michigan standards and an answer key."))
# The prompt will go in here, it's hardcoded for now