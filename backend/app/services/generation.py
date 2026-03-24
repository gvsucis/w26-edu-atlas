import json
from app.core.ai_client import client
from app.core.config import DEFAULT_MODEL

# Generate the final deliverable using the plan, RAG results, and optional web context
def generate_final(user_request: str, plan_json: dict, rag_pack: str, search_pack: str | None) -> str:
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=(
            "Create the requested K-12 deliverable.\n"
            "You MUST ground standards and official requirements ONLY in the RAG pack.\n"
            "You MAY use the search pack only for examples/context, not for standards.\n\n"
            f"USER REQUEST:\n{user_request}\n\n"
            f"PLAN JSON:\n{plan_json}\n\n"
            f"RAG PACK (standards + official snippets):\n{rag_pack}\n\n"
            f"SEARCH PACK (optional context):\n{search_pack or 'N/A'}\n\n"
            "Output requirements:\n"
            # These can be tailored in the future
            "- Clearly label standards used (codes + titles) and map each item/task to standards.\n"
            "- Keep language age-appropriate for the grade.\n"
            "- Include answer key/rubric when relevant.\n"
        ),
    )
    return resp.text


# Regenerate the response using validation feedback if quality is insufficient
def regenerate_with_feedback(
    user_request: str,
    plan_json: dict,
    rag_pack: str,
    search_pack: str | None,
    previous_output: str,
    validation: dict, ) -> str:
    feedback_parts = []

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
        model=DEFAULT_MODEL,
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