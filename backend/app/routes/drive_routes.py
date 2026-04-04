from fastapi import APIRouter
from app.services.drive_service import get_drive_service
from app.core.config import SHARED_DRIVE_ID

router = APIRouter()

@router.get("/drive-test")
def test_drive():
    service = get_drive_service()

    results = service.files().list(
        pageSize=5,
        fields="files(id, name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
        corpora="drive",
        driveId=SHARED_DRIVE_ID
    ).execute()

    return results