import React from 'react';
import styled from 'styled-components';

const SwapContainer = styled.div`
  background-color: #333;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  border-left: 4px solid #f97316;
`;

const SwapPair = styled.div`
  margin-bottom: 16px;
`;

const FoodTitle = styled.h4`
  color: #f97316;
  margin-top: 0;
  margin-bottom: 4px;
  text-transform: capitalize;
`;

const FoodDetails = styled.p`
  margin: 0;
  font-size: 0.9em;
  color: #ccc;
`;

const NutritionalBenefits = styled.ul`
  padding-left: 20px;
  margin: 8px 0;
  font-size: 0.9em;
  color: #ddd;
`;

const SmartSwaps = ({ data }) => {
  if (!data || !data.smartSwaps) return null;

  return (
    <SwapContainer>
      {data.smartSwaps.map((swap, index) => (
        <SwapPair key={index}>
          <FoodTitle>Swap This: {swap.originalFood.foodName}</FoodTitle>
          <FoodDetails>
            Calories: {swap.originalFood.calories}, Fat: {swap.originalFood.fat}g
          </FoodDetails>
          <hr style={{ border: '1px solid #444', margin: '12px 0' }} />
          <FoodTitle>For This: {swap.suggestedFood.foodName}</FoodTitle>
          <FoodDetails>
            Calories: {swap.suggestedFood.calories}, Fat: {swap.suggestedFood.fat}g
          </FoodDetails>
          <NutritionalBenefits>
            {swap.suggestedFood.nutritionalBenefits.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </NutritionalBenefits>
        </SwapPair>
      ))}
    </SwapContainer>
  );
};

export default SmartSwaps;