import React from 'react';
import { ChefHat } from 'lucide-react';

const Navbar = ({ handleNavClick }) => {
  return (
    <nav className="main-nav">
      <div className="nav-content">
        <div className="nav-logo-area">
          <div className="nav-logo-icon-bg">
            <ChefHat className="nav-logo-icon" />
          </div>
          <div>
            <h1 className="nav-logo-title">MealSwitch</h1>
            <p className="nav-logo-subtitle">ML Nutrition Analytics</p>
          </div>
        </div>
        <div className="nav-links">
          {[
            { name: 'Features', id: 'features', tooltip: 'Learn about our features' },
            { name: 'Reviews', id: 'stats', tooltip: 'See what users are saying' },
            { name: 'About', id: 'About', tooltip: 'Learn more about MealSwitch' }
          ].map((item) => (
            <a
              key={item.name}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
              className="nav-link tooltip-host"
              data-tooltip={item.tooltip}
            >
              {item.name}
            </a>
          ))}
        </div>
        <button className="nav-button">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;