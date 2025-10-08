# In backend/services/nutrition_service.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import os

# Import the pre-configured model from our new config file
from backend.core.config import GEMINI_MODEL as model

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Global variables for data and models ---
df = pd.DataFrame()
vectorizer = None
X = None
# 'model' is now imported from config.py

# --- Build the correct, absolute path to the data file ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE_PATH = os.path.join(BASE_DIR, '..', 'data', 'MealSwitch_dataset.xlsx')

# ========================
# Load your dataset
# ========================
try:
    logger.info(f"📂 Loading dataset from {DATA_FILE_PATH} ...")
    df = pd.read_excel(DATA_FILE_PATH)
    df.columns = df.columns.str.strip()
    df = df.drop_duplicates()
    df['risky_for'] = df['risky_for'].fillna("None")
    numeric_cols = ['calories', 'calories_saved', 'sugar_g', 'fat_g', 'carbs_g', 'protein_g']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    logger.info(f"✅ Dataset loaded with {len(df)} rows.")
except Exception as e:
    logger.error(f"❌ Error loading dataset: {e}")
    df = pd.DataFrame({'food_name': ['Placeholder'], 'calories': [0]})
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

# ========================
# Helper Functions
# ========================
def get_food_info(query: str, top_n: int = 1):
    logger.info(f"🔎 [get_food_info] Query received: {query}")
    if vectorizer is None or X is None:
        logger.error("TF-IDF model not available")
        return None
    try:
        query_vec = vectorizer.transform([query])
        sim = cosine_similarity(query_vec, X).flatten()
        idx = sim.argsort()[-top_n:][::-1]
        if len(idx) == 0 or sim[idx[0]] < 0.1:
            logger.info("   ❌ No strong match found")
            return None
        row = df.iloc[idx[0]].to_dict()
        logger.info(f"   ✅ Best match: {row['food_name']}")
        return row
    except Exception as e:
        logger.error(f"Error in get_food_info: {e}")
        return None

def get_multiple_food_recommendations(query: str, top_n: int = 5):
    logger.info(f"🔎 [get_multiple_food_recommendations] Query: {query}")
    if vectorizer is None or X is None:
        return None
    try:
        query_vec = vectorizer.transform([query])
        sim = cosine_similarity(query_vec, X).flatten()
        idx = sim.argsort()[-top_n:][::-1]
        results = []
        for i in idx:
            if sim[i] >= 0.1:
                row = df.iloc[i].to_dict()
                row['similarity_score'] = float(sim[i])
                results.append(row)
        return results if results else None
    except Exception as e:
        logger.error(f"Error in get_multiple_food_recommendations: {e}")
        return None

def get_alternative_suggestions(food_name: str):
    try:
        alternatives = []
        current_food = get_food_info(food_name)
        if current_food:
            current_calories = current_food.get('calories', 0)
            category = current_food.get('category', '')
            similar_foods = df[(df['category'] == category) & (df['calories'] < current_calories) & (df['food_name'].str.lower() != food_name.lower())].head(3)
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

def calculate_tdee(age: int, weight_kg: float, height_cm: float, gender: str, activity_level: str) -> int:
    """Calculates Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE)."""
    if gender.lower() == 'male':
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    else:  # Assumes female
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161

    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }
    
    tdee = bmr * activity_multipliers.get(activity_level.lower(), 1.2)
    return int(tdee)

def calculate_bmi(weight_kg: float, height_cm: float) -> tuple[float, str]:
    """Calculates BMI and provides a category."""
    if not weight_kg or not height_cm or height_cm <= 0 or weight_kg <= 0:
        return 0.0, "Invalid Input"
    
    try:
        height_m = height_cm / 100
        bmi = round(weight_kg / (height_m * height_m), 1)
        
        if bmi < 18.5:
            category = "Underweight"
        elif 18.5 <= bmi < 24.9:
            category = "Healthy Weight"
        elif 25 <= bmi < 29.9:
            category = "Overweight"
        else:
            category = "Obesity"
            
        return bmi, category
        
    except ZeroDivisionError:
        return 0.0, "Invalid Height"

# --- INDENTATION FIX ---
# This function is now correctly aligned with the other functions
def find_optimized_suggestion(food_name: str):
    if vectorizer is None or X is None or df.empty:
        return None
    try:
        query_vec = vectorizer.transform([food_name])
        sim_scores = cosine_similarity(query_vec, X).flatten()
        best_match_idx = sim_scores.argmax()
        best_score = sim_scores[best_match_idx]
        if best_score > 0.7:
            matched_food = df.iloc[best_match_idx]
            substitute = matched_food.get('healthy_substitute')
            calories_saved = matched_food.get('calories_saved', 0)
            if pd.notna(substitute) and substitute.strip() != '—' and calories_saved > 0:
                return {"original": matched_food['food_name'], "suggestion": substitute, "calories_saved": int(calories_saved)}
    except Exception as e:
        logger.error(f"Error finding optimized suggestion for '{food_name}': {e}")
    return None