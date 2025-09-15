import React from 'react';
import { Brain, Camera, TrendingUp } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, gradientClass, delay, isVisible }) => (
    <div className={`feature-card ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
        <div className={`feature-card-icon-wrapper ${gradientClass}`}>
            <Icon className="feature-card-icon" />
        </div>
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-description">{description}</p>
    </div>
);

const Features = ({ featuresRef, isVisible }) => {
  return (
    <section id="features" ref={featuresRef} className="features-section">
      <h2 className="section-title">Revolutionary Features</h2>
      <p className="section-subtitle">Experience the future of nutrition analysis with cutting-edge AI.</p>
      <div className="features-grid">
        <FeatureCard icon={Brain} title="AI-Powered Analysis" description="Advanced algorithms analyze meals with over 95% accuracy." gradientClass="grad-purple" delay={0} isVisible={isVisible} />
        <FeatureCard icon={Camera} title="Smart Image Recognition" description="Snap a photo of your meal and let our AI identify every ingredient." gradientClass="grad-blue" delay={150} isVisible={isVisible} />
        <FeatureCard icon={TrendingUp} title="Personalized Insights" description="Get recommendations to optimize your diet based on your goals." gradientClass="grad-green" delay={300} isVisible={isVisible} />
      </div>
    </section>
  );
};

export default Features;