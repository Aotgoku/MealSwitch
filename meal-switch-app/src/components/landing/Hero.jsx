import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Search, ChevronRight, ArrowRight, Calendar, ChefHat, BarChart3, RefreshCw } from 'lucide-react';
import logoImg from '../../assets/logo.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const demoData = {
  initial: {
    name: "Double Bacon Cheeseburger",
    calories: 1240,
    protein: 55,
    carbs: 65,
    fat: 82,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000&auto=format&fit=crop",
    badge: "Input Meal Target"
  },
  swapped: {
    name: "Grilled Portobello Turkey Burger",
    calories: 450,
    protein: 42,
    carbs: 35,
    fat: 16,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=2000&auto=format&fit=crop",
    badge: "Optimized Swap (-790 kcal)"
  }
};

const Hero = ({ onSelectView, onLaunchApp, user, onOpenAuth }) => {
  const [isSwapped, setIsSwapped] = useState(false);
  const currentData = isSwapped ? demoData.swapped : demoData.initial;

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#FF7300]/30 selection:text-white flex flex-col justify-between">
      {/* 1. Fixed Top Navigation Bar */}
      <nav className="fixed w-full z-50 top-0 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectView?.('landing')}
          >
            <img src={logoImg} alt="MealSwitch" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-serif text-white tracking-tight">
              MealSwitch
            </span>
          </div>

          {/* Real MealSwitch Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <button
              onClick={scrollToHowItWorks}
              className="text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => onSelectView?.('scanner')}
              className="text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              Nutrition Scanner
            </button>
            <button
              onClick={() => onSelectView?.('planner')}
              className="text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              Meal Planner
            </button>
            <button
              onClick={() => onSelectView?.('recipes')}
              className="text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              Recipe Studio
            </button>
            <button
              onClick={() => onSelectView?.('dashboard')}
              className="text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              Health OS
            </button>
          </div>

          {/* Actions: Sign In & Launch App */}
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => onSelectView?.('dashboard')}
                className="hidden sm:block text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
              >
                Hi, {user.full_name?.replace(/\s*\([^)]*\)/g, '').trim() || user.email.split('@')[0]}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:block text-xs font-sans font-medium text-[#A19D98] hover:text-white transition-colors cursor-pointer"
              >
                Log In
              </button>
            )}
            <button
              onClick={onLaunchApp}
              className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-sans font-bold hover:bg-[#FF7300] hover:text-black transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Launch Platform</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative min-h-screen pt-36 pb-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-14 items-center w-full relative z-10">
          {/* Left Column: Editorial Storytelling */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6 max-w-2xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[#A19D98] text-[11px] font-sans font-semibold tracking-wider uppercase mb-6"
            >
              Computational Metabolic Intelligence
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-serif text-white leading-[1.0] mb-6 tracking-tight"
            >
              Eat what you love. <br />
              <span className="italic text-[#FF7300]">Intelligently.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-[#A19D98] font-sans mb-8 leading-relaxed max-w-lg font-light"
            >
              Analyze dishes via computer vision, calculate clinical BMR and TDEE energy expenditure, and generate optimized meal schedules calibrated to your exact biometrics.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3.5">
              <button
                onClick={() => onSelectView?.('scanner')}
                className="px-6 py-3.5 rounded-xl bg-[#FF7300] text-black font-sans font-bold text-sm hover:bg-[#FF8822] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan a Meal</span>
              </button>
              <button
                onClick={() => onSelectView?.('planner')}
                className="px-6 py-3.5 rounded-xl bg-white/5 text-white font-sans font-bold text-sm hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#A19D98]" />
                <span>Build Meal Plan</span>
              </button>
            </motion.div>

            {/* Quick Feature Access Strip */}
            <motion.div variants={fadeInUp} className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[11px] text-[#A19D98] font-sans uppercase tracking-wider mb-3">Explore workspace modules</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'scanner',   label: 'Nutrition Scanner',  icon: Search    },
                  { id: 'planner',   label: 'Meal Planner',       icon: Calendar  },
                  { id: 'recipes',   label: 'Recipe Studio',      icon: ChefHat   },
                  { id: 'dashboard', label: 'Health Dashboard',   icon: BarChart3 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onSelectView?.(id)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A19D98] hover:text-white hover:bg-white/10 hover:border-white/25 transition-colors text-xs font-sans font-medium cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                    <ArrowRight className="w-3 h-3 opacity-40" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 relative w-full max-w-md mx-auto"
          >
            <div className="relative p-2 rounded-2xl bg-[#141414] border border-white/10 shadow-2xl">
              <div className="relative h-[520px] rounded-xl overflow-hidden bg-neutral-900">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={isSwapped ? 'swapped' : 'initial'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={currentData.image}
                    alt={currentData.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Neutral Legibility Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-5 left-5">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider border ${
                      isSwapped
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-black/60 text-[#F5F5F5] border-white/15'
                    }`}
                  >
                    {currentData.badge}
                  </span>
                </div>

                {/* Bottom Information Panel */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isSwapped ? 'info-swapped' : 'info-initial'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-end mb-5">
                        <div className="flex-1 pr-4">
                          <h3 className="text-2xl md:text-3xl font-serif text-white leading-tight mb-1">
                            {currentData.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="block text-3xl font-serif text-[#FF7300] leading-none mb-0.5">
                            {currentData.calories}
                          </span>
                          <span className="text-[10px] text-[#A19D98] font-sans uppercase tracking-widest font-bold">
                            kcal
                          </span>
                        </div>
                      </div>

                      {/* 3-Column Macro Grid */}
                      <div className="grid grid-cols-3 gap-2.5 mb-5">
                        {[
                          { label: 'Protein', value: currentData.protein },
                          { label: 'Carbs', value: currentData.carbs },
                          { label: 'Fat', value: currentData.fat },
                        ].map((macro, i) => (
                          <div
                            key={i}
                            className="bg-[#171717] border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center"
                          >
                            <span className="text-lg font-serif text-white">
                              {macro.value}
                              <span className="text-xs text-[#A19D98] ml-0.5 font-sans">g</span>
                            </span>
                            <span className="text-[10px] text-[#A19D98] font-sans uppercase tracking-wider mt-0.5">
                              {macro.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Swap Action Button */}
                  <button
                    onClick={() => setIsSwapped(!isSwapped)}
                    className={`w-full py-3.5 rounded-xl font-sans font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isSwapped
                        ? 'bg-white/10 text-white hover:bg-white/15 border border-white/15'
                        : 'bg-[#FF7300] text-black hover:bg-[#FF8822]'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isSwapped ? "View Original Dish" : "Compute Smarter Alternative"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
