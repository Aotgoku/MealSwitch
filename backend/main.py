# backend/main.py
from backend.core import config
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import logging
import traceback

# --- CORRECTED IMPORT ---
# Tell Python to look inside the 'backend' package for the 'api' module
from backend.api import endpoints

# --- CORRECTED IMPORT ---
from backend.services.nutrition_service import df, vectorizer

# --- Basic Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========================
# 1. FastAPI App Initialization
# ========================
app = FastAPI(
    title="MealSwitch API",
    version="3.0",
    description="A professionally structured, AI-powered nutrition API."
)

# ... (The rest of your main.py file stays the same as I gave you before) ...
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "error": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"status": "error", "error": "An unexpected internal error occurred"},
    )

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 MealSwitch API v3.0 starting up...")
    logger.info(f"📊 Dataset loaded with {len(df)} foods")
    logger.info(f"🔧 TF-IDF model status: {'Ready' if vectorizer else 'Not available'}")

app.include_router(endpoints.router)

@app.get("/")
def root():
    return {"message": "Welcome to the MealSwitch API v3.0"}

if __name__ == "__main__":
    logger.info("🚀 Starting FastAPI server on http://127.0.0.1:8000")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")