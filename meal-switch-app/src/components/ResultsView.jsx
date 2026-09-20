import React from 'react';
import MacroCard from './MacroCard';
import { ArrowLeft, Flame, Utensils, Wheat, Droplets, CheckCircle, Star, AlertCircle, Sparkles } from 'lucide-react';

const ResultsView = ({ analysisResult, goBackToMain }) => {
    if (!analysisResult) return null;

    const { nutrition, recommendations } = analysisResult;
    const foodName = nutrition?.result?.food_name || nutrition?.result?.nutrition?.food_name || analysisResult?.query;
    const portionInfo = nutrition?.result?.portion_size || nutrition?.result?.nutrition?.portion_description || "Standard serving";
    const macros = nutrition?.result?.nutrition || {};
    const expertSwap = nutrition?.result?.expert_suggestion;
    const healthInfo = nutrition?.result?.health_info;

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
                        <h2 className="food-name">{foodName}</h2>
                        <p className="portion-info">Portion Size: {portionInfo}</p>
                    </div>

                    {/* Prominent Smart Swap Recommendation Card */}
                    {expertSwap && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.08))',
                            border: '1px solid rgba(34, 197, 94, 0.4)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            margin: '1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontWeight: 600, fontSize: '0.95rem' }}>
                                    <Sparkles size={18} />
                                    <span>Smart MealSwitch Swap Available</span>
                                </div>
                                <p style={{ margin: '0.5rem 0 0', color: '#f1f5f9', fontSize: '1.1rem' }}>
                                    Swap <strong style={{ color: '#f87171' }}>{expertSwap.original}</strong> with <strong style={{ color: '#4ade80' }}>{expertSwap.suggestion}</strong>
                                </p>
                            </div>
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.25)',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                color: '#4ade80',
                                fontWeight: 700,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <Flame size={16} />
                                Save {expertSwap.calories_saved} kcal
                            </div>
                        </div>
                    )}

                    <div className="nutrition-grid">
                        <MacroCard icon={Flame} title="Calories" value={Math.round(macros.calories || 0)} colorClass="color-red" description="Energy for your day" />
                        <MacroCard icon={Utensils} title="Protein" value={`${Math.round(macros.protein_g || 0)}g`} colorClass="color-blue" description="For muscle repair" />
                        <MacroCard icon={Wheat} title="Carbs" value={`${Math.round(macros.carbs_g || 0)}g`} colorClass="color-green" description="For sustained energy" />
                        <MacroCard icon={Droplets} title="Fats" value={`${Math.round(macros.fat_g || 0)}g`} colorClass="color-purple" description="For brain health" />
                    </div>

                    {healthInfo && (
                        <div className="health-info">
                            <h3>Health Information</h3>
                            <div className="health-details">
                                {healthInfo.calories_saved > 0 && (
                                    <div className="health-item">
                                        <CheckCircle className="health-icon positive" />
                                        <span>Calories Saved: {Math.round(healthInfo.calories_saved)}</span>
                                    </div>
                                )}
                                <div className="health-item">
                                    <Star className="health-icon" />
                                    <span>Category: {healthInfo.category}</span>
                                </div>
                                {healthInfo.risky_for && healthInfo.risky_for !== 'None' && healthInfo.risky_for !== '—' && (
                                    <div className="health-item">
                                        <AlertCircle className="health-icon warning" />
                                        <span>Risky for: {healthInfo.risky_for}</span>
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