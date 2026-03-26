import json
from app.core.ai_client import client
from app.core.config import DEFAULT_MODEL


def generate_final(generation_prompt: str) -> str:
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=generation_prompt,
    )
    return resp.text


# Regenerate the response using validation feedback if quality is insufficient
def regenerate_with_feedback(
    generation_prompt: str,
    previous_output: str,
    validation: dict,
) -> str:
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
            f"ORIGINAL GENERATION PROMPT:\n{generation_prompt}\n\n"
            f"PREVIOUS OUTPUT:\n{previous_output}\n\n"
            f"VALIDATION FEEDBACK:\n{feedback}\n\n"
            "Produce a corrected final version."
        ),
    )
    return resp.text