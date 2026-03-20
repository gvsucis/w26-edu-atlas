from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/health")
def health_check():
    try:
        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "detail": str(e)})
