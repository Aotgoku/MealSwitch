import React from 'react';
import styled from 'styled-components';
import { X, Flame, Utensils, Sun, Moon, Zap, Sparkles } from 'lucide-react';

// --- CSS FIXES ARE IN THIS SECTION ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  /* This allows the overlay to scroll if the window is very short */
  overflow-y: auto; 
  padding: 2rem 0;
`;

const PlanContainer = styled.div`
  background: #1c1917;
  padding: 2rem;
  border-radius: 16px;
  max-width: 800px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  color: #f2f2f2;
  /* This ensures the modal doesn't get stuck to the top/bottom */
  margin: auto; 
`;

// --- The rest of the file is unchanged ---

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #a8a29e;
  cursor: pointer;
  &:hover { color: white; }
`;

const MealCard = styled.div`
  background: #292524;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #44403c;
  transition: all 0.3s ease;
`;

const SuggestionBox = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(22, 163, 74, 0.1);
  border-left: 3px solid #22c55e;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const OptimizeButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  background: linear-gradient(to right, #a855f7, #ec4899);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
  }
  &:disabled {
    background: #44403c;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const MealPlan = ({ planData, optimizedPlanData, onClose, onOptimize, isOptimizing }) => {
  const displayData = optimizedPlanData || planData;
  if (!displayData || !displayData.plan) return null;

  const { plan, totalCalories, reason } = displayData;

  const Meal = ({ mealType, meal, icon }) => (
    <MealCard>
        <h3>{icon} {mealType}</h3>
        <h4>{meal.name}</h4>
        <p>{meal.description}</p>
        <p><Flame size={16} /> ~{meal.calories} kcal</p>
        {meal.suggestion && (
            <SuggestionBox>
                <strong><Sparkles size={16} /> MealSwitch Suggestion:</strong> Swap with <strong>{meal.suggestion.suggestion}</strong> to save an extra {meal.suggestion.calories_saved} calories!
                <br /><small>(Our model matched this to: {meal.suggestion.original})</small>
            </SuggestionBox>
        )}
    </MealCard>
  );

  return (
    <ModalOverlay>
      <PlanContainer>
        <CloseButton onClick={onClose}><X /></CloseButton>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Your Personalized Meal Plan</h2>
        <p style={{ textAlign: 'center', color: '#a8a29e' }}>Total Estimated Calories: {totalCalories}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
            <Meal mealType="Breakfast" meal={plan.breakfast} icon={<Sun size={20} />} />
            <Meal mealType="Lunch" meal={plan.lunch} icon={<Utensils size={20} />} />
            <Meal mealType="Dinner" meal={plan.dinner} icon={<Moon size={20} />} />
        </div>

        <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #f97316', marginBottom: '1rem' }}>
          <strong>Nutritionist's Note:</strong> {reason}
        </div>

        {!optimizedPlanData && (
            <OptimizeButton onClick={onOptimize} disabled={isOptimizing}>
                {isOptimizing ? <Spinner /> : <><Zap /> Optimize This Plan with MealSwitch AI</>}
            </OptimizeButton>
        )}

      </PlanContainer>
    </ModalOverlay>
  );
};

export default MealPlan;

