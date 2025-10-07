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


@router.post("/nutrition-analysis")
def nutrition_analysis(request: NutritionAnalysisRequest):
    """Analyze nutrition for a specific food item"""
    logger.info(f"📡 /nutrition-analysis called with: {request.dict()}")
    try:
        result = nutrition_service.get_food_info(request.food_name)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Could not find nutrition information for '{request.food_name}'")

        portion = request.portion_size
        nutrition_data = {
            "food_name": result.get('food_name'),
            "portion_size": portion,
            "nutrition": {
                "calories": float(result.get('calories', 0)) * portion,
                "sugar_g": float(result.get('sugar_g', 0)) * portion,
                "fat_g": float(result.get('fat_g', 0)) * portion,
                "carbs_g": float(result.get('carbs_g', 0)) * portion,
                "protein_g": float(result.get('protein_g', 0)) * portion,
            },
            "health_info": {
                "calories_saved": float(result.get('calories_saved', 0)) * portion,
                "risky_for": result.get('risky_for', 'None'),
                "category": result.get('category', 'Unknown')
            }
        }
        logger.info(f"✅ Nutrition analysis successful for: {result.get('food_name')}")
        return {"status": "ok", "result": nutrition_data}
    except Exception as e:
        logger.error(f"❌ Error in nutrition analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    logger.info(f"📡 /generate-meal-plan called with goal: {request.goal}, calories: {request.calories}")
    if not nutrition_service.model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    prompt = f"""
    Act as an elite sports nutritionist and expert chef... 
    (The rest of your prompt is here)
    ...
    The JSON object must follow this exact structure:
    {{"plan": {{"breakfast": {{"name": "Meal Name", "description": "...", "calories": <number>}}, "lunch": {{...}}, "dinner": {{...}}}}, "totalCalories": <number>, "reason": "..."}}
    """

    try:
        response = await asyncio.to_thread(nutrition_service.model.generate_content, prompt)
        
        # --- START OF THE FIX ---
        # Find the start and end of the JSON block in the AI's response text
        json_start_index = response.text.find('{')
        json_end_index = response.text.rfind('}') + 1
        
        if json_start_index == -1 or json_end_index == 0:
            logger.error(f"❌ Could not find a JSON object in the AI response: {response.text}")
            raise HTTPException(status_code=500, detail="The AI response did not contain a valid JSON object.")

        # Extract just the JSON part of the string
        clean_json_string = response.text[json_start_index:json_end_index]
        
        # Now, parse the clean string
        plan_data = json.loads(clean_json_string)
        # --- END OF THE FIX ---
        
        logger.info("✅ Gemini meal plan generated and parsed successfully.")
        return {"status": "ok", "plan_data": plan_data}

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON DECODE ERROR. AI Response was: {response.text}")
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