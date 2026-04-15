from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.generate import router as generate_router
from app.routes.drive_routes import router as drive_router

app = FastAPI(title="EduAtlas Backend")
app.include_router(drive_router)

# Block requests from different origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# Bring in generate endpoint
app.include_router(generate_router)