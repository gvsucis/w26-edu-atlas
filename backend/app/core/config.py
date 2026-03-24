import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")

RAG_CORPUS = "projects/eduatlas-487900/locations/us-east5/ragCorpora/6917529027641081856"
DEFAULT_MODEL = "gemini-2.5-flash"

