import React, { useState } from 'react';
import styled from 'styled-components';
import { X, ChefHat, Sparkles } from 'lucide-react';

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
  z-index: 1002;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: #1c1917;
  padding: 2rem;
  border-radius: 16px;
  max-width: 700px;
  width: 95%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  color: #f2f2f2;
  max-height: 90vh;
  overflow-y: auto;
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

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.75rem;
  background: #292524;
  border: 1px solid #44403c;
  color: white;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  margin-top: 1rem;
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
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
  &:disabled {
    background: #44403c;
    cursor: not-allowed;
  }
`;

const RecipeDisplay = styled.div`
  margin-top: 2rem;
`;

const RecipeTitle = styled.h3`
  color: #f97316;
`;

const RecipeSection = styled.div`
  margin-top: 1.5rem;
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

const RecipeModal = ({ onClose, onCreate, isCreating, recipeData }) => {
  const [ingredients, setIngredients] = useState('');

  return (
    <ModalOverlay>
      <ModalContainer>
        <CloseButton onClick={onClose}><X /></CloseButton>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>
          <ChefHat style={{ verticalAlign: 'bottom', marginRight: '0.5rem' }} />
          Create AI Recipe
        </h2>

        {!recipeData ? (
          <>
            <p style={{ textAlign: 'center', color: '#a8a29e' }}>
              Enter the ingredients you have, and our AI chef will invent a recipe for you!
            </p>
            <Textarea 
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken breast, rice, tomatoes, onion, garlic"
            />
            <GenerateButton onClick={() => onCreate(ingredients)} disabled={isCreating || !ingredients.trim()}>
              {isCreating ? <Spinner /> : <> <Sparkles size={20}/> Create Recipe</>}
            </GenerateButton>
          </>
        ) : (
          <RecipeDisplay>
            <RecipeTitle>{recipeData.recipe_name}</RecipeTitle>
            <p><em>{recipeData.description}</em></p>
            
            <RecipeSection>
              <h4>Ingredients</h4>
              <ul>
                {recipeData.ingredients.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </RecipeSection>

            <RecipeSection>
              <h4>Instructions</h4>
              <ol>
                {recipeData.instructions.map((step, index) => <li key={index} style={{marginBottom: '0.5rem'}}>{step}</li>)}
              </ol>
            </RecipeSection>
          </RecipeDisplay>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default RecipeModal;