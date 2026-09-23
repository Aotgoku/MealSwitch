import React from 'react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#050505] pt-16 pb-12 border-t border-white/5 text-[#F5F5F5] font-sans mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#A19D98]">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="MealSwitch" className="w-8 h-8 object-contain" />
          <span className="text-xl font-serif text-white tracking-tight">MealSwitch</span>
          <span className="text-xs text-[#A19D98]/60 ml-2">© 2026 MealSwitch</span>
        </div>
        
        <div className="flex items-center gap-6 text-xs">
          <span>AI Food Vision</span>
          <span>•</span>
          <span>BMR/TDEE Health OS</span>
          <span>•</span>
          <span>Metabolic Swaps</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;