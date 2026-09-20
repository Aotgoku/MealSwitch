import os
from dotenv import load_dotenv
import google.generativeai as genai
from google.api_core import exceptions

# Load key from backend/.env if present
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

API_KEY = os.getenv("GOOGLE_API_KEY")

print("--- Starting API Test ---")

if not API_KEY:
    print("❌ ERROR: GOOGLE_API_KEY not found. Set it in your backend/.env file or environment variables.")
    exit(1)

try:
    genai.configure(api_key=API_KEY, transport='rest')
    
    print("[OK] Configuration successful. Listing available models...")
    
    # This is the simplest API call. If this fails, the problem is with the key/project.
    for m in genai.list_models():
        # We only care about models that support the 'generateContent' method
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
            
    print("\n--- Test Complete ---")

except exceptions.NotFound as e:
    print("\n[ERROR] TEST FAILED: The API returned a 'Not Found' error.")
    print("This confirms the issue is with your Google Cloud project, API key, or account.")
    print("The key is being forced to an old API version that has no models available.")
    print("\nFull Error:")
    print(e)
    
except Exception as e:
    print(f"\n[ERROR] An unexpected error occurred: {e}")