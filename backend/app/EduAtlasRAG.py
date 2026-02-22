# from google.cloud import aiplatform

# # Initialize the RAG Engine
# rag_corpus = aiplatform.create_rag_corpus(
#     display_name="edu_standards_corpus",
#     embedding_model_config={
#         "publisher_model": "projects/your-project/locations/us-central1/publishers/google/models/text-embedding-005"
#     }
# )

# # Import your standards from Google Drive
# # (This uses the OAuth 'User Data' credentials we discussed)
# aiplatform.import_rag_files(
#     rag_corpus.name,
#     source_location="https://www.googleapis.com/drive/v3/files/YOUR_FOLDER_ID",
#     file_type="PDF"
# )


from vertexai.preview import rag
from vertexai.preview.generative_models import GenerativeModel, Tool
import vertexai

# 1. Initialize the connection
vertexai.init(project="eduatlas-487900", location="us-east5")

# 2. Define the RAG Tool using your Corpus ID
rag_resource = rag.RagResource(
    rag_corpus="projects/eduatlas-487900/locations/us-east5/ragCorpora/6917529027641081856"
)

rag_retrieval_tool = Tool.from_retrieval(
    retrieval=rag.Retrieval(
        source=rag.VertexRagStore(
            rag_resources=[rag_resource],
            similarity_top_k=5,  # Number of standards to pull
        ),
    )
)

# 3. Create the model with the tool attached
model = GenerativeModel("gemini-2.5-flash", tools=[rag_retrieval_tool])

# 4. Ask a question!
response = model.generate_content("Check if this activity aligns with Michigan 4th grade ELA: 'Writing a 500-word story about a pet.'")
print(response.text)