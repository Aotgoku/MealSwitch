import React, { useState, useEffect, useRef, useCallback } from 'react';
import Background3D from './components/Background3D';
// Add Bot to the list of imported icons
import { Camera, Upload, Zap, Target, TrendingUp, Sparkles, ChefHat, Activity, Star, Users, Clock, Brain, Shield, Award, ArrowRight, Play, BarChart3, Utensils, Heart, Flame, Droplets, Wheat, X, CheckCircle, AlertCircle, ArrowLeft, Bot } from 'lucide-react';
import GoalModal from './components/GoalModal'; // Import the new modal
import Chatbot from './components/Chatbot'; // Import the new chatbot
import styled from 'styled-components';
import MealPlan from './components/MealPlan';
import MealPlanForm from './components/MealPlanForm';
import Hero from './components/Hero'; // <-- ADD THIS LINE
import Navbar from './components/Navbar';
import Features from './components/Features';
import Demo from './components/Demo';
import Stats from './components/Stats';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ResultsView from './components/ResultsView';
import './App.css';
import MacroCard from './components/MacroCard';
import ErrorDisplay from './components/ErrorDisplay';
import { callNutritionAPI, getRecommendations, generateMealPlanAPI, optimizeMealPlanAPI, generateShoppingListAPI, createRecipeAPI } from './services/api';
import ShoppingList from './components/ShoppingList'; // <-- ADD THIS IMPORT
import RecipeModal from './components/RecipeModal'; // <-- ADD THIS

const OpenChatbotButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(to right, #f97316, #ec4899);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 999;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const App = () => {
    const [foodInput, setFoodInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTab, setCurrentTab] = useState('text');
    const [isVisible, setIsVisible] = useState({});
    const [currentSection, setCurrentSection] = useState('hero');
    const [showResults, setShowResults] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [userGoal, setUserGoal] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(true);
    const [showChatbot, setShowChatbot] = useState(false);
    const [showMealPlan, setShowMealPlan] = useState(false);
    const [mealPlanData, setMealPlanData] = useState(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [showMealPlanForm, setShowMealPlanForm] = useState(false);
 const [mealPlanDetails, setMealPlanDetails] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'sedentary',
    dietaryPreference: 'veg', // New field with a default
});
    const [optimizedPlanData, setOptimizedPlanData] = useState(null);
    const [proactiveMessage, setProactiveMessage] = useState('');
    // In src/App.jsx
// Add this new state variable with your others
const [userStats, setUserStats] = useState(null);
// In src/App.jsx
const [portionSize, setPortionSize] = useState(100); // Default to 100g
const [showShoppingList, setShowShoppingList] = useState(false);
const [shoppingListData, setShoppingListData] = useState(null);
 // --- ADD THESE NEW STATE VARIABLES ---
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [recipeData, setRecipeData] = useState(null);
    const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
    // --- END ---


    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const demoRef = useRef(null);
    const statsRef = useRef(null);
    const ctaRef = useRef(null);

    const handleGoalSelection = (goal) => {
        if (goal) {
            setUserGoal(goal);
            setShowGoalModal(false);
            setShowChatbot(true); // ADD THIS LINE
        }
    };

    const handleCloseChatbot = () => {
        setShowChatbot(false);
    };

    const handleOpenChatbot = () => {
        setShowChatbot(true);
    };



    // Intersection Observer for smooth scroll animations
    useEffect(() => {
        const sections = { hero: heroRef, features: featuresRef, demo: demoRef, stats: statsRef, cta: ctaRef };
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = Object.keys(sections).find(key => sections[key].current === entry.target);
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [id]: true }));
                        setCurrentSection(id);
                    }
                });
            }, { rootMargin: "-30% 0px -30% 0px", threshold: 0.2 }
        );

        Object.values(sections).forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);


    // This new hook "listens" ONLY for optimizedPlanData to change
    useEffect(() => {
        if (optimizedPlanData) {
            // OK, React has updated the state. NOW we check for swaps.
            const swapCount = Object.values(optimizedPlanData.plan).filter(meal => meal.suggestion).length;
            if (swapCount > 0) {
                // Now we trigger the proactive message and open the chat
                setProactiveMessage(`Hi! I've analyzed your plan and found ${swapCount} smart swap${swapCount > 1 ? 's' : ''}. I've added the new suggestions to your meal plan. Ask me about them!`);
                setShowChatbot(true);
            }
        }
    }, [optimizedPlanData]); // <-- This dependency array makes the hook run ONLY when optimizedPlanData gets a new value.

    // In src/App.jsx

// This hook will control the background scrolling
useEffect(() => {
    if (showShoppingList) {
        // When the shopping list is open, disable scrolling on the main page
        document.body.classList.add('no-scroll');
    } else {
        // When it closes, re-enable scrolling
        document.body.classList.remove('no-scroll');
    }

    // Cleanup function to ensure scrolling is re-enabled if the component unmounts
    return () => {
        document.body.classList.remove('no-scroll');
    };
}, [showShoppingList]); // This effect runs whenever 'showShoppingList' changes

    // API call function


const handleAnalyze = useCallback(async () => {
    if (!foodInput.trim() && !selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
        // For now, we'll use the text input. Image analysis would require additional backend processing
        const query = foodInput.trim() || 'uploaded image food';

        // --- THIS IS THE FIX ---
        // Pass the portionSize state to your API call function
        const nutritionData = await callNutritionAPI(query, portionSize);
        // --- END OF FIX ---

        // Get recommendations
        const recommendationsData = await getRecommendations(query);

        const result = {
            nutrition: nutritionData,
            recommendations: recommendationsData,
            query: query,
            timestamp: new Date().toISOString()
        };

        setAnalysisResult(result);
        setShowResults(true);

    } catch (error) {
        console.error('Analysis failed:', error);
        setError('Failed to analyze food. Please check if the backend server is running on http://127.0.0.1:8000');
    } finally {
        setIsAnalyzing(false);
    }
}, [foodInput, selectedImage, portionSize]); // <-- Add portionSize to the dependency array
    const handleImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);


   // In src/App.jsx
// In src/App.jsx

// In src/App.jsx

// In src/App.jsx

// In src/App.jsx

    const handleGeneratePlan = async () => {
        if (!userGoal) {
            alert("Please select a goal first!");
            return;
        }

        const age = parseInt(mealPlanDetails.age, 10);
        const weight = parseFloat(mealPlanDetails.weight);
        const height = parseFloat(mealPlanDetails.height);

        if (isNaN(age) || isNaN(weight) || isNaN(height) || age <= 0 || weight <= 0 || height <= 0) {
            alert("Please fill in a valid age, weight, and height.");
            return;
        }

        setIsGeneratingPlan(true);
        setShowMealPlanForm(false);

        try {
            const data = await generateMealPlanAPI({
                goal: userGoal,
                age: age,
                weight_kg: weight,
                height_cm: height,
                gender: mealPlanDetails.gender,
                activity_level: mealPlanDetails.activityLevel,
                dietary_preference: mealPlanDetails.dietaryPreference, 
            });

            setMealPlanData(data.plan_data);
            setUserStats(data.user_stats);
            setShowMealPlan(true);
        } catch (error) {
            console.error("Error generating meal plan:", error);
            alert(`Sorry, an error occurred: ${error.message}`);
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleOptimizePlan = async () => {
        if (!mealPlanData) return;
        setIsGeneratingPlan(true);

        try {
            const data = await optimizeMealPlanAPI(mealPlanData);
            if (data.status === 'ok') {
                setOptimizedPlanData(data.optimized_plan);

                const swapCount = Object.values(data.optimized_plan.plan).filter(meal => meal.suggestion).length;
                if (swapCount > 0) {
                    setProactiveMessage(`Hi! I've analyzed your plan and found ${swapCount} smart swap${swapCount > 1 ? 's' : ''}. I've added the new suggestions to your meal plan. Ask me about them!`);
                    setShowChatbot(true);
                }
            } else {
                throw new Error("Failed to optimize plan.");
            }
        } catch (error) {
            console.error("Error optimizing plan:", error);
            alert("Sorry, there was an error optimizing your plan.");
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleGenerateShoppingList = async () => {
        if (!mealPlanData) return;

        const planText = `
            Breakfast: ${mealPlanData.plan.breakfast.name} - ${mealPlanData.plan.breakfast.description}
            Lunch: ${mealPlanData.plan.lunch.name} - ${mealPlanData.plan.lunch.description}
            Dinner: ${mealPlanData.plan.dinner.name} - ${mealPlanData.plan.dinner.description}
        `;

        try {
            const data = await generateShoppingListAPI(planText);
            if (data.status === 'ok') {
                setShoppingListData(data.shopping_list);
                setShowShoppingList(true);
            } else {
                throw new Error("Failed to get shopping list.");
            }
        } catch (error) {
            console.error("Error creating shopping list:", error);
            alert("Sorry, there was an error creating your shopping list.");
        }
    };

    const handleCreateRecipe = async (ingredients) => {
        if (!ingredients.trim()) return;
        setIsCreatingRecipe(true);
        setRecipeData(null);
        try {
            const data = await createRecipeAPI(ingredients, mealPlanDetails.dietaryPreference);
            if (data.status === 'ok') {
                setRecipeData(data.recipe);
            } else { 
                throw new Error(data.detail || "Failed to create recipe."); 
            }
        } catch (error) {
            alert(`Sorry, there was an error creating your recipe: ${error.message}`);
        } finally {
            setIsCreatingRecipe(false);
        }
    };
    // Function to handle smooth scrolling
    const handleNavClick = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    const goBackToMain = () => {
        setShowResults(false);
        setAnalysisResult(null);
        setError(null);
        setFoodInput('');
        setSelectedImage(null);
    };





    // Results Component

    // Error Display Component


    // Main render logic
    if (showResults) {

        return (

            <div className="app-container">
                <Background3D />
                <ResultsView analysisResult={analysisResult} goBackToMain={goBackToMain} />

                {error && <ErrorDisplay error={error} setError={setError} />}


            </div>
        );
    }

    // In App.jsx, replace your ENTIRE return statement with this:

    return (
        <div className="app-container">
           {/* Your Modals and Popups */}
  {showMealPlanForm && <MealPlanForm onGenerate={handleGeneratePlan} onClose={() => setShowMealPlanForm(false)} isGenerating={isGeneratingPlan} details={mealPlanDetails} setDetails={setMealPlanDetails} />}
  {showMealPlan && (
      <MealPlan
          planData={mealPlanData}
          userStats={userStats}
          optimizedPlanData={optimizedPlanData}
          onClose={() => {
              setShowMealPlan(false);
              setOptimizedPlanData(null);
          }}
          onOptimize={handleOptimizePlan}
          isOptimizing={isGeneratingPlan}
          onGenerateList={handleGenerateShoppingList} // <-- ADD THIS
      />
  )}

   {/* This new component displays the shopping list after the button is clicked */}
        {showShoppingList && <ShoppingList listData={shoppingListData} onClose={() => setShowShoppingList(false)} />}

            {showGoalModal && <GoalModal onGoalSelect={handleGoalSelection} />}
           {userGoal && showChatbot && (
                <Chatbot
                    goal={userGoal}
                    onClose={handleCloseChatbot}
                    mealPlan={optimizedPlanData || mealPlanData}
                    proactiveMessage={proactiveMessage}
                    clearProactiveMessage={() => setProactiveMessage('')}
                />
            )}

              {/* --- ADD THIS NEW COMPONENT --- */}
            {showRecipeModal && 
                <RecipeModal 
                    onClose={() => {
                        setShowRecipeModal(false);
                        setRecipeData(null); // Clear recipe when closing
                    }}
                    onCreate={handleCreateRecipe}
                    isCreating={isCreatingRecipe}
                    recipeData={recipeData}
                />
            }
            {/* --- END --- */}


            {/* Your Floating Chatbot Button */}
            {userGoal && !showChatbot && (
                <OpenChatbotButton
                    onClick={handleOpenChatbot}
                    className="tooltip-host"
                    data-tooltip="AI Health Assistant"
                >
                    <Bot />
                </OpenChatbotButton>
            )}

            {/* Your 3D Canvas and Error Display */}
            <Background3D />
            {error && <ErrorDisplay error={error} setError={setError} />}

            {/* Your Floating Side Menu */}
            <div className="floating-action-menu">
                {[
                    { id: 'hero', icon: ChefHat, label: 'Go to Top' },
                    { id: 'features', icon: Sparkles, label: 'View Features' },
                    { id: 'demo', icon: BarChart3, label: 'See Demo' },
                    { id: 'stats', icon: Users, label: 'Read Reviews' }
                ].map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => handleNavClick(id)}
                        className={`floating-menu-button tooltip-host ${currentSection === id ? 'active' : ''}`}
                        data-tooltip={label}
                    >
                        <Icon />
                    </button>
                ))}
            </div>

            {/* Your Main Page Structure */}
            <Navbar handleNavClick={handleNavClick} />

            {/* The SINGLE Correct <main> Tag Wrapping All Your Sections */}
            <main className="main-content">
                <Hero
                    heroRef={heroRef}
                    isVisible={isVisible.hero || false}
                    foodInput={foodInput}
                    setFoodInput={setFoodInput}
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    selectedImage={selectedImage}
                    handleImageUpload={handleImageUpload}
                    isAnalyzing={isAnalyzing}
                    handleAnalyze={handleAnalyze}
                    setShowMealPlanForm={setShowMealPlanForm}
                    setShowRecipeModal={setShowRecipeModal} // <-- ADD THIS LINE
                />
                <Features featuresRef={featuresRef} isVisible={isVisible.features || false} />
                <Demo demoRef={demoRef} />
                <Stats statsRef={statsRef} isVisible={isVisible.stats || false} />
                <CTA ctaRef={ctaRef} isVisible={isVisible.cta || false} />
            </main>

            <Footer />
        </div>
    );
};

export default App;
