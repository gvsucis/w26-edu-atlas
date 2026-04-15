from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes.generate import router as generate_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)

@app.get("/health")
def health_check():
    try:
        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})

# @app.post("/generate")
# def generate(req: GenerateRequest):
#     return {
#         "output": f"Stub response for: {req.user_request}",
#         "validation": {"status": "ok"}
#     }