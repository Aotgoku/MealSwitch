import React from 'react';
import MacroCard from './MacroCard';
import { ArrowLeft, Flame, Utensils, Wheat, Droplets, CheckCircle, Star, AlertCircle } from 'lucide-react';

const ResultsView = ({ analysisResult, goBackToMain }) => {
    if (!analysisResult) return null;

    const { nutrition, recommendations } = analysisResult;

    return (
        <div className="results-container">
            <div className="results-header">
                <button onClick={goBackToMain} className="back-button">
                    <ArrowLeft />
                    <span>Back to Analyzer</span>
                </button>
                <h1 className="results-title">Nutrition Analysis Results</h1>
            </div>

            {nutrition?.status === 'ok' && nutrition?.result ? (
                <div className="results-content">
                    <div className="food-summary">
                        <h2 className="food-name">{nutrition.result.food_name}</h2>
                        <p className="portion-info">Portion Size: {nutrition.result.portion_size}</p>
                    </div>

                    <div className="nutrition-grid">
                        <MacroCard icon={Flame} title="Calories" value={Math.round(nutrition.result.nutrition.calories)} colorClass="color-red" description="Energy for your day" />
                        <MacroCard icon={Utensils} title="Protein" value={`${Math.round(nutrition.result.nutrition.protein_g)}g`} colorClass="color-blue" description="For muscle repair" />
                        <MacroCard icon={Wheat} title="Carbs" value={`${Math.round(nutrition.result.nutrition.carbs_g)}g`} colorClass="color-green" description="For sustained energy" />
                        <MacroCard icon={Droplets} title="Fats" value={`${Math.round(nutrition.result.nutrition.fat_g)}g`} colorClass="color-purple" description="For brain health" />
                    </div>

                    {nutrition.result.health_info && (
                        <div className="health-info">
                            <h3>Health Information</h3>
                            <div className="health-details">
                                {nutrition.result.health_info.calories_saved > 0 && (
                                    <div className="health-item">
                                        <CheckCircle className="health-icon positive" />
                                        <span>Calories Saved: {Math.round(nutrition.result.health_info.calories_saved)}</span>
                                    </div>
                                )}
                                <div className="health-item">
                                    <Star className="health-icon" />
                                    <span>Category: {nutrition.result.health_info.category}</span>
                                </div>
                                {nutrition.result.health_info.risky_for !== 'None' && (
                                    <div className="health-item">
                                        <AlertCircle className="health-icon warning" />
                                        <span>Risky for: {nutrition.result.health_info.risky_for}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {recommendations?.status === 'ok' && recommendations?.results && (
                        <div className="recommendations">
                            <h3>Similar Foods & Alternatives</h3>
                            <div className="recommendations-grid">
                                {recommendations.results.slice(0, 4).map((item, index) => (
                                    <div key={index} className="recommendation-card">
                                        <h4>{item.food_name}</h4>
                                        <div className="rec-nutrition">
                                            <span>{Math.round(item.calories)} cal</span>
                                            <span>{Math.round(item.protein_g)}g protein</span>
                                            <span>{Math.round(item.carbs_g)}g carbs</span>
                                            <span>{Math.round(item.fat_g)}g fat</span>
                                        </div>
                                        <div className="similarity-score">
                                            Similarity: {(item.similarity_score * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-results">
                    <AlertCircle className="no-results-icon" />
                    <h3>Food Not Found</h3>
                    <p>Sorry, we couldn't find nutrition information for "{analysisResult.query}". Try a different food name or check your spelling.</p>
                    <button onClick={goBackToMain} className="try-again-button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultsView;