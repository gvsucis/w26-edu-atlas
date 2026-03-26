import json
from google.genai import types
from app.core.ai_client import client, rag_tool
from app.core.config import DEFAULT_MODEL
from app.models.schemas import GenerateRequest, RETRIEVAL_SCHEMA

# Build RAG queries directly from structured frontend inputs
def build_rag_queries(req: GenerateRequest) -> list[str]:
    queries = [
        f"{req.subject} {req.lesson_topic} standards",
        f"{req.subject} {req.deliverable_type} standards",
        f"{req.subject} curriculum standards",
    ]

    for obj in req.objectives[:3]:
        queries.append(f"{req.subject} {obj.text} standards")

    seen = set()
    deduped = []

    for q in queries:
        key = q.strip().lower()
        if key and key not in seen:
            seen.add(key)
            deduped.append(q)

    return deduped


# Retrieve structured standards from the RAG corpus
def retrieve(rag_queries: list[str]) -> dict:
    q = "\n".join(f"- {x}" for x in rag_queries)

    if not q.strip():
        raise ValueError("retrieve received empty rag_queries.")

    resp = client.models.generate_content(
        model=DEFAULT_MODEL,
        contents=(
            "Use ONLY the RAG corpus.\n"
            "Return ONLY JSON matching the schema.\n"
            "Retrieve the most relevant official standards for this request.\n"
            "For each standard, include:\n"
            "- exact code\n"
            "- exact title\n"
            "- short supporting excerpt\n\n"
            f"RAG QUERIES:\n{q}"
        ),
        config=types.GenerateContentConfig(
            tools=[rag_tool],
            system_instruction="RAG only. No outside knowledge.",
            response_mime_type="application/json",
            response_schema=RETRIEVAL_SCHEMA,
        ),
    )

    result = json.loads(resp.text)

    if not result.get("standards"):
        raise ValueError("RAG retrieval returned no standards.")

    return result