# In backend/core/config.py
import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

# Basic logging
logger = logging.getLogger(__name__)

# Correctly build the path to the .env file
base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Centralized API Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = None

try:
    if GOOGLE_API_KEY:
        # Configure the API client here, in isolation
        genai.configure(
            api_key=GOOGLE_API_KEY,
            transport='rest'  # Forcing REST for stability
        )
        
        # Initialize the model once and make it available for import
        GEMINI_MODEL = genai.GenerativeModel(model_name='gemini-pro-latest')
        
        logger.info("✅ Gemini configured successfully in core.config")
    else:
        logger.error("--- GOOGLE_API_KEY not found in environment ---")
except Exception as e:
    logger.error(f"--- ❌ Error during Gemini configuration: {e} ---")