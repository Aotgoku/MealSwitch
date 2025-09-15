import React from 'react';
import { Sparkles, Play } from 'lucide-react';

const CTA = ({ ctaRef, isVisible }) => {
    return (
        <section id="cta" ref={ctaRef} className="cta-section">
            <h2 className={`section-title ${isVisible ? 'is-visible' : ''}`}>Ready to Transform Your Nutrition?</h2>
            <p className={`section-subtitle ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '150ms' }}>
                Start your journey towards healthier living today. No credit card required.
            </p>
            <div className={`cta-buttons ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                <button className="cta-button-primary">
                    <Sparkles />
                    <span>Start Free Trial</span>
                </button>
                <button className="cta-button-secondary">
                    <Play />
                    <span>Watch Demo</span>
                </button>
            </div>
        </section>
    );
};

export default CTA;