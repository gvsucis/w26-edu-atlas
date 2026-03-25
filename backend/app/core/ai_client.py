from google import genai
from google.genai import types
from app.core.config import GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, RAG_CORPUS

client = genai.Client(
    vertexai=True,
    project=GOOGLE_CLOUD_PROJECT,
    location=GOOGLE_CLOUD_LOCATION,
    http_options=types.HttpOptions(api_version="v1")
)

rag_tool = types.Tool(
    retrieval=types.Retrieval(
        vertex_rag_store=types.VertexRagStore(
            rag_resources=[types.VertexRagStoreRagResource(rag_corpus=RAG_CORPUS)],
            similarity_top_k=5,
        )
    )
)

search_tool = types.Tool(google_search=types.GoogleSearch())