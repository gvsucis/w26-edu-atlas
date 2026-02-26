from google import genai
from google.genai import types
from google.oauth2 import service_account
import json
import time
from dotenv import load_dotenv
import os

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
        "grade": types.Schema(type="STRING"),  # optional by "required" list below
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
    # With response_mime_type json, resp.text should already be JSON
    return json.loads(resp.text)


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

def run(user_request: str) -> str:
    p = plan(user_request)
    rag_pack = retrieve(p["rag_queries"]) if p.get("standards_needed", True) else ""
    search_pack = web_search_context(user_request, p) if p.get("needs_web_search", False) else None
    return generate_final(user_request, p, rag_pack, search_pack)

print(run("Create a 7th grade science quiz on ecosystems with Michigan standards and an answer key."))
# The prompt will go in here, it's hardcoded for now