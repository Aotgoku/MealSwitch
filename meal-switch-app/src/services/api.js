const API_BASE_URL = 'http://127.0.0.1:8000';

// A helper to make our code cleaner
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        // Extract the more detailed message from FastAPI if it exists
        const errorMsg = error.detail[0]?.msg || error.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
    }
    return response.json();
};

// --- THIS IS THE UPDATED FUNCTION ---
// In src/services/api.js

export const callNutritionAPI = (foodQuery, portionText) => {
    return fetch(`${API_BASE_URL}/nutrition-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            food_name: foodQuery, 
            // --- THIS IS THE FIX ---
            // Ensure the portion is always sent as a string
            portion_text: String(portionText) 
            // --- END OF FIX ---
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