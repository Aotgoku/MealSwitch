import React from 'react';

const MacroCard = ({ icon: Icon, title, value, colorClass, description }) => (
    <div className={`macro-card ${colorClass}`}>
        <div className="macro-card-content">
            <Icon className="macro-card-icon" />
            <h3 className="macro-card-value">{value}</h3>
            <p className="macro-card-title">{title}</p>
            <p className="macro-card-description">{description}</p>
        </div>
    </div>
);

export default MacroCard;