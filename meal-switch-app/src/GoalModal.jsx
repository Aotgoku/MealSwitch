import React, { useState } from 'react';
import styled from 'styled-components';
import { Target, Zap, Heart } from 'lucide-react';

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
`;

const ModalContent = styled.div`
  background: #1c1917;
  padding: 2rem;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const GoalOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  background: ${props => props.selected ? 'linear-gradient(to right, #f97316, #ec4899)' : '#292524'};
  border: 1px solid #44403c;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #44403c;
  }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: linear-gradient(to right, #f97316, #ec4899);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const GoalModal = ({ onGoalSelect }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const goals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: <Zap /> },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: <Target /> },
    { id: 'healthy_lifestyle', label: 'Healthy Lifestyle', icon: <Heart /> }
  ];

  return (
    <ModalOverlay>
      <ModalContent>
        <h2>What's Your Goal?</h2>
        <p>Select your primary goal to get personalized recommendations.</p>
        <div>
          {goals.map(goal => (
            <GoalOption
              key={goal.id}
              selected={selectedGoal === goal.id}
              onClick={() => setSelectedGoal(goal.id)}
            >
              {goal.icon}
              <span style={{ marginLeft: '10px' }}>{goal.label}</span>
            </GoalOption>
          ))}
        </div>
        <StartButton onClick={() => onGoalSelect(selectedGoal)}>
          Start My Journey
        </StartButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GoalModal;