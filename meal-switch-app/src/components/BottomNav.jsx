import React from 'react';
import { Home, Search, Calendar, UtensilsCrossed, BarChart3 } from 'lucide-react';

const BottomNav = ({ currentView, onSelectView }) => {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: UtensilsCrossed },
    { id: 'dashboard', label: 'Health OS', icon: BarChart3 },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0A0A0A]/92 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)]"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onSelectView(id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[50px] rounded-xl transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-[#FF7300]'
                  : 'text-[#8E8B85] hover:text-white'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#FF7300]/15' : 'bg-transparent'
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF7300] shadow-[0_0_8px_#FF7300]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight font-sans transition-colors mt-0.5 ${
                  isActive ? 'font-bold text-[#FF7300]' : 'font-medium text-[#8E8B85]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
