import React from 'react';
import MacroCard from './MacroCard'; // Importing our new reusable card!
import { Flame, Utensils, Wheat, Droplets } from 'lucide-react';

const Demo = ({ demoRef }) => {
  return (
    <section id="demo" ref={demoRef} className="demo-section">
      <h2 className="section-title">See It In Action</h2>
      <p className="section-subtitle">From a simple description to a detailed breakdown in seconds.</p>
      <div className="macros-grid">
        <MacroCard icon={Flame} title="Calories" value="542" colorClass="color-red" description="Energy for your day" />
        <MacroCard icon={Utensils} title="Protein" value="32g" colorClass="color-blue" description="For muscle repair" />
        <MacroCard icon={Wheat} title="Carbs" value="45g" colorClass="color-green" description="For sustained energy" />
        <MacroCard icon={Droplets} title="Fats" value="18g" colorClass="color-purple" description="For brain health" />
      </div>
    </section>
  );
};

export default Demo;