import React, { useState } from 'react';
import { Search, Flame, ShieldAlert, RefreshCw, Layers } from 'lucide-react';
import { callNutritionAPI, getRecommendations } from '../../services/api';

const NutritionView = () => {
  const [query, setQuery] = useState('');
  const [portion, setPortion] = useState('100g');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const popularMeals = [
    "Crispy Samosa",
    "Paneer Butter Masala",
    "Gulab Jamun",
    "Chicken Biryani",
    "Masala Dosa",
    "Pav Bhaji",
    "Oats with Milk"
  ];

  const handleScan = async (searchFood = query, overridePortion = portion) => {
    const foodToSearch = (typeof searchFood === 'string' ? searchFood : query).trim();
    const portionToUse = overridePortion || portion || '100g';
    if (!foodToSearch) return;

    setLoading(true);
    setError(null);

    try {
      const [nutriData, recData] = await Promise.all([
        callNutritionAPI(foodToSearch, portionToUse),
        getRecommendations(foodToSearch).catch(() => ({ results: [] }))
      ]);

      setAnalysis(nutriData);
      setRecommendations(recData);
    } catch (err) {
      setError(err.message || 'Failed to analyze nutrition. Please verify backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full font-sans text-[#F5F5F5]">
      {/* Header Banner */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#A19D98] mb-4">
          Computational Nutrition Model
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal font-serif text-white tracking-tight mb-3">
          Precision Nutrition Scanner
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-[#A19D98] font-light leading-relaxed">
          Inspect calories, hidden fats, and macronutrient balances for any meal, with instant metabolic smart swaps.
        </p>
      </div>

      {/* Search & Input Box */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-7 max-w-3xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A19D98] pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g. Samosa, Grilled Salmon, Paneer Butter Masala..."
              className="w-full pl-11 pr-4 py-3 bg-[#171717] border border-white/10 rounded-xl text-white text-xs outline-none focus:border-[#FF7300] transition-colors"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-[#FF7300] text-black rounded-xl text-xs font-bold hover:bg-[#FF8822] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Analyze Food</span>
          </button>
        </div>

        {/* Portion Selector */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-[#A19D98] font-medium mr-1">Portion Size:</span>
          {['50g', '100g', '150g', '200g', '1 Plate'].map((size) => (
            <button
              key={size}
              onClick={() => setPortion(size)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                portion === size
                  ? 'bg-[#FF7300] text-black font-bold'
                  : 'bg-white/5 border border-white/10 text-[#A19D98] hover:text-white hover:bg-white/10'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Quick Suggestions */}
        <div className="flex items-center gap-2 mt-4 flex-wrap pt-4 border-t border-white/5">
          <span className="text-xs text-[#A19D98]/60">Quick test:</span>
          {popularMeals.slice(0, 5).map((meal) => (
            <button
              key={meal}
              onClick={() => {
                setQuery(meal);
                handleScan(meal);
              }}
              className="text-xs text-[#A19D98] hover:text-[#FF7300] transition-colors cursor-pointer"
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs max-w-3xl mx-auto w-full">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-6 w-40 bg-white/10 rounded-md"></div>
            <div className="h-16 w-full bg-white/5 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-white/5 rounded-xl"></div>
              <div className="h-20 bg-white/5 rounded-xl"></div>
              <div className="h-20 bg-white/5 rounded-xl"></div>
            </div>
          </div>
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded-md"></div>
            <div className="h-20 bg-white/5 rounded-xl"></div>
            <div className="h-20 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      )}

      {/* Results Workspace */}
      {analysis && (() => {
        const resultData = analysis?.result || analysis || {};
        const nutrition = resultData?.nutrition || resultData || {};
        const foodDisplayName = resultData?.food_name || query || 'Scanned Food';
        const portionDisplay = resultData?.portion_size || portion;
        const calories = Math.round(Number(nutrition?.calories ?? resultData?.calories ?? 0));
        const protein = Number(nutrition?.protein_g ?? resultData?.protein_g ?? resultData?.protein ?? 0);
        const carbs = Number(nutrition?.carbs_g ?? resultData?.carbs_g ?? resultData?.carbs ?? 0);
        const fat = Number(nutrition?.fat_g ?? resultData?.fat_g ?? resultData?.fat ?? 0);
        const sugar = nutrition?.sugar_g ?? resultData?.sugar_g;
        const fiber = nutrition?.fiber_g && nutrition?.fiber_g !== 'N/A' ? nutrition.fiber_g : null;
        const healthInfo = resultData?.health_info;
        const expertSuggestion = resultData?.expert_suggestion;

        // Alternatives from recommendation API and expert suggestions
        const rawResults = recommendations?.results || recommendations?.healthy_alternatives || [];
        const swapAlternatives = Array.isArray(rawResults)
          ? rawResults.filter(item => {
              const name = (item.food_name || item.name || '').toLowerCase();
              return name && !name.includes(foodDisplayName.toLowerCase());
            })
          : [];

        const hasSwaps = (expertSuggestion && expertSuggestion.suggestion) || swapAlternatives.length > 0;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-4">
            {/* Card 1: Nutritional Profile */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-semibold text-[#FF7300] uppercase tracking-wider">Analysis Result</span>
                  <h3 className="text-2xl font-normal font-serif text-white mt-0.5">{foodDisplayName}</h3>
                </div>
                <span className="text-xs text-[#A19D98] bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                  Portion: {portionDisplay}
                </span>
              </div>

              {/* Calorie Highlight */}
              <div className="bg-[#171717] border border-white/10 rounded-xl p-4 flex items-baseline gap-3">
                <span className="text-4xl font-normal font-serif text-[#FF7300]">
                  {calories}
                </span>
                <span className="text-xs text-[#A19D98]">Total Calories (kcal)</span>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#171717] border border-white/10 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-[#A19D98] uppercase tracking-wider block">Protein</span>
                  <p className="text-xl font-serif text-white mt-1">{protein}<span className="text-xs text-[#A19D98] ml-0.5 font-sans">g</span></p>
                </div>
                <div className="bg-[#171717] border border-white/10 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-[#A19D98] uppercase tracking-wider block">Carbs</span>
                  <p className="text-xl font-serif text-white mt-1">{carbs}<span className="text-xs text-[#A19D98] ml-0.5 font-sans">g</span></p>
                </div>
                <div className="bg-[#171717] border border-white/10 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-[#A19D98] uppercase tracking-wider block">Fats</span>
                  <p className="text-xl font-serif text-white mt-1">{fat}<span className="text-xs text-[#A19D98] ml-0.5 font-sans">g</span></p>
                </div>
              </div>

              {/* Micronutrients if available */}
              {(sugar !== null || fiber !== null) && (
                <div className="grid grid-cols-2 gap-2 text-xs text-[#A19D98] pt-1">
                  {sugar !== null && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex justify-between">
                      <span>Sugar:</span>
                      <span className="text-white font-medium">{sugar}g</span>
                    </div>
                  )}
                  {fiber !== null && (
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex justify-between">
                      <span>Dietary Fiber:</span>
                      <span className="text-white font-medium">{fiber}g</span>
                    </div>
                  )}
                </div>
              )}

              {/* Health Info / Advisory */}
              {healthInfo?.category && (
                <div className="bg-[#171717] border border-white/10 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#A19D98] leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-[#FF7300] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Classification & Risk Assessment:</span>
                    <span>Category: <strong className="text-white">{healthInfo.category}</strong>. {healthInfo.risky_for && healthInfo.risky_for !== 'None' ? `Advisory for: ${healthInfo.risky_for}.` : 'No adverse clinical risks identified.'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: AI Smart Swaps */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
              <div className="pb-3 border-b border-white/10">
                <span className="text-[11px] font-semibold text-[#FF7300] uppercase tracking-wider">Nutritional Substitution</span>
                <h3 className="text-2xl font-normal font-serif text-white mt-0.5">Metabolic Smart Swaps</h3>
              </div>

              {hasSwaps ? (
                <div className="flex flex-col gap-3">
                  {/* Algorithmic Expert Match if available */}
                  {expertSuggestion && expertSuggestion.suggestion && (
                    <div className="bg-[#171717] border border-[#FF7300]/40 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF7300] font-bold">Top Clinically Matched Swap</span>
                          <h4 className="text-lg font-serif text-white">{expertSuggestion.suggestion}</h4>
                        </div>
                        {expertSuggestion.calories_saved > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                            <Flame className="w-3 h-3 text-emerald-400" />
                            Save {Math.round(expertSuggestion.calories_saved)} kcal
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setQuery(expertSuggestion.suggestion);
                          handleScan(expertSuggestion.suggestion);
                        }}
                        className="text-xs text-[#FF7300] hover:underline self-start font-medium cursor-pointer pt-1"
                      >
                        Analyze {expertSuggestion.suggestion} →
                      </button>
                    </div>
                  )}

                  {/* Alternative foods from database */}
                  {swapAlternatives.slice(0, 4).map((alt, idx) => {
                    const altName = alt.food_name || alt.name || 'Alternative';
                    const altCalories = alt.calories || alt.calorie_count || 0;
                    const calsSaved = alt.calories_saved || (calories > altCalories ? calories - altCalories : 0);
                    return (
                      <div
                        key={idx}
                        className="bg-[#171717] border border-white/10 rounded-xl p-3.5 hover:border-white/20 transition-colors flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-white font-serif">{altName}</span>
                          {calsSaved > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">
                              <Flame className="w-3 h-3 text-emerald-400" />
                              Save ~{Math.round(calsSaved)} kcal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#A19D98]">
                          <div className="flex items-center gap-2">
                            <span>~{Math.round(altCalories)} kcal</span>
                            {alt.protein_g && <span>• {alt.protein_g}g protein</span>}
                            {alt.category && <span>• {alt.category}</span>}
                          </div>
                          <button
                            onClick={() => {
                              setQuery(altName);
                              handleScan(altName);
                            }}
                            className="text-[#FF7300] hover:text-[#FF8822] transition-colors cursor-pointer text-[11px] font-medium"
                          >
                            Inspect →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-[#A19D98] text-xs">
                  <Layers className="w-6 h-6 opacity-30 mx-auto mb-2 text-[#FF7300]" />
                  <p>Nutritional profile is optimal. No direct calorie-reduction substitutions needed.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default NutritionView;
