import React from 'react';
import { Camera, Upload, Zap, Sparkles, Brain, ArrowRight } from 'lucide-react';

const Hero = ({ 
    heroRef, 
    isVisible, // This is now just true or false
    foodInput, 
    setFoodInput, 
    currentTab, 
    setCurrentTab, 
    selectedImage, 
    handleImageUpload, 
    isAnalyzing, 
    handleAnalyze,
    setShowMealPlanForm
}) => {
    return (
        // The outer div and fragment were removed as they are not needed.
        <section id="hero" ref={heroRef} className="hero-section">
            {/* CORRECTED USAGE: Just use 'isVisible' directly */}
            <div className={`hero-badge ${isVisible ? 'is-visible' : ''}`}>
                <Sparkles className="hero-badge-icon" />
                <span>Powered by Advanced AI</span>
            </div>
            <h1 className={`hero-title ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '100ms' }}>
                <span className="hero-title-gradient">MealSwitch</span>
                <div className="hero-title-glow"></div>
            </h1>
            <p className={`hero-subtitle ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '200ms' }}>
                Transform your nutrition journey with
                <span className="hero-subtitle-highlight"> ML-powered macro analysis with healthy substitutes</span>.
            </p>

            <div className={`input-module ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                <div className="tab-selector">
                    <div className="tab-selector-bg">
                        {[
                            { id: 'text', icon: Sparkles, label: 'Smart Text Input' },
                            { id: 'image', icon: Camera, label: 'Image Analysis' }
                        ].map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => setCurrentTab(id)} className={`tab-button ${currentTab === id ? 'active' : ''}`}>
                                <Icon className="tab-icon" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="input-area">
                    {currentTab === 'text' ? (
                        <div className="text-input-container">
                            <div className="input-field-wrapper">
                                <input type="text" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="e.g., 'grilled salmon with quinoa'" className="text-input" />
                                <Sparkles className="input-field-icon" />
                            </div>
                            <div className="suggestions">
                                <span>Try:</span>
                                {['Chicken Bowl', 'Protein Smoothie', 'Avocado Toast'].map((suggestion) => (
                                    <button key={suggestion} onClick={() => setFoodInput(suggestion)} className="suggestion-chip">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="image-input-container">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="image-input-hidden" id="image-upload" />
                            <label htmlFor="image-upload" className="image-drop-zone">
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Selected meal" className="image-preview" />
                                ) : (
                                    <div className="image-drop-placeholder">
                                        <Upload className="upload-icon" />
                                        <p>Drop an image or click to upload</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    )}
                    <button onClick={handleAnalyze} disabled={(!foodInput.trim() && !selectedImage) || isAnalyzing} className="analyze-button">
                        {isAnalyzing ? (<div className="spinner"></div>) : (
                            <div className="analyze-button-content">
                                <Brain />
                                <span>Analyze with AI</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <button onClick={() => setShowMealPlanForm(true)} className="cta-button-primary">
                    <Zap />
                    <span>Generate Personalized AI Meal Plan</span>
                </button>
            </div>
        </section>
    );
};

export default Hero;