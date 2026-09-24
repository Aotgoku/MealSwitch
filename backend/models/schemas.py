from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any, Union

# ========================
# Request Models
# ========================

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=300)

    @field_validator("query")
    @classmethod
    def query_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Query cannot be blank or whitespace-only.")
        return s

class FoodDataRequest(BaseModel):
    foods: List[str] = Field(..., min_length=1, max_length=20)
    preferences: Optional[Dict[str, Any]] = None

    @field_validator("foods")
    @classmethod
    def foods_not_empty(cls, v: List[str]) -> List[str]:
        cleaned = [item.strip() for item in v if item and item.strip()]
        if not cleaned:
            raise ValueError("Foods list must contain at least one valid food item.")
        return cleaned

class NutritionAnalysisRequest(BaseModel):
    food_name: str = Field(..., min_length=1, max_length=200,
                           description="Food name to analyse. Must not be blank.")
    portion_text: str = Field(..., min_length=1, max_length=100,
                              description="Portion description, e.g. '1 plate' or '150g'.")

    @field_validator("food_name", "portion_text")
    @classmethod
    def string_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank or whitespace-only.")
        return s

class ImageAnalysisRequest(BaseModel):
    image_data: str  # Base64 encoded image
    portion_size: Optional[float] = 1.0

class ChatPart(BaseModel):
    text: str = Field(..., max_length=4000)

class ChatHistoryEntry(BaseModel):
    role: str
    parts: List[ChatPart]

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    goal: str = Field(..., max_length=50)
    history: Optional[List[ChatHistoryEntry]] = []
    meal_plan: Optional[dict] = None

    @field_validator("message", "goal")
    @classmethod
    def chat_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank or whitespace-only.")
        return s

class MealPlanRequest(BaseModel):
    goal: str = Field(..., max_length=50)
    age: int = Field(..., ge=10, le=120)
    weight_kg: float = Field(..., ge=20.0, le=500.0)
    height_cm: float = Field(..., ge=50.0, le=300.0)
    gender: str = Field(..., max_length=20)
    activity_level: str = Field(..., max_length=30)
    dietary_preference: str = Field(..., max_length=50)
    cuisine: Optional[str] = Field(default="Indian", max_length=50)

    @field_validator("goal", "gender", "activity_level", "dietary_preference")
    @classmethod
    def meal_plan_fields_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank or whitespace-only.")
        return s

class MealPlanOptimizeRequest(BaseModel):
    plan: dict

class ShoppingListRequest(BaseModel):
    plan_text: str = Field(..., min_length=1, max_length=5000)

    @field_validator("plan_text")
    @classmethod
    def plan_text_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Plan text cannot be blank.")
        return s

class RecipeRequest(BaseModel):
    ingredients: str = Field(..., min_length=2, max_length=500)
    dietary_preference: str = Field(..., max_length=50)

    @field_validator("ingredients", "dietary_preference")
    @classmethod
    def recipe_fields_not_blank(cls, v: str) -> str:
        s = v.strip()
        if not s:
            raise ValueError("Field cannot be blank.")
        return s


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
# Authentication Schemas
# ========================

class UserRegister(BaseModel):
    email: EmailStr           # validates format — rejects "notanemail"
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ========================
# User Profile Schemas
# ========================

class UserProfileUpdate(BaseModel):
    age: Optional[int] = Field(default=None, ge=10, le=120)
    weight_kg: Optional[float] = Field(default=None, ge=20.0, le=500.0)
    height_cm: Optional[float] = Field(default=None, ge=50.0, le=300.0)
    gender: Optional[str] = Field(default=None, max_length=20)
    activity_level: Optional[str] = Field(default=None, max_length=30)
    dietary_preference: Optional[str] = Field(default=None, max_length=50)
    primary_goal: Optional[str] = Field(default=None, max_length=50)

class UserProfileOut(BaseModel):
    id: str
    user_id: str
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    dietary_preference: Optional[str] = None
    primary_goal: Optional[str] = None
    tdee: Optional[int] = None
    bmi: Optional[float] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


# ========================
# Meal Plan Schemas
# ========================

class MealPlanSaveRequest(BaseModel):
    title: str = Field(..., max_length=200)
    plan_data: Dict[str, Any]
    target_calories: Optional[int] = None
    actual_calories: Optional[int] = None
    is_optimized: Optional[bool] = False

class MealPlanOut(BaseModel):
    id: str
    user_id: str
    title: Optional[str] = None
    plan_data: Dict[str, Any]
    target_calories: Optional[int] = None
    actual_calories: Optional[int] = None
    is_optimized: bool = False
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True

class MealPlanSummaryOut(BaseModel):
    id: str
    title: Optional[str] = None
    target_calories: Optional[int] = None
    actual_calories: Optional[int] = None
    is_optimized: bool = False
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True
