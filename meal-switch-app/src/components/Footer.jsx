import React from 'react';
import { ChefHat } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <div className="nav-logo-area">
                        <div className="nav-logo-icon-bg"><ChefHat className="nav-logo-icon" /></div>
                        <div>
                            <h1 className="nav-logo-title">MealSwitch</h1>
                            <p className="nav-logo-subtitle">AI Nutrition Analytics</p>
                        </div>
                    </div>
                </div>
                <div className="footer-column">
                    <h4>Product</h4>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                    <a href="#">API Access</a>
                </div>
                <div className="footer-column">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">Press</a>
                </div>
                <div className="footer-column">
                    <h4>Resources</h4>
                    <a href="#">Blog</a>
                    <a href="#">Help Center</a>
                    <a href="#">Privacy</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 MealSwitch. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;