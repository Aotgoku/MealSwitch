import React from 'react';
import styled from 'styled-components';
import { X, Zap } from 'lucide-react';

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
  z-index: 1001; /* Higher z-index to appear over the chatbot */
`;

const FormContainer = styled.div`
  background: #1c1917;
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  color: #f2f2f2;
`;

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

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Two equal columns */
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  color: #a8a29e;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #292524;
  border: 1px solid #44403c;
  color: white;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: #292524;
  border: 1px solid #44403c;
  color: white;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 700;
  background: var(--brand-gradient);
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
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
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
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const MealPlanForm = ({ onGenerate, onClose, isGenerating, details, setDetails }) => {
  const { age, weight, height, gender, targetCalories } = details;

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.id]: e.target.value });
  };

  return (
    <ModalOverlay>
      <FormContainer>
        <CloseButton onClick={onClose}><X /></CloseButton>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>Create Your AI Meal Plan</h2>
        <p style={{ textAlign: 'center', color: '#a8a29e', margin: '0 0 2rem 0' }}>
          Provide your details for a highly personalized plan.
        </p>

        <InputGrid>
          <InputWrapper>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={handleChange} placeholder="e.g., 28" />
          </InputWrapper>
          <InputWrapper>
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" value={gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </Select>
          </InputWrapper>
          <InputWrapper>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" value={weight} onChange={handleChange} placeholder="e.g., 75" />
          </InputWrapper>
          <InputWrapper>
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" value={height} onChange={handleChange} placeholder="e.g., 180" />
          </InputWrapper>
        </InputGrid>
        
        <Label htmlFor="targetCalories">Target Daily Calories</Label>
        <Input id="targetCalories" type="number" value={targetCalories} onChange={handleChange} style={{ marginBottom: '1.5rem' }} />

        <GenerateButton onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? <Spinner /> : '✨ Generate My AI Plan'}
        </GenerateButton>
      </FormContainer>
    </ModalOverlay>
  );
};

export default MealPlanForm;
