from google.auth import default
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/drive"]

def get_drive_service():
    credentials, _ = default(scopes=SCOPES)
    service = build("drive", "v3", credentials=credentials)
    return service