import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Scale } from 'lucide-react';

const LegalModal = ({ isOpen, initialTab = 'terms', onClose }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div 
        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-[#F5F5F5] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF7300]" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-normal text-white">Trust, Legal & Clinical Standards</h2>
              <p className="text-xs text-[#A19D98]">Platform governance, data privacy, and mathematical methodologies.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#A19D98] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-white/10 px-6 gap-2 bg-[#0E0E0E]">
          {[
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
            { id: 'standards', label: 'Clinical Standards', icon: Scale },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-3.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === id 
                  ? 'border-[#FF7300] text-white' 
                  : 'border-transparent text-[#A19D98] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#A19D98] leading-relaxed">
          {activeTab === 'terms' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">1. Informational Health Disclaimer</h3>
                <p>
                  MealSwitch provides computational nutritional calculations, meal recommendations, and caloric targets 
                  based on established physiological formulas. The platform is not a medical device, nor does it provide 
                  clinical diagnoses, treatment, or individualized medical dietary prescriptions. Always consult a licensed 
                  physician or registered dietitian before undertaking significant caloric alterations or dietary changes.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">2. Algorithmic Caloric Estimates</h3>
                <p>
                  Caloric and macronutrient figures are computed via verified algorithmic models (including the Mifflin-St Jeor 
                  energy expenditure formula and USDA nutritional datasets). Variations in metabolic efficiency, food preparation, 
                  and digestive absorption may cause actual energy yields to deviate from estimates.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">3. Permitted Platform Usage</h3>
                <p>
                  The platform is provided for personal wellness tracking and technical evaluation. Automated scraping, reverse 
                  engineering of the API endpoints, or unauthorized load injection is strictly prohibited under our terms.
                </p>
              </div>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">1. User Data & Authentication Security</h3>
                <p>
                  Authentication credentials utilize industry-standard bcrypt one-way hashing with salt rounds. Raw user passwords 
                  are never logged or transmitted in plain text. Session persistence is secured via JSON Web Tokens (JWT) using HMAC-SHA256 signatures.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">2. Biometric Parameter Storage</h3>
                <p>
                  User biometric attributes (age, weight, height, gender, activity level) are stored in isolated relational PostgreSQL 
                  tables strictly to parameterize your personal caloric curves and generate meal schedules.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">3. Zero Data Commercialization</h3>
                <p>
                  MealSwitch does not sell, broker, or monetize user dietary histories or biometric telemetry to third-party ad networks, 
                  insurers, or data brokers.
                </p>
              </div>
            </>
          )}

          {activeTab === 'standards' && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">1. Basal Metabolic Rate (BMR)</h3>
                <p>
                  Calculations utilize the clinical Mifflin-St Jeor equation (Mifflin et al., 1990), recognized by the Academy 
                  of Nutrition and Dietetics as the most reliable predictive equation for healthy individuals:
                </p>
                <div className="my-2 p-3 rounded-xl bg-[#171717] border border-white/5 font-mono text-[11px] text-[#F5F5F5]">
                  Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5<br/>
                  Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">2. Total Daily Energy Expenditure (TDEE)</h3>
                <p>
                  TDEE is derived using standard physical activity coefficients (PAL): Sedentary (1.20), Moderate exercise (1.55), 
                  Heavy athletic training (1.75). Caloric target adjustments apply controlled deficits (-400 to -500 kcal) for fat loss 
                  and controlled surpluses (+250 to +350 kcal) for muscle hypertrophy.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">3. Macronutrient Distribution Standards</h3>
                <p>
                  Macronutrient ranges conform to the World Health Organization (WHO) and USDA Dietary Guidelines Acceptable 
                  Macronutrient Distribution Ranges (AMDR): Protein (20–35%), Carbohydrates (45–60%), Dietary Fats (20–35%).
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0E0E0E] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
