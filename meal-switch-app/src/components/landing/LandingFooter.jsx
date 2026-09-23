import React, { useState } from 'react';
import LegalModal from '../LegalModal';
import logoImg from '../../assets/logo.png';

const LandingFooter = ({ onSelectView }) => {
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'terms' });

  const openLegal = (tab) => {
    setLegalModal({ isOpen: true, tab });
  };

  return (
    <>
      <footer className="bg-[#050505] pt-24 pb-12 border-t border-white/5 text-[#F5F5F5] font-sans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            {/* Col 1: Brand Story */}
            <div className="col-span-2 md:pr-12">
              <div
                className="flex items-center gap-3 mb-8 cursor-pointer group"
                onClick={() => onSelectView?.('landing')}
              >
              <img src={logoImg} alt="MealSwitch" className="w-10 h-10 object-contain" />
                <span className="text-3xl font-serif text-white mt-1 tracking-tight">
                  MealSwitch
                </span>
              </div>
              <p className="text-[#A19D98] font-sans font-light text-base max-w-sm leading-relaxed">
                Algorithmic metabolic targeting, intelligent dietary alternatives, and personal health tracking.
              </p>
            </div>

            {/* Col 2: Workspace Tools */}
            <div>
              <h4 className="text-white font-sans text-xs uppercase tracking-widest font-bold mb-6">
                Workspace
              </h4>
              <ul className="space-y-4 text-sm font-sans">
                <li>
                  <button
                    onClick={() => onSelectView?.('scanner')}
                    className="text-[#A19D98] hover:text-[#FF7300] transition-colors cursor-pointer"
                  >
                    Nutrition Scanner
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectView?.('planner')}
                    className="text-[#A19D98] hover:text-[#FF7300] transition-colors cursor-pointer"
                  >
                    Adaptive Meal Planner
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectView?.('recipes')}
                    className="text-[#A19D98] hover:text-[#FF7300] transition-colors cursor-pointer"
                  >
                    Pantry Recipe Studio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectView?.('dashboard')}
                    className="text-[#A19D98] hover:text-[#FF7300] transition-colors cursor-pointer"
                  >
                    Health OS & Metrics
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Intelligence & Architecture */}
            <div>
              <h4 className="text-white font-sans text-xs uppercase tracking-widest font-bold mb-6">
                Architecture
              </h4>
              <ul className="space-y-4 text-sm font-sans text-[#A19D98]">
                <li>Mifflin-St Jeor TDEE Engine</li>
                <li>TF-IDF Nutritional Substitution</li>
                <li>Gemini Multimodal Vision</li>
                <li>PostgreSQL Cloud Persistence</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-[#A19D98] font-sans text-xs">
            <p>© 2026 MealSwitch. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => openLegal('privacy')}
                className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-[#A19D98] p-0 text-xs font-sans"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => openLegal('terms')}
                className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-[#A19D98] p-0 text-xs font-sans"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => openLegal('standards')}
                className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-[#A19D98] p-0 text-xs font-sans"
              >
                Clinical Standards
              </button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModal.isOpen}
        initialTab={legalModal.tab}
        onClose={() => setLegalModal({ ...legalModal, isOpen: false })}
      />
    </>
  );
};

export default LandingFooter;
