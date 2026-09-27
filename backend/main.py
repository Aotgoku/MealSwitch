# backend/main.py
import sys
from pathlib import Path

# Ensure repository root is in sys.path regardless of execution working directory
_repo_root = str(Path(__file__).resolve().parent.parent)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from backend.core import config
import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import traceback

# API endpoints
from backend.api import endpoints
from backend.api import auth
from backend.api import user
from backend.api import meal_plans

# Nutrition service (CSV + TF-IDF)
from backend.services.nutrition_service import df, vectorizer

# Database imports
from backend.core.database import test_db_connection
from backend.models import db_models

# --- Basic Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from backend.core.limiter import limiter

# ========================
# FastAPI App Initialization
# ========================
app = FastAPI(
    title="MealSwitch API",
    version="3.0",
    description="A professionally structured, AI-powered nutrition API."
)

# Attach rate limiter and its 429 error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ========================
# CORS Configuration
# ========================
# In development (APP_ENV=development) we allow the local Vite dev server.
# In production you can set ALLOWED_ORIGINS to specific domains.
# Also supports regex for all Vercel deployments (*.vercel.app).
_app_env = os.getenv("APP_ENV", "development")
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
if not _allowed_origins:
    _allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
    logger.info("MealSwitch API v3.0 starting up...")
    logger.info(f"Dataset loaded with {len(df)} foods")
    logger.info(f"TF-IDF model status: {'Ready' if vectorizer else 'Not available'}")
    logger.info(f"Environment: {_app_env}")
    logger.info(f"CORS allowed origins: {_allowed_origins}")

    db_ok = test_db_connection()
    if db_ok:
        logger.info("PostgreSQL: Connected successfully")
    else:
        logger.error("PostgreSQL: Connection FAILED — check DATABASE_URL in .env")

app.include_router(endpoints.router)
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(meal_plans.router)

@app.get("/")
def root():
    return {"message": "Welcome to the MealSwitch API v3.0"}

if __name__ == "__main__":
    logger.info("Starting FastAPI server on http://127.0.0.1:8000")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")