from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional, List, Dict, Any
import logging
import traceback
# Add these lines with your other imports
import os
import google.generativeai as genai
# Add this line with your other imports at the top of app.py
from starlette.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set your Google API key
# Paste this block after your logging configuration

# ========================
# NEW: Configure Gemini API
# ========================
# IMPORTANT: Replace "YOUR_API_KEY" with the key you copied
# For better security, use environment variables in a real project
try:
    # Make sure to replace 'YOUR_API_KEY' with your actual key
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'AIzaSyBVASGrFU3ogOI5nL7jeO0zM8dsIYqtgJ4') 
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("✅ Gemini API configured successfully!")
except Exception as e:
    logger.error(f"❌ Error configuring Gemini API: {e}")
    model = None

# ========================
# Load your dataset
# ========================
try:
    logger.info("📂 Loading dataset MealSwitch_dataset.xlsx ...")
    df = pd.read_excel("MealSwitch_dataset.xlsx")
    df.columns = df.columns.str.strip()
    df = df.drop_duplicates()
    df['risky_for'] = df['risky_for'].fillna("None")

    # Handle numeric columns more robustly
    numeric_cols = ['calories', 'calories_saved', 'sugar_g', 'fat_g', 'carbs_g', 'protein_g']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        else:
            df[col] = 0
            logger.warning(f"Column {col} not found, setting to 0")

    logger.info(f"✅ Dataset loaded with {len(df)} rows and {len(df.columns)} columns")
    logger.info(f"Dataset columns: {list(df.columns)}")

    # Print sample data for debugging
    if len(df) > 0:
        logger.info(f"Sample data:\n{df.head()}")

except Exception as e:
    logger.error(f"❌ Error loading dataset: {e}")
    # Create a fallback dataset with sample data
    df = pd.DataFrame({
        'food_name': ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli', 'Salmon Fillet', 'Greek Yogurt'],
        'calories': [165, 112, 34, 206, 100],
        'protein_g': [31, 2.6, 2.8, 22, 10],
        'carbs_g': [0, 23, 7, 0, 6],
        'fat_g': [3.6, 0.9, 0.4, 12, 0.4],
        'sugar_g': [0, 0.4, 1.5, 0, 4],
        'calories_saved': [50, 20, 5, 30, 25],
        'risky_for': ['None', 'None', 'None', 'None', 'None'],
        'category': ['Protein', 'Grains', 'Vegetables', 'Protein', 'Dairy']
    })
    logger.info("✅ Using fallback dataset")

# ========================
# Build TF-IDF model
# ========================
try:
    logger.info("⚙️ Building TF-IDF model...")
    vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
    X = vectorizer.fit_transform(df['food_name'])
    logger.info("✅ TF-IDF model built successfully!")
except Exception as e:
    logger.error(f"❌ Error building TF-IDF model: {e}")
    vectorizer = None
    X = None

def get_food_info(query, top_n=1):
    """Get food information based on query"""
    logger.info(f"🔎 [get_food_info] Query received: {query}")

    if vectorizer is None or X is None:
        logger.error("TF-IDF model not available")
        return None

    try:
        query_vec = vectorizer.transform([query])
        sim = cosine_similarity(query_vec, X).flatten()
        idx = sim.argsort()[-top_n:][::-1]

        logger.info(f"   Similarity scores (top {top_n}): {[(df.iloc[i]['food_name'], sim[i]) for i in idx]}")

        if len(idx) == 0 or sim[idx[0]] < 0.1:  # Lowered threshold for better matching
            logger.info("   ❌ No strong match found")
            return None

        row = df.iloc[idx[0]].to_dict()
        logger.info(f"   ✅ Best match: {row['food_name']}")
        return row
    except Exception as e:
        logger.error(f"Error in get_food_info: {e}")
        return None

def get_multiple_food_recommendations(query, top_n=5):
    """Get multiple food recommendations"""
    logger.info(f"🔎 [get_multiple_food_recommendations] Query: {query}")

    if vectorizer is None or X is None:
        logger.error("TF-IDF model not available")
        return None

    try:
        query_vec = vectorizer.transform([query])
        sim = cosine_similarity(query_vec, X).flatten()
        idx = sim.argsort()[-top_n:][::-1]

        results = []
        for i in idx:
            if sim[i] >= 0.1:  # Lowered threshold
                row = df.iloc[i].to_dict()
                row['similarity_score'] = float(sim[i])
                logger.info(f"   ✅ Match: {row['food_name']} (score={row['similarity_score']:.3f})")
                results.append(row)

        if not results:
            logger.info("   ❌ No matches above threshold")
        return results if results else None
    except Exception as e:
        logger.error(f"Error in get_multiple_food_recommendations: {e}")
        return None

def get_alternative_suggestions(food_name):
    """Get healthier alternatives for a given food"""
    try:
        # Simple logic to suggest alternatives based on food type
        alternatives = []
        food_lower = food_name.lower()

        # Get all foods from the same category or similar nutrition profile
        current_food = get_food_info(food_name)
        if current_food:
            current_calories = current_food.get('calories', 0)
            category = current_food.get('category', '')

            # Find foods with fewer calories in the same category
            similar_foods = df[
                (df['category'] == category) &
                (df['calories'] < current_calories) &
                (df['food_name'].str.lower() != food_lower)
            ].head(3)

            for _, row in similar_foods.iterrows():
                alternatives.append({
                    'name': row['food_name'],
                    'calories': row['calories'],
                    'reason': f"Lower calorie {category.lower()} option",
                    'calories_saved': current_calories - row['calories']
                })

        return alternatives
    except Exception as e:
        logger.error(f"Error getting alternatives: {e}")
        return []
    
    # This new function uses your ML model to find smart suggestions
def find_optimized_suggestion(food_name: str):
    """
    Uses the TF-IDF model to find the most similar food in the local dataset
    and returns its healthier substitute if a good match is found.
    """
    # First, ensure the model and dataframe are ready to be used
    if vectorizer is None or X is None or df.empty:
        return None

    try:
        # Use the TF-IDF model to find the most similar food in your dataset
        query_vec = vectorizer.transform([food_name])
        sim_scores = cosine_similarity(query_vec, X).flatten()
        best_match_idx = sim_scores.argmax()
        best_score = sim_scores[best_match_idx]

        # We set a confidence threshold. Only suggest a swap if the match is strong.
        if best_score > 0.7:
            matched_food = df.iloc[best_match_idx]
            substitute = matched_food.get('healthy_substitute')
            calories_saved = matched_food.get('calories_saved', 0)

            # Check if a valid substitute exists that actually saves calories
            if pd.notna(substitute) and substitute.strip() != '—' and calories_saved > 0:
                logger.info(f"Found optimization: {food_name} -> {substitute}")
                return {
                    "original": matched_food['food_name'], # The food it matched in your CSV
                    "suggestion": substitute, # The healthy substitute from your CSV
                    "calories_saved": int(calories_saved)
                }
    except Exception as e:
        logger.error(f"Error finding optimized suggestion for '{food_name}': {e}")
        return None
    
    # If no strong match or no valid substitute is found, return nothing
    return None

# ========================
# FastAPI setup
# ========================
app = FastAPI(
    title="MealSwitch API",
    version="2.0",
    description="AI-powered nutrition analysis and meal recommendations"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# Request Models
# ========================
class QueryRequest(BaseModel):
    query: str

class FoodDataRequest(BaseModel):
    foods: List[str]
    preferences: Optional[Dict[str, Any]] = None

class NutritionAnalysisRequest(BaseModel):
    food_name: str
    portion_size: Optional[float] = 1.0

class ImageAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    portion_size: Optional[float] = 1.0

# Add this new Pydantic model with your others

class ChatRequest(BaseModel):
    message: str
    goal: str
    history: Optional[List[Dict[str, str]]] = []   

    # Add this model with your others (like ChatRequest)
class MealPlanRequest(BaseModel):
    goal: str
    calories: int
    cuisine: Optional[str] = "Indian"
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None

class MealPlanOptimizeRequest(BaseModel):
     plan: dict # It expects to receive the JSON plan from the frontend

    
# ========================
# Response Models
# ========================
class NutritionData(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    sugar_g: float

class HealthInfo(BaseModel):
    calories_saved: float
    risky_for: str
    category: str

class FoodAnalysisResult(BaseModel):
    food_name: str
    portion_size: float
    nutrition: NutritionData
    health_info: HealthInfo

class APIResponse(BaseModel):
    status: str
    message: Optional[str] = None
    result: Optional[Any] = None
    error: Optional[str] = None


# ========================
# API Endpoints
# ========================
@app.get("/")
def root():
    """Root endpoint with API information"""
    logger.info("📡 Root endpoint called")
    return {
        "message": "MealSwitch API v2.0 is running!",
        "status": "healthy",
        "endpoints": {
            "nutrition_analysis": "/nutrition-analysis",
            "food_recommendations": "/food-recommendations",
            "food_alternatives": "/food-alternatives",
            "bulk_analysis": "/bulk-food-data",
            "image_analysis": "/image-analysis",
            "health_stats": "/health-stats",
            "food_categories": "/food-categories"
        },
        "dataset_info": {
            "total_foods": len(df),
            "columns": list(df.columns)
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "dataset_loaded": len(df) > 0,
        "model_ready": vectorizer is not None
    }

@app.post("/nutrition-analysis")
def nutrition_analysis(request: NutritionAnalysisRequest):
    """Analyze nutrition for a specific food item"""
    logger.info(f"📡 /nutrition-analysis called with: {request.dict()}")

    try:
        result = get_food_info(request.food_name)
        if result is None:
            return {
                "status": "not_found",
                "message": f"Could not find nutrition information for '{request.food_name}'",
                "food_name": request.food_name,
                "suggestions": [
                    "Try using more specific food names",
                    "Check spelling",
                    "Use common food names like 'chicken breast' instead of 'chicken'"
                ]
            }

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
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/food-recommendations")
def food_recommendations(request: QueryRequest):
    """Get food recommendations based on query"""
    logger.info(f"📡 /food-recommendations called with: {request.dict()}")

    try:
        results = get_multiple_food_recommendations(request.query, top_n=5)
        if not results:
            return {
                "status": "not_found",
                "message": f"No food recommendations found for '{request.query}'",
                "query": request.query,
                "suggestions": [
                    "Try broader terms like 'chicken', 'rice', 'vegetables'",
                    "Check spelling",
                    "Use common food names"
                ]
            }

        return {
            "status": "ok",
            "query": request.query,
            "results": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"❌ Error in food recommendations: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/food-alternatives")
def food_alternatives(request: QueryRequest):
    """Get healthier alternatives for a food item"""
    logger.info(f"📡 /food-alternatives called with: {request.dict()}")

    try:
        alternatives = get_alternative_suggestions(request.query)
        current_food = get_food_info(request.query)

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

@app.post("/image-analysis")
def image_analysis(request: ImageAnalysisRequest):
    """Analyze nutrition from food image (placeholder for now)"""
    logger.info(f"📡 /image-analysis called")

    # This is a placeholder - in a real implementation, you would:
    # 1. Decode the base64 image
    # 2. Use computer vision to identify food items
    # 3. Estimate portions
    # 4. Return nutrition analysis

    return {
        "status": "not_implemented",
        "message": "Image analysis feature is coming soon!",
        "suggestion": "Please use text input for now"
    }

@app.post("/bulk-food-data")
def bulk_food_data(request: FoodDataRequest):
    """Analyze multiple foods at once"""
    logger.info(f"📡 /bulk-food-data called with {len(request.foods)} foods")

    try:
        results, not_found = [], []
        total_nutrition = {
            'calories': 0, 'protein_g': 0, 'carbs_g': 0,
            'fat_g': 0, 'sugar_g': 0
        }

        for food in request.foods:
            food_data = get_food_info(food)
            if food_data:
                results.append(food_data)
                # Add to totals
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

@app.get("/food-categories")
def get_food_categories():
    """Get all available food categories"""
    logger.info("📡 /food-categories called")

    try:
        categories = []
        if 'category' in df.columns:
            categories = sorted(df['category'].dropna().unique().tolist())

        category_counts = {}
        for cat in categories:
            category_counts[cat] = len(df[df['category'] == cat])

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

@app.get("/health-stats")
def get_health_stats():
    """Get overall health statistics from the dataset"""
    logger.info("📡 /health-stats called")

    try:
        # Calculate statistics safely
        numeric_cols = ['calories', 'protein_g', 'carbs_g', 'fat_g', 'sugar_g']
        stats = {"total_foods": len(df)}

        for col in numeric_cols:
            if col in df.columns and len(df[col]) > 0:
                stats[f"avg_{col}"] = float(df[col].mean())
                stats[f"min_{col}"] = float(df[col].min())
                stats[f"max_{col}"] = float(df[col].max())
            else:
                stats[f"avg_{col}"] = 0.0
                stats[f"min_{col}"] = 0.0
                stats[f"max_{col}"] = 0.0

        # Add some additional insights
        stats["insights"] = {
            "high_protein_foods": len(df[df['protein_g'] > 20]) if 'protein_g' in df.columns else 0,
            "low_calorie_foods": len(df[df['calories'] < 100]) if 'calories' in df.columns else 0,
            "high_fiber_foods": len(df[df.get('fiber_g', pd.Series([0])) > 5])
        }

        logger.info(f"✅ Health stats calculated: {len(stats)} metrics")
        return {"status": "ok", "stats": stats}

    except Exception as e:
        logger.error(f"❌ Error calculating health stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search/{query}")
def quick_search(query: str):
    """Quick search endpoint for autocomplete"""
    logger.info(f"📡 /search/{query} called")

    try:
        # Simple fuzzy search in food names
        matches = df[df['food_name'].str.contains(query, case=False, na=False)].head(10)
        results = []

        for _, row in matches.iterrows():
            results.append({
                "name": row['food_name'],
                "calories": row.get('calories', 0),
                "category": row.get('category', 'Unknown')
            })

        return {
            "status": "ok",
            "query": query,
            "results": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"❌ Error in quick search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# NEW: Chatbot Endpoint
# ========================
@app.post("/chat")
def chat_with_gemini(request: ChatRequest):
    """Chat with the AI Health Assistant"""
    logger.info(f"📡 /chat called with goal: {request.goal}")

    if not model:
        raise HTTPException(status_code=500, detail="Gemini model not configured. Check API key.")

    try:
        # Create a more detailed prompt for the AI
        prompt = f"""
        You are 'MealSwitch', a friendly and knowledgeable AI health assistant.
        The user's primary health goal is: "{request.goal.replace('_', ' ')}".
        Based on this goal, answer the user's question concisely and helpfully.
        Provide safe, general health and nutrition advice. Do not provide medical advice.
        
        User's question: "{request.message}"
        """

        response = model.generate_content(prompt)
        
        logger.info(f"✅ Gemini response generated successfully.")
        return {"status": "ok", "reply": response.text}

    except Exception as e:
        logger.error(f"❌ Error in Gemini chat endpoint: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error communicating with AI model: {str(e)}")

# ========================
# NEW: Meal Plan Generator Endpoint
# ========================
@app.post("/generate-meal-plan")
def generate_meal_plan(request: MealPlanRequest):
    """Generates a daily meal plan using the Gemini API"""
    logger.info(f"📡 /generate-meal-plan called with goal: {request.goal}, calories: {request.calories}")

    if not model:
        raise HTTPException(status_code=500, detail="Gemini model not configured.")

    try:
        # Prompt is unchanged
        prompt = f"""
        Act as an elite sports nutritionist and expert chef. Your task is to generate a simple, healthy, and delicious daily meal plan based on the user's specific details.
        **User's Details:**
        - **Primary Goal:** {request.goal.replace('_', ' ')}
        - **Target Daily Calories:** Approximately {request.calories}
        - **Preferred Cuisine:** {request.cuisine}
        """
        if request.age: prompt += f"- **Age:** {request.age}\n"
        if request.weight_kg: prompt += f"- **Weight:** {request.weight_kg} kg\n"
        if request.height_cm: prompt += f"- **Height:** {request.height_cm} cm\n"
        if request.gender: prompt += f"- **Gender:** {request.gender}\n"
        prompt += """
        **Instructions:**
        1. Create a meal plan with three meals: Breakfast, Lunch, and Dinner.
        2. For each meal, provide a "name" and a short, appealing "description" (1-2 sentences).
        3. Estimate the "calories" for each meal. The sum for all three meals MUST be very close to the target daily calories.
        4. Provide a concise "reason" (1-2 sentences) explaining why this specific plan is effective for the user's goal, considering their provided details.
        **CRITICAL:** Your entire output must be ONLY a single, valid JSON object. Do not include any text, explanations, or markdown formatting (like ```json) before or after the JSON.
        The JSON object must follow this exact structure:
        {"plan": {"breakfast": {"name": "Meal Name", "description": "...", "calories": <number>}, "lunch": {...}, "dinner": {...}}, "totalCalories": <number>, "reason": "..."}
        """

        response = model.generate_content(prompt)
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        
        # --- THIS IS THE FIX ---
        # We now parse the JSON string into a Python dictionary on the backend
        import json
        plan_data = json.loads(cleaned_response) 
        
        logger.info(f"✅ Gemini meal plan generated successfully.")
        # We return the dictionary, which FastAPI automatically converts to a JSON object
        return {"status": "ok", "plan_data": plan_data}

    except Exception as e:
        logger.error(f"❌ Error in meal plan generation: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating meal plan: {str(e)}")
    # NEW ENDPOINT FOR THE OPTIMIZER FEATURE
@app.post("/optimize-plan")
def optimize_meal_plan(request: MealPlanOptimizeRequest):
    """Receives a meal plan and adds MealSwitch optimization suggestions."""
    logger.info("📡 /optimize-plan called")
    optimized_plan = request.plan.copy() # Make a copy to avoid changing the original

    # Loop through each meal in the plan
    for meal_type in ["breakfast", "lunch", "dinner"]:
        if meal_type in optimized_plan.get("plan", {}):
            meal_name = optimized_plan["plan"][meal_type].get("name")
            if meal_name:
                # Call our smart suggestion function for each meal name
                suggestion = find_optimized_suggestion(meal_name)
                if suggestion:
                    # If a suggestion is found, add it to the meal object
                    optimized_plan["plan"][meal_type]["suggestion"] = suggestion
    
    # Send the newly enriched plan back to the frontend
    return {"status": "ok", "optimized_plan": optimized_plan}
# ====================================================================
# END OF THE CODE BLOCK TO PASTE

# ========================
# Error Handlers
# ========================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": exc.detail
        }
    )
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": "An unexpected internal error occurred",
            "message": "Please try again or contact support"
        }
    )
# Paste this entire block at the end of your file, before the "if __name__" line

# 
# ========================
# Startup Event
# ========================
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 MealSwitch API v2.0 starting up...")
    logger.info(f"📊 Dataset loaded with {len(df)} foods")
    logger.info(f"🔧 TF-IDF model status: {'Ready' if vectorizer else 'Not available'}")

# ========================
# Run directly
# ========================
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting FastAPI server on http://127.0.0.1:8000")
    logger.info("📋 API Documentation available at http://127.0.0.1:8000/docs")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
