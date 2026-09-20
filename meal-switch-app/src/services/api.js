const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const error = await response.json();
            errorMsg = error.detail?.[0]?.msg || error.detail || error.error || errorMsg;
        } catch {
            // Keep default errorMsg if not JSON
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

export const callNutritionAPI = (foodQuery, portionText) => {
    return fetch(`${API_BASE_URL}/nutrition-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            food_name: foodQuery, 
            portion_text: String(portionText || '100g')
        })
    }).then(handleResponse);
};

export const getRecommendations = (foodQuery) => {
    return fetch(`${API_BASE_URL}/food-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: foodQuery })
    }).then(handleResponse);
};

export const generateMealPlanAPI = (planDetails) => {
    return fetch(`${API_BASE_URL}/generate-meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planDetails)
    }).then(handleResponse);
};

export const optimizeMealPlanAPI = (mealPlan) => {
    return fetch(`${API_BASE_URL}/optimize-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: mealPlan })
    }).then(handleResponse);
};

export const generateShoppingListAPI = (planText) => {
    return fetch(`${API_BASE_URL}/generate-shopping-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_text: planText })
    }).then(handleResponse);
};

export const createRecipeAPI = (ingredients, dietaryPreference) => {
    return fetch(`${API_BASE_URL}/create-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ingredients: ingredients,
            dietary_preference: dietaryPreference || 'veg'
        })
    }).then(handleResponse);
};

export const sendChatMessageAPI = ({ message, goal, history, mealPlan }) => {
    return fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: message,
            goal: goal,
            history: history || [],
            meal_plan: mealPlan || null
        })
    }).then(handleResponse);
};

export const getFoodCategories = () => {
    return fetch(`${API_BASE_URL}/food-categories`).then(handleResponse);
};

export const getHealthStats = () => {
    return fetch(`${API_BASE_URL}/health-stats`).then(handleResponse);
};