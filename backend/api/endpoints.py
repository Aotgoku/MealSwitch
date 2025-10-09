# backend/api/endpoints.py

from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse
from backend.models.schemas import *
from backend.services import nutrition_service
import logging
import traceback
import json
import re
import asyncio
from backend.services import usda_service
# In backend/api/endpoints.py
from backend.models.schemas import MealPlanRequest, ShoppingListRequest # Add ShoppingListRequest here

# Create a logger and a router for this file
logger = logging.getLogger(__name__)
router = APIRouter()


# ========================
# API Endpoints
# ========================
@router.get("/")
def root():
    """Root endpoint with API information"""
    logger.info("📡 Root endpoint called")
    return {
        "message": "MealSwitch API v3.0 is running!",
        "status": "healthy",
        "dataset_info": {
            "total_foods": len(nutrition_service.df),
            "columns": list(nutrition_service.df.columns)
        }
    }


@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "dataset_loaded": len(nutrition_service.df) > 0,
        "model_ready": nutrition_service.vectorizer is not None
    }


# In backend/api/endpoints.py

@router.post("/nutrition-analysis")
async def nutrition_analysis(request: NutritionAnalysisRequest):
    """
    Analyzes nutrition using the full hybrid model with AI-powered portion parsing.
    """

     # --- START OF DIAGNOSTIC ---
    print("\n--- NEW REQUEST RECEIVED ---")
    print(f"--- 1. RAW INPUT: food='{request.food_name}', portion='{request.portion_text}' ---")
    # --- END OF DIAGNOSTIC ---

    logger.info(f"📡 /nutrition-analysis (AI Parse) called with: {request.dict()}")

    # --- Step 1: Use Gemini to parse the user's text into grams ---
    if not nutrition_service.model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    try:
        parse_prompt = f"""
        Analyze the user's food entry. Extract the food name and estimate the total weight in grams.
        User Input Food: "{request.food_name}"
        User Input Portion: "{request.portion_text}"

        Your response MUST be ONLY a JSON object with this exact structure:
        {{"food_name": "best guess food name", "estimated_grams": <estimated weight in grams as a number>}}
        """
        response = await asyncio.to_thread(nutrition_service.model.generate_content, parse_prompt)
        
        json_start_index = response.text.find('{')
        json_end_index = response.text.rfind('}') + 1
        clean_json_string = response.text[json_start_index:json_end_index]
        parsed_data = json.loads(clean_json_string)

        food_name = parsed_data.get("food_name")
        portion_grams = float(parsed_data.get("estimated_grams", 100))
        
        logger.info(f"🤖 AI Parsed Request: Food='{food_name}', Grams={portion_grams}")

    except Exception as e:
        logger.error(f"❌ AI parsing failed: {e}. Falling back to defaults.")
        food_name = request.food_name
        try:
            portion_grams = float("".join(c for c in request.portion_text if c.isdigit() or c == '.'))
            if portion_grams == 0: portion_grams = 100.0
        except (ValueError, AttributeError):
            portion_grams = 100.0

    # --- Step 2: Use the parsed food name to get nutrition (Your Hybrid Logic) ---
    usda_result = await usda_service.search_food_nutrition(food_name)
    local_result = nutrition_service.get_food_info(food_name)

    if not usda_result and not local_result:
        raise HTTPException(status_code=404, detail=f"Could not find nutrition info for '{food_name}'.")

    base_nutrition = usda_result if usda_result else {
        "food_name": local_result.get('food_name'), "calories": local_result.get('calories', 0),
        "protein_g": local_result.get('protein_g', 0), "carbs_g": local_result.get('carbs_g', 0),
        "fat_g": local_result.get('fat_g', 0), "sugar_g": local_result.get('sugar_g', 0),
        "fiber_g": "N/A"
    }

    # --- Step 3: Scale the nutrition to the parsed portion size ---
    scaling_factor = portion_grams / 100.0
    scaled_nutrition = {
        "food_name": base_nutrition.get("food_name"),
        "portion_description": f"{round(portion_grams)}g (from '{request.portion_text}')",
        "calories": round(float(base_nutrition.get('calories', 0)) * scaling_factor),
        "protein_g": round(float(base_nutrition.get('protein_g', 0)) * scaling_factor, 1),
        "carbs_g": round(float(base_nutrition.get('carbs_g', 0)) * scaling_factor, 1),
        "fat_g": round(float(base_nutrition.get('fat_g', 0)) * scaling_factor, 1),
        "sugar_g": round(float(base_nutrition.get('sugar_g', 0)) * scaling_factor, 1),
        "fiber_g": "N/A" if base_nutrition.get('fiber_g') == "N/A" else round(float(base_nutrition.get('fiber_g', 0)) * scaling_factor, 1),
    }
    
    # --- Step 4: Check for an expert swap suggestion (Your existing logic) ---
    expert_suggestion = nutrition_service.find_optimized_suggestion(food_name)
    
    # --- Step 5: Combine and return the results ---
    # THE ONLY CHANGE IS ON THE NEXT LINE
    final_result = {
        "nutrition": scaled_nutrition, # <-- This now correctly uses the scaled data
        "expert_suggestion": expert_suggestion,
    }

    return {"status": "ok", "result": final_result}

@router.post("/food-recommendations")
def food_recommendations(request: QueryRequest):
    """Get food recommendations based on query"""
    logger.info(f"📡 /food-recommendations called with: {request.dict()}")
    try:
        results = nutrition_service.get_multiple_food_recommendations(request.query, top_n=5)
        if not results:
            raise HTTPException(status_code=404, detail=f"No food recommendations found for '{request.query}'")

        return {
            "status": "ok",
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"❌ Error in food recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/food-alternatives")
def food_alternatives(request: QueryRequest):
    """Get healthier alternatives for a food item"""
    logger.info(f"📡 /food-alternatives called with: {request.dict()}")
    try:
        alternatives = nutrition_service.get_alternative_suggestions(request.query)
        current_food = nutrition_service.get_food_info(request.query)
        return {
            "status": "ok",
            "query": request.query,
            "current_food": current_food,
            "alternatives": alternatives,
            "count": len(alternatives)
        }
    except Exception as e:
        logger.error(f"❌ Error getting alternatives: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/image-analysis")
def image_analysis(request: ImageAnalysisRequest):
    """Analyze nutrition from food image (placeholder for now)"""
    logger.info(f"📡 /image-analysis called")
    raise HTTPException(status_code=501, detail="Image analysis feature is not implemented.")


@router.post("/bulk-food-data")
def bulk_food_data(request: FoodDataRequest):
    """Analyze multiple foods at once"""
    logger.info(f"📡 /bulk-food-data called with {len(request.foods)} foods")
    try:
        results, not_found = [], []
        total_nutrition = {'calories': 0, 'protein_g': 0, 'carbs_g': 0, 'fat_g': 0, 'sugar_g': 0}

        for food in request.foods:
            food_data = nutrition_service.get_food_info(food)
            if food_data:
                results.append(food_data)
                for key in total_nutrition:
                    total_nutrition[key] += float(food_data.get(key, 0))
            else:
                not_found.append(food)

        logger.info(f"✅ Bulk analysis: {len(results)} found, {len(not_found)} not found")
        return {
            "status": "ok",
            "found_count": len(results),
            "not_found_count": len(not_found),
            "results": results,
            "not_found": not_found,
            "total_nutrition": total_nutrition,
            "preferences": request.preferences
        }
    except Exception as e:
        logger.error(f"❌ Error in bulk analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/food-categories")
def get_food_categories():
    """Get all available food categories"""
    logger.info("📡 /food-categories called")
    try:
        df = nutrition_service.df
        categories = sorted(df['category'].dropna().unique().tolist()) if 'category' in df.columns else []
        category_counts = {cat: len(df[df['category'] == cat]) for cat in categories}

        logger.info(f"✅ Found {len(categories)} categories")
        return {
            "status": "ok",
            "categories": categories,
            "category_counts": category_counts,
            "total_categories": len(categories)
        }
    except Exception as e:
        logger.error(f"❌ Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health-stats")
def get_health_stats():
    """Get overall health statistics from the dataset"""
    logger.info("📡 /health-stats called")
    try:
        df = nutrition_service.df
        numeric_cols = ['calories', 'protein_g', 'carbs_g', 'fat_g', 'sugar_g']
        stats = {"total_foods": len(df)}

        for col in numeric_cols:
            if col in df.columns and len(df[col]) > 0:
                stats[f"avg_{col}"] = float(df[col].mean())
            else:
                stats[f"avg_{col}"] = 0.0
        
        logger.info(f"✅ Health stats calculated")
        return {"status": "ok", "stats": stats}
    except Exception as e:
        logger.error(f"❌ Error calculating health stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/{query}")
def quick_search(query: str):
    """Quick search endpoint for autocomplete"""
    logger.info(f"📡 /search/{query} called")
    try:
        df = nutrition_service.df
        matches = df[df['food_name'].str.contains(query, case=False, na=False)].head(10)
        results = [{"name": row['food_name'], "category": row.get('category', 'Unknown')} for _, row in matches.iterrows()]
        return {"status": "ok", "query": query, "results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"❌ Error in quick search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat_with_gemini(request: ChatRequest):
    """Chat with the AI Health Assistant, now with tool-use capabilities."""
    logger.info(f"📡 /chat called with goal: {request.goal}")
    if not nutrition_service.model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    try:
        prompt = f"""You are 'MealSwitch', a friendly, expert AI health and nutrition assistant. The user's primary health goal is: "{request.goal.replace('_', ' ')}". Now, answer the user's question: \"{request.message}\""""
        
        chat_session = nutrition_service.model.start_chat(history=[entry.dict() for entry in request.history])
        response = await asyncio.to_thread(chat_session.send_message, prompt)

        candidate = response.candidates[0]
        while hasattr(candidate, 'function_calls') and candidate.function_calls:
            function_calls = candidate.function_calls
            logger.info(f"🤖 AI is requesting to use a tool: {function_calls[0].name}")
            
            api_function = getattr(nutrition_service, function_calls[0].name, None)
            if api_function:
                function_args = {key: value for key, value in function_calls[0].args.items()}
                api_response = api_function(**function_args)
                
                response = await asyncio.to_thread(
                    chat_session.send_message,
                    content=str(api_response)
                )
                candidate = response.candidates[0]
            else:
                # If the function is not found in the service, break the loop
                break

        logger.info("✅ Gemini final response generated successfully.")
        return {"status": "ok", "reply": response.text}

    except Exception as e:
        logger.error(f"❌ Error in Gemini chat endpoint: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error communicating with AI model: {str(e)}")


# In backend/api/endpoints.py

# In backend/api/endpoints.py

@router.post("/generate-meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    """Generates a daily meal plan using the Gemini API."""
    logger.info(f"📡 /generate-meal-plan called with details: {request.dict()}")
    if not nutrition_service.model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    # --- Calorie and BMI logic (This is all correct and stays the same) ---
    tdee = nutrition_service.calculate_tdee(
        age=request.age,
        weight_kg=request.weight_kg,
        height_cm=request.height_cm,
        gender=request.gender,
        activity_level=request.activity_level
    )
    if request.goal == 'weight_loss':
        target_calories = tdee - 400
    elif request.goal == 'muscle_gain':
        target_calories = tdee + 400
    else:
        target_calories = tdee
    logger.info(f"✅ Calculated TDEE: {tdee}, Final Target Calories for {request.goal}: {target_calories}")
    
    bmi, bmi_category = nutrition_service.calculate_bmi(
        weight_kg=request.weight_kg,
        height_cm=request.height_cm
    )
    logger.info(f"✅ Calculated BMI: {bmi} ({bmi_category})")
    
  # --- START OF THE FIX: A More Detailed Prompt ---
    prompt = f"""
    Act as an expert nutritionist. Your task is to generate a simple, healthy, and delicious daily meal plan for a user with the following details:
    - Goal: {request.goal.replace('_', ' ')}
    - Age: {request.age}
    - Weight: {request.weight_kg} kg
    - Height: {request.height_cm} cm
    - Gender: {request.gender}
    - Activity Level: {request.activity_level}
    - Target Calories: Approximately {target_calories} calories.
    - Dietary Preference: {request.dietary_preference}
    - Preferred Cuisine: {request.cuisine}

    **Instructions:**
    1.  Create a meal plan with three meals: Breakfast, Lunch, and Dinner.
    2.  **CRITICAL: All suggested meals MUST strictly adhere to the user's Dietary Preference.**
    3.  For each meal, you MUST provide a specific "name" (e.g., "Masala Oats" or "Grilled Chicken Salad").
    4.  For each meal, you MUST provide a short "description" (1-2 sentences).
    5.  Estimate the "calories" for each meal. The total for all three meals should be close to the user's target.

    **CRITICAL:** Your final output MUST be ONLY a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON.
    The JSON object must follow this exact structure:
    {{"plan": {{"breakfast": {{"name": "Specific Meal Name", "description": "...", "calories": <number>}}, "lunch": {{"name": "Specific Meal Name", "description": "...", "calories": <number>}}, "dinner": {{"name": "Specific Meal Name", "description": "...", "calories": <number>}}}}, "totalCalories": <number>, "reason": "..."}}
    """
    # --- END OF THE FIX ---

    try:
        response = await asyncio.to_thread(nutrition_service.model.generate_content, prompt)
        
        # All of your existing JSON cleaning and return logic is correct and stays the same
        json_start_index = response.text.find('{')
        json_end_index = response.text.rfind('}') + 1
        if json_start_index == -1 or json_end_index == 0:
            raise ValueError("Could not find a JSON object in the AI response.")
        clean_json_string = response.text[json_start_index:json_end_index]
        plan_data = json.loads(clean_json_string)
        
        logger.info("✅ Gemini meal plan generated and parsed successfully.")
        
        return {
            "status": "ok", 
            "plan_data": plan_data,
            "user_stats": {
                "bmi": bmi,
                "bmi_category": bmi_category,
                "target_calories": target_calories
            }
        }
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"❌ JSON DECODE ERROR. AI Response was: {getattr(response, 'text', 'No response text available')}")
        raise HTTPException(status_code=500, detail="The AI returned a malformed JSON response.")
    except Exception as e:
        logger.error(f"❌ An unexpected error occurred in meal plan generation: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="An internal error occurred while generating the meal plan.")
    
@router.post("/optimize-plan")
def optimize_meal_plan(request: MealPlanOptimizeRequest):
    """Receives a meal plan and adds MealSwitch optimization suggestions."""
    logger.info("📡 /optimize-plan called")
    optimized_plan = request.plan.copy()
    for meal_type in ["breakfast", "lunch", "dinner"]:
        if meal_type in optimized_plan.get("plan", {}):
            meal_name = optimized_plan["plan"][meal_type].get("name")
            if meal_name:
                suggestion = nutrition_service.find_optimized_suggestion(meal_name)
                if suggestion:
                    optimized_plan["plan"][meal_type]["suggestion"] = suggestion
    return {"status": "ok", "optimized_plan": optimized_plan}

@router.post("/generate-shopping-list")
async def generate_shopping_list(request: ShoppingListRequest):
    logger.info("📡 /generate-shopping-list called")
    if not nutrition_service.model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    try:
        prompt = f"""
        Analyze this meal plan and extract all the necessary ingredients to create a categorized shopping list.

        Meal Plan:
        ---
        {request.plan_text}
        ---

        Instructions:
        1.  List all unique ingredients from the breakfast, lunch, and dinner descriptions.
        2.  Categorize the ingredients into logical groups like "Produce", "Protein", "Dairy & Eggs", "Pantry Staples", etc.
        3.  Do not include quantities, just the names of the ingredients.

        Your response MUST be ONLY a single, valid JSON object. Do not include any text before or after it.
        The JSON object must follow this exact structure:
        {{"shopping_list": [{{"category": "Category Name", "items": ["item1", "item2"]}}]}}
        """
        
        response = await asyncio.to_thread(nutrition_service.model.generate_content, prompt)
        
        # Standard JSON cleaning logic
        json_start_index = response.text.find('{')
        json_end_index = response.text.rfind('}') + 1
        clean_json_string = response.text[json_start_index:json_end_index]
        shopping_list_data = json.loads(clean_json_string)

        return {"status": "ok", "shopping_list": shopping_list_data.get("shopping_list", [])}

    except Exception as e:
        logger.error(f"❌ Error generating shopping list: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate shopping list.")
