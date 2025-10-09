from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
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
    portion_text: str # This accepts any text like "150g" or "2 bowls"

class ImageAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    portion_size: Optional[float] = 1.0

# Add this new Pydantic model with your others

# A new helper model for chat history parts
class ChatPart(BaseModel):
    text: str

# A new helper model for a single entry in the chat history
class ChatHistoryEntry(BaseModel):
    role: str
    parts: List[ChatPart]

# The upgraded ChatRequest model
class ChatRequest(BaseModel):
    message: str
    goal: str
    # This now correctly expects the detailed history object
    history: Optional[List[ChatHistoryEntry]] = []
    meal_plan: Optional[dict] = None
    
    # Add this model with your others (like ChatRequest)
# In backend/api/endpoints.py

# In backend/api/endpoints.py

class MealPlanRequest(BaseModel):
    goal: str
    age: int
    weight_kg: float
    height_cm: float
    gender: str
    activity_level: str
    dietary_preference: str # <-- ADD THIS LINE
    cuisine: Optional[str] = "Indian"

class MealPlanOptimizeRequest(BaseModel):
     plan: dict # It expects to receive the JSON plan from the frontend

class ShoppingListRequest(BaseModel):
    plan_text: str

    
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
