// src/services/api.js

const API_BASE_URL = 'http://127.0.0.1:8000';

// A helper to make our code cleaner
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const callNutritionAPI = (foodQuery) => {
    return fetch(`${API_BASE_URL}/nutrition-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food_name: foodQuery, portion_size: 1.0 })
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