import React from 'react';
import { ArrowUpRight, ArrowRight, Cpu, Layers, Activity, Database } from 'lucide-react';

const LandingFeatures = ({ onSelectView }) => {
  const pipelineSteps = [
    {
      step: "01",
      icon: Layers,
      title: "Input & Vision Extraction",
      desc: "Multimodal food vision parses dish composition, portion weights, and macro breakdown in milliseconds."
    },
    {
      step: "02",
      icon: Activity,
      title: "Clinical Metric Calibration",
      desc: "Mifflin-St Jeor formulas calculate your exact basal metabolic rate (BMR) and total daily energy expenditure (TDEE)."
    },
    {
      step: "03",
      icon: Cpu,
      title: "Algorithmic Macro Swaps",
      desc: "Cosine similarity algorithms recommend nutrient-dense alternatives that satisfy cravings while preserving your target deficit."
    }
  ];

  const technicalSpecifications = [
    {
      label: "Energy Expenditure Formula",
      title: "Mifflin-St Jeor Clinical Standard",
      desc: "Computes daily caloric baselines using age, biological sex, height, and body mass with physical activity coefficients."
    },
    {
      label: "Multimodal Analysis",
      title: "Computer Vision & Text Dissection",
      desc: "Extracts carbohydrates, dietary fats, bioavailable protein, and glycemic risks from text or photographed dishes."
    },
    {
      label: "Nutritional Substitution",
      title: "TF-IDF Culinary Similarity",
      desc: "Matches flavor profiles and culinary textures to substitute calorie-dense items without flavor sacrifice."
    },
    {
      label: "Relational Persistence",
      title: "PostgreSQL Cloud Architecture",
      desc: "Stores full JSON meal schedules and biometric history linked to authenticated JWT user sessions."
    }
  ];

  return (
    <div className="w-full bg-[#0A0A0A] text-[#F5F5F5] font-sans">
      {/* 1. Methodology & Pipeline Section */}
      <section id="how-it-works" className="py-24 bg-[#080808] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:w-2/3">
            <span className="text-xs uppercase tracking-widest text-[#A19D98] font-semibold block mb-2">
              System Architecture
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Algorithmic precision. <br />
              <span className="italic text-[#A19D98]">Zero guesswork.</span>
            </h2>
            <p className="text-base text-[#A19D98] font-sans font-light max-w-xl leading-relaxed">
              MealSwitch translates nutritional science into deterministic, real-time calculations so your daily caloric targets remain exact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pipelineSteps.map((step, i) => (
              <div 
                key={i} 
                className="bg-[#121212] border border-white/8 rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#A19D98]">{step.step}</span>
                    <step.icon className="w-4 h-4 text-[#FF7300]" />
                  </div>
                  <h3 className="text-lg font-serif text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-[#A19D98] font-sans font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Platform Capabilities Section */}
      <section className="py-24 bg-[#0A0A0A] border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <span className="text-xs uppercase tracking-widest text-[#A19D98] font-semibold block mb-2">
              Core Capabilities
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              Engineered for consistency.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicalSpecifications.map((spec, i) => (
              <div
                key={i}
                className="bg-[#121212] border border-white/8 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A19D98] block mb-2">
                    {spec.label}
                  </span>
                  <h4 className="text-base font-serif text-white mb-2">{spec.title}</h4>
                  <p className="text-xs text-[#A19D98] font-sans font-light leading-relaxed">
                    {spec.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-start">
            <button
              onClick={() => onSelectView?.('scanner')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-sans text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer border border-white/10"
            >
              <span>Explore Workspace Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Final Call-to-Action Section */}
      <section className="py-20 bg-[#070707] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-5xl font-serif text-white mb-4 tracking-tight">
            Ready to calibrate your daily nutrition?
          </h3>
          <p className="text-sm md:text-base text-[#A19D98] font-sans font-light mb-8 max-w-lg mx-auto leading-relaxed">
            Test the vision scanner, compute your Mifflin-St Jeor TDEE energy targets, or build an adaptive 7-day meal plan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onSelectView?.('scanner')}
              className="px-6 py-3.5 rounded-xl bg-[#FF7300] text-black font-sans font-bold text-xs hover:bg-[#FF8822] transition-colors cursor-pointer w-full sm:w-auto"
            >
              Launch Nutrition Scanner
            </button>
            <button
              onClick={() => onSelectView?.('planner')}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-sans font-bold text-xs border border-white/10 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Build 7-Day Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingFeatures;
