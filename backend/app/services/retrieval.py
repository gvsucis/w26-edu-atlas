import json
from app.core.ai_client import client, rag_tool, search_tool
from app.core.config import DEFAULT_MODEL
from app.models.schemas import PLAN_SCHEMA
from google.genai import types
from app.models.schemas import GenerateRequest

# Build RAG queries directly from structured frontend inputs
def build_rag_queries(req: GenerateRequest) -> list[str]:
    queries = [
        f"{req.subject} {req.lesson_topic} standards",
        f"{req.subject} {req.deliverable_type} standards",
        f"{req.subject} curriculum standards",
    ]

    for obj in req.objectives[:3]:
        queries.append(f"{req.subject} {obj.text} standards")

    # Remove duplicates while preserving order
    seen = set()
    deduped = []
    for q in queries:
        key = q.strip().lower()
        if key and key not in seen:
            seen.add(key)
            deduped.append(q)

    return deduped


# Convert user request into a filled PLAN_SCHEMA json
def plan(user_request: str) -> dict:
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=(
            "Return ONLY JSON matching the schema.\n"
            "If an exact grade is not specified, omit `grade` or set it to an empty string.\n"
            f"USER REQUEST: {user_request}"
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PLAN_SCHEMA,
            temperature=0.8,
        ),
    )
    return json.loads(resp.text)


# Retrieve relevant standards and excerpts from the RAG corpus using the rag_queries plan field
def retrieve(rag_queries: list[str]) -> str:
    q = "\n".join(f"- {x}" for x in rag_queries)
    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
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
        model=DEFAULT_MODEL,
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
