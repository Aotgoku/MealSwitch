import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import LandingPage from './components/landing/LandingPage';
import Navbar from './components/Navbar';
import NutritionView from './components/views/NutritionView';
import MealPlannerView from './components/views/MealPlannerView';
import RecipeStudioView from './components/views/RecipeStudioView';
import DashboardView from './components/views/DashboardView';
import AICoachDrawer from './components/AICoachDrawer';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { getCurrentUserAPI, getUserProfileAPI, saveMealPlanAPI } from './services/api';
import './App.css';

const App = () => {
  // Navigation State: 'landing' | 'scanner' | 'planner' | 'recipes' | 'dashboard'
  // Default is 'landing' so the hero landing page is the very first thing seen
  const [currentView, setCurrentView] = useState('landing');

  // Authentication & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('mealswitch_token') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingPlanToSave, setPendingPlanToSave] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // AI Assistant Drawer
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Fetch & Sync User Profile
  const fetchUserProfile = useCallback(async (token) => {
    if (!token) return;
    try {
      const profile = await getUserProfileAPI(token);
      setUserProfile(profile);
    } catch (err) {
      console.warn("Couldn't fetch user profile:", err.message);
    }
  }, []);

  // Rehydrate Session on Mount / Token Change
  useEffect(() => {
    if (authToken) {
      getCurrentUserAPI(authToken)
        .then(user => {
          setCurrentUser(user);
          fetchUserProfile(authToken);
        })
        .catch(() => {
          localStorage.removeItem('mealswitch_token');
          setAuthToken(null);
          setCurrentUser(null);
          setUserProfile(null);
        });
    } else {
      setCurrentUser(null);
      setUserProfile(null);
    }
  }, [authToken, fetchUserProfile]);

  const handleAuthSuccess = async (token, user) => {
    localStorage.setItem('mealswitch_token', token);
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthOpen(false);
    fetchUserProfile(token);

    // Auto-save pending guest plan to PostgreSQL if user just authenticated
    if (pendingPlanToSave) {
      try {
        await saveMealPlanAPI(pendingPlanToSave, token);
        setPendingPlanToSave(null);
        setToastMessage({
          type: 'success',
          text: 'Meal plan successfully synchronized to your PostgreSQL cloud account.'
        });
        setTimeout(() => setToastMessage(null), 5000);
      } catch (err) {
        console.error("Failed to auto-save pending plan:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mealswitch_token');
    setAuthToken(null);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const handleProfileUpdated = useCallback((updated) => {
    setUserProfile(prev => ({ ...prev, ...updated }));
  }, []);

  const triggerToast = (text, type = 'info') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#FF7300]/30 selection:text-white">
      {/* 1. If in Landing Page view, render the Ultra-Sleek Video Hero Landing Page */}
      {currentView === 'landing' ? (
        <LandingPage
          onSelectView={(viewId) => setCurrentView(viewId)}
          onLaunchApp={() => setCurrentView('scanner')}
          user={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <>
          {/* 2. SaaS Workspace Viewport */}
          <Navbar
            currentView={currentView}
            onSelectView={setCurrentView}
            user={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
          />

          <main className="main-content">
            <div className="view-transition" key={currentView}>
              {currentView === 'scanner' && (
                <NutritionView />
              )}

              {currentView === 'planner' && (
                <MealPlannerView
                  initialDetails={{
                    age: userProfile?.age ? String(userProfile.age) : '25',
                    weight: userProfile?.weight_kg ? String(userProfile.weight_kg) : '70',
                    height: userProfile?.height_cm ? String(userProfile.height_cm) : '175',
                    gender: userProfile?.gender || 'male',
                    activityLevel: userProfile?.activity_level || 'moderate',
                    dietaryPreference: userProfile?.dietary_preference || 'veg'
                  }}
                  initialGoal={userProfile?.primary_goal || 'muscle_gain'}
                  token={authToken}
                  user={currentUser}
                  onRequireAuth={(planPayload) => {
                    if (planPayload) setPendingPlanToSave(planPayload);
                    setIsAuthOpen(true);
                  }}
                  onPlanSaved={() => {
                    triggerToast('Meal plan saved to PostgreSQL database.', 'success');
                  }}
                  onShowToast={triggerToast}
                />
              )}

              {currentView === 'recipes' && (
                <RecipeStudioView />
              )}

              {currentView === 'dashboard' && (
                <DashboardView
                  user={currentUser}
                  token={authToken}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onAuthSuccess={handleAuthSuccess}
                  onProfileUpdated={handleProfileUpdated}
                  onSelectView={setCurrentView}
                />
              )}
            </div>
          </main>

          <Footer />
        </>
      )}

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-[#FF7300]/40 text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-3 font-sans text-xs max-w-sm backdrop-blur-xl">
          <CheckCircle className="w-4 h-4 text-[#FF7300] shrink-0" />
          <span className="leading-snug">{toastMessage.text}</span>
        </div>
      )}

      {/* Slide-Over AI Health Assistant */}
      <AICoachDrawer
        isOpen={isCoachOpen}
        isLanding={currentView === 'landing'}
        onToggle={(openState) => {
          setIsCoachOpen(typeof openState === 'boolean' ? openState : !isCoachOpen);
        }}
        userGoal={userProfile?.primary_goal}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
