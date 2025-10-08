# In backend/services/usda_service.py
import httpx
import os
from dotenv import load_dotenv

# Load the .env file to get the API key
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

USDA_API_KEY = os.getenv("USDA_API_KEY")
API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

async def search_food_nutrition(food_name: str):
    """Searches the USDA FoodData Central for a food and returns its nutrition."""
    if not USDA_API_KEY:
        return None

    params = {
        "query": food_name,
        "api_key": USDA_API_KEY,
        "pageSize": 1,  # We only want the top result
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(API_URL, params=params)
            response.raise_for_status()  # Raises an exception for bad responses (4xx or 5xx)
            data = response.json()

            if data.get("foods"):
                food_data = data["foods"][0]
                nutrients = {n['nutrientName']: f"{n.get('value', 0)} {n.get('unitName', '').lower()}" 
                             for n in food_data.get("foodNutrients", [])}
                
                # Extract the most important nutrients
                nutrition_info = {
                    "food_name": food_data.get("description", food_name).title(),
                    "calories": nutrients.get("Energy", "0 kcal").split(" ")[0],
                    "protein_g": nutrients.get("Protein", "0 g").split(" ")[0],
                    "carbs_g": nutrients.get("Carbohydrate, by difference", "0 g").split(" ")[0],
                    "fat_g": nutrients.get("Total lipid (fat)", "0 g").split(" ")[0],
                    "sugar_g": nutrients.get("Total Sugars", "0 g").split(" ")[0],
                    "fiber_g": nutrients.get("Fiber, total dietary", "0 g").split(" ")[0],
                }
                return nutrition_info
            
        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e}")
        except Exception as e:
            print(f"An error occurred: {e}")
            
    return None