import React, { useState } from 'react';
import { ChefHat, CheckCircle, Loader2, UtensilsCrossed } from 'lucide-react';
import { createRecipeAPI } from '../../services/api';

const RecipeStudioView = () => {
  const [ingredients, setIngredients] = useState('');
  const [diet, setDiet] = useState('veg');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  const diets = [
    { id: 'veg', label: 'Vegetarian' },
    { id: 'non-veg', label: 'Non-Veg' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'keto', label: 'Keto' },
    { id: 'high-protein', label: 'High Protein' }
  ];

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await createRecipeAPI(ingredients.trim(), diet);
      setRecipe(res.recipe);
    } catch (err) {
      setError(err.message || 'Failed to craft recipe with AI');
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopyRecipe = () => {
    if (!recipe) return;
    let textToCopy = '';
    if (typeof recipe === 'object' && recipe !== null) {
      textToCopy = `${recipe.recipe_name || 'Recipe'}\n\n${recipe.description || ''}\n\nIngredients:\n${(recipe.ingredients || []).map(i => `- ${i}`).join('\n')}\n\nInstructions:\n${(recipe.instructions || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;
    } else {
      textToCopy = String(recipe);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isStructuredRecipe = typeof recipe === 'object' && recipe !== null;

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full font-sans text-[#F5F5F5]">
      {/* Header */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#A19D98] mb-4">
          Algorithmic Recipe Formulation
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal font-serif text-white tracking-tight mb-3">
          Pantry Recipe Studio
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-[#A19D98] font-light leading-relaxed">
          Input your available kitchen ingredients to generate a balanced culinary preparation calibrated to your dietary requirements.
        </p>
      </div>

      {/* Studio Input Card */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#F5F5F5]">Available Pantry Ingredients</label>
          <textarea
            rows={3}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. 2 eggs, spinach, bell peppers, olive oil, garlic, tomatoes..."
            className="w-full p-3.5 bg-[#171717] border border-white/10 rounded-xl text-white text-xs outline-none focus:border-[#FF7300] transition-colors resize-none"
          />
        </div>

        {/* Dietary Preferences Pill Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#A19D98] font-medium mr-1">Dietary Target:</span>
          {diets.map((d) => (
            <button
              key={d.id}
              onClick={() => setDiet(d.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                diet === d.id
                  ? 'bg-[#FF7300] text-black font-bold'
                  : 'bg-white/5 border border-white/10 text-[#A19D98] hover:text-white hover:bg-white/10'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !ingredients.trim()}
          className="w-full py-3 bg-[#FF7300] text-black rounded-xl text-xs font-bold hover:bg-[#FF8822] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChefHat className="w-3.5 h-3.5" />}
          <span>Generate Recipe</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs">
          {error}
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading && !recipe && (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-7 animate-pulse flex flex-col gap-4">
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          <div className="h-6 w-3/4 bg-white/5 rounded"></div>
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="h-3 w-full bg-white/5 rounded"></div>
            <div className="h-3 w-5/6 bg-white/5 rounded"></div>
            <div className="h-3 w-4/6 bg-white/5 rounded"></div>
          </div>
        </div>
      )}

      {/* Recipe Result Card */}
      {recipe && (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-7 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 rounded-lg w-fit">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recipe Formulated</span>
            </div>

            <button
              onClick={handleCopyRecipe}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#A19D98] hover:text-white transition-colors cursor-pointer"
            >
              <span>{copied ? '✓ Copied' : 'Copy Recipe'}</span>
            </button>
          </div>

          {isStructuredRecipe ? (
            <div className="flex flex-col gap-6">
              {/* Recipe Name & Description */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-tight">
                  {recipe.recipe_name || 'Chef Formulated Recipe'}
                </h2>
                {recipe.description && (
                  <p className="text-xs sm:text-sm text-[#A19D98] font-light leading-relaxed mt-1.5">
                    {recipe.description}
                  </p>
                )}
              </div>

              {/* Ingredients Section */}
              {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                <div className="bg-[#171717] border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Required Ingredients</span>
                    <span className="text-[11px] text-[#A19D98]">{recipe.ingredients.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recipe.ingredients.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#F5F5F5]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions Section */}
              {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Preparation Steps</span>
                  <div className="flex flex-col gap-2.5">
                    {recipe.instructions.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#171717] border border-white/10 rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 text-[#FF7300] font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[#F5F5F5]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-xs md:text-sm text-[#F5F5F5] leading-relaxed font-sans pt-2">
              {String(recipe)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeStudioView;
