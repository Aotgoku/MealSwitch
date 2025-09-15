import React from 'react';
import { Users, BarChart3, Star, Award } from 'lucide-react';

const Stats = ({ statsRef, isVisible }) => {
    return (
        <section id="stats" ref={statsRef} className="stats-section">
            <h2 className="section-title">Trusted by Thousands</h2>
            <p className="section-subtitle">Join a growing community revolutionizing their nutrition journey.</p>
            <div className="stats-grid">
                {[
                    { icon: Users, value: '50K+', label: 'Active Users' },
                    { icon: BarChart3, value: '2M+', label: 'Meals Analyzed' },
                    { icon: Star, value: '4.9/5', label: 'User Rating' },
                    { icon: Award, value: '99.2%', label: 'Analysis Accuracy' }
                ].map(({ icon: Icon, value, label }, index) => (
                    <div key={label} className={`stat-item ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: `${index * 150}ms` }}>
                        <div className="stat-icon-wrapper"><Icon /></div>
                        <div className="stat-value">{value}</div>
                        <div className="stat-label">{label}</div>
                    </div>
                ))}
            </div>
            <div className={`testimonial-card ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                <div className="testimonial-stars">
                    {[...Array(5)].map((_, i) => <Star key={i} />)}
                </div>
                <blockquote className="testimonial-quote">
                    "MealSwitch has completely transformed how I approach nutrition. The AI is incredibly accurate, and I love how easy it is to track my macros."
                </blockquote>
                <div className="testimonial-author">
                    <div className="author-avatar">SJ</div>
                    <div>
                        <div className="author-name">Sarah Johnson</div>
                        <div className="author-title">Fitness Coach & Nutritionist</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stats;