from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest
from app.services.ai_pipeline import run_pipeline

# Define endpoint to later plug into the app
router = APIRouter()

# This is where the run_pipeline dictionary goes to the frontend as JSON for the final output
@router.post("/generate")
def generate(req: GenerateRequest):
    try:
        return run_pipeline(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))