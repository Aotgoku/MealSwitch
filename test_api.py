import os
import google.generativeai as genai
from google.api_core import exceptions

# --- IMPORTANT: PASTE YOUR NEW API KEY HERE ---
# Replace the placeholder with the new key you generated
API_KEY = "AIzaSyAg-55YzNSED3wQ1rLArNH3V6xUQDnRKhM" 

print("--- Starting API Test ---")

try:
    genai.configure(api_key=API_KEY, transport='rest')
    
    print("✅ Configuration successful. Listing available models...")
    
    # This is the simplest API call. If this fails, the problem is with the key/project.
    for m in genai.list_models():
        # We only care about models that support the 'generateContent' method
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
            
    print("\n--- Test Complete ---")

except exceptions.NotFound as e:
    print("\n❌ TEST FAILED: The API returned a 'Not Found' error.")
    print("This confirms the issue is with your Google Cloud project, API key, or account.")
    print("The key is being forced to an old API version that has no models available.")
    print("\nFull Error:")
    print(e)
    
except Exception as e:
    print(f"\n❌ An unexpected error occurred: {e}")