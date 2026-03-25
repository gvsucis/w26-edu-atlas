from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest
from app.services.ai_pipeline import run_pipeline

router = APIRouter()

@router.post("/generate")
def generate(req: GenerateRequest):
    try:
        return run_pipeline(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))