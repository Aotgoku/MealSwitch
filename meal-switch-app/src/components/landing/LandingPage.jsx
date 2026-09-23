import React from 'react';
import Hero from './Hero';
import LandingFeatures from './LandingFeatures';
import LandingFooter from './LandingFooter';

const LandingPage = ({
  onSelectView,
  onLaunchApp,
  user,
  onOpenAuth
}) => {
  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col selection:bg-[#FF7300]/30 selection:text-white">
      {/* 1. Fullscreen Hero Section with Canvas Typography & Interactive Swap */}
      <Hero
        onSelectView={onSelectView}
        onLaunchApp={onLaunchApp}
        user={user}
        onOpenAuth={onOpenAuth}
      />

      {/* 2. How It Works & Product Showcase */}
      <LandingFeatures
        onSelectView={onSelectView}
      />

      {/* 3. Sleek Canvas-style Footer */}
      <LandingFooter
        onSelectView={onSelectView}
      />
    </div>
  );
};

export default LandingPage;
