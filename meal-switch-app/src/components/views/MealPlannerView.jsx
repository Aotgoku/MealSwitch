import React, { useState, useEffect } from 'react';
import { Zap, ShoppingCart, BookmarkCheck, Sun, Moon, Utensils, Flame, Check, Loader2, ArrowRight, Calendar } from 'lucide-react';
import { generateMealPlanAPI, optimizeMealPlanAPI, generateShoppingListAPI, saveMealPlanAPI, updateUserProfileAPI } from '../../services/api';

const MealPlannerView = ({
  initialDetails,
  initialGoal,
  token,
  user,
  onRequireAuth,
  onPlanSaved,
  onShowToast
}) => {
  const [goal, setGoal] = useState(initialGoal || 'muscle_gain');
  const [details, setDetails] = useState({
    age: initialDetails?.age || '25',
    weight: initialDetails?.weight || '70',
    height: initialDetails?.height || '175',
    gender: initialDetails?.gender || 'male',
    activityLevel: initialDetails?.activityLevel || 'moderate',
    dietaryPreference: initialDetails?.dietaryPreference || 'veg',
    cuisine: 'Indian'
  });

  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [saved, setSaved] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [shoppingList, setShoppingList] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialDetails) {
      setDetails(prev => ({
        ...prev,
        age: initialDetails.age || prev.age,
        weight: initialDetails.weight || prev.weight,
        height: initialDetails.height || prev.height,
        gender: initialDetails.gender || prev.gender,
        activityLevel: initialDetails.activityLevel || prev.activityLevel,
        dietaryPreference: initialDetails.dietaryPreference || prev.dietaryPreference
      }));
    }
    if (initialGoal) setGoal(initialGoal);
  }, [initialDetails, initialGoal]);

  const handleGenerate = async () => {
    const age = parseInt(details.age, 10);
    const weight = parseFloat(details.weight);
    const height = parseFloat(details.height);

    if (isNaN(age) || isNaN(weight) || isNaN(height)) {
      const msg = "Please enter valid numeric age, weight, and height.";
      if (onShowToast) onShowToast(msg);
      setError(msg);
      return;
    }

    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const data = await generateMealPlanAPI({
        goal: goal,
        age: age,
        weight_kg: weight,
        height_cm: height,
        gender: details.gender,
        activity_level: details.activityLevel,
        dietary_preference: details.dietaryPreference,
        cuisine: details.cuisine
      });

      setPlanData(data.plan_data);
      setUserStats(data.user_stats);

      if (token) {
        updateUserProfileAPI({
          age: age,
          weight_kg: weight,
          height_cm: height,
          gender: details.gender,
          activity_level: details.activityLevel,
          dietary_preference: details.dietaryPreference,
          primary_goal: goal
        }, token).catch(console.error);
      }
    } catch (err) {
      setError(err.message || 'Error generating plan with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!planData) return;
    setOptimizing(true);
    try {
      const res = await optimizeMealPlanAPI(planData);
      if (res.status === 'ok') {
        setPlanData(res.optimized_plan);
        if (onShowToast) onShowToast("Metabolic schedule optimized with ingredient smart swaps.");
      }
    } catch (err) {
      const msg = err.message || "Failed to optimize schedule";
      if (onShowToast) onShowToast(msg);
      else setError(msg);
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!planData) return;
    try {
      const res = await generateShoppingListAPI(JSON.stringify(planData));
      if (res.shopping_list) {
        setShoppingList(res.shopping_list);
      }
    } catch (err) {
      const msg = "Failed to compute grocery list: " + err.message;
      if (onShowToast) onShowToast(msg);
      else setError(msg);
    }
  };

  const handleSaveToProfile = async () => {
    if (!planData) return;
    const payload = {
      title: planData.title || `Plan - ${new Date().toLocaleDateString()}`,
      plan_data: planData,
      target_calories: userStats?.target_calories || planData.totalCalories || 2000,
      actual_calories: planData.totalCalories || userStats?.target_calories || 2000,
      is_optimized: false
    };

    if (!token || !user) {
      if (onRequireAuth) onRequireAuth(payload);
      return;
    }

    setSavingPlan(true);
    try {
      await saveMealPlanAPI(payload, token);
      setSaved(true);
      if (onPlanSaved) onPlanSaved();
    } catch (err) {
      const msg = err.message || "Failed to save plan";
      if (onShowToast) onShowToast(msg);
      else setError(msg);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full font-sans text-[#F5F5F5]">
      {/* Header */}
      <div className="text-center pt-6 pb-2">
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#A19D98] mb-4">
          Clinical Energy Expenditure Calibration
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal font-serif text-white tracking-tight mb-3">
          Adaptive Meal Planner
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-base text-[#A19D98] font-light leading-relaxed">
          Calibrated to your exact Mifflin-St Jeor TDEE energy targets with intelligent culinary optimization.
        </p>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Biometric Parameter Form */}
        <div className="lg:col-span-4 bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-7 flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-normal font-serif text-white mb-1">Target & Biometrics</h3>
            <p className="text-xs text-[#A19D98]">Adjust parameters to recalibrate your daily caloric curve.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#F5F5F5]">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
            >
              <option value="weight_loss">Weight Loss (Fat Shred)</option>
              <option value="muscle_gain">Muscle Hypertrophy</option>
              <option value="healthy_lifestyle">Metabolic Longevity</option>
              <option value="energy_boost">Endurance & Vitality</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Age</label>
              <input
                type="number"
                value={details.age}
                onChange={(e) => setDetails({ ...details, age: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={details.weight}
                onChange={(e) => setDetails({ ...details, weight: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Height (cm)</label>
              <input
                type="number"
                value={details.height}
                onChange={(e) => setDetails({ ...details, height: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Gender</label>
              <select
                value={details.gender}
                onChange={(e) => setDetails({ ...details, gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Diet</label>
              <select
                value={details.dietaryPreference}
                onChange={(e) => setDetails({ ...details, dietaryPreference: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Veg</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#F5F5F5]">Activity Level</label>
            <select
              value={details.activityLevel}
              onChange={(e) => setDetails({ ...details, activityLevel: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
            >
              <option value="sedentary">Sedentary (Desk job, minimal exercise)</option>
              <option value="moderate">Moderate (Workout 3-4x / week)</option>
              <option value="active">Very Active (Daily training / athlete)</option>
            </select>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#FF7300] text-black rounded-xl text-xs font-bold hover:bg-[#FF8822] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            <span>Calculate & Generate Schedule</span>
          </button>
        </div>

        {/* Right Side: Generated Plan Canvas */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {error && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-xl p-4 text-xs">
              {error}
            </div>
          )}

          {/* Skeleton Loaders during calculation */}
          {loading && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 w-32 bg-white/10 rounded mb-3"></div>
                <div className="h-8 w-44 bg-white/5 rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl p-5 animate-pulse flex flex-col gap-3">
                    <div className="h-4 w-20 bg-white/10 rounded"></div>
                    <div className="h-6 w-full bg-white/5 rounded"></div>
                    <div className="h-14 w-full bg-white/5 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && planData ? (
            <div className="flex flex-col gap-6">
              {/* Macro & Action Banner */}
              <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#FF7300] uppercase tracking-wider">Metabolic Caloric Baseline</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-4xl font-normal font-serif text-white">
                      {planData.totalCalories || userStats?.target_calories || 2000}
                    </span>
                    <span className="text-xs text-[#A19D98]">kcal / day</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#FF7300]" />}
                    <span>Smart Swaps</span>
                  </button>

                  <button
                    onClick={handleGenerateShoppingList}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#FF7300]" />
                    <span>Grocery List</span>
                  </button>

                  <button
                    onClick={handleSaveToProfile}
                    disabled={savingPlan || saved}
                    className="px-4 py-2 bg-[#FF7300] text-black rounded-lg text-xs font-bold hover:bg-[#FF8822] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {saved ? <Check className="w-3.5 h-3.5 text-black" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                    <span>{saved ? 'Saved' : 'Save to Cloud DB'}</span>
                  </button>
                </div>
              </div>

              {/* 3-Meal Cards: Breakfast, Lunch, Dinner */}
              {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                const meal = planData.plan?.[mealKey];
                if (!meal) return null;
                const icons = { breakfast: Sun, lunch: Utensils, dinner: Moon };
                const Icon = icons[mealKey] || Utensils;

                return (
                  <div
                    key={mealKey}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#FF7300]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-white">
                          {mealKey}
                        </span>
                      </div>
                      <span className="text-xs font-serif text-[#FF7300] text-base">
                        {meal.calories ? `${meal.calories} kcal` : ''}
                      </span>
                    </div>

                    <h4 className="text-xl font-normal font-serif text-white">{meal.name}</h4>
                    <p className="text-xs text-[#A19D98] font-light leading-relaxed">{meal.description}</p>

                    {/* Swap Suggestion if optimized */}
                    {meal.suggestion && (
                      <div className="mt-2 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                        <Flame className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold block mb-0.5 text-emerald-200">Alternative Substitution:</span>
                          {meal.suggestion}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Grocery Shopping List Drawer if generated */}
              {shoppingList && (
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 mt-2">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#FF7300]" />
                      <h3 className="text-lg font-normal font-serif text-white">Calculated Grocery List</h3>
                    </div>
                    <span className="text-[11px] text-[#A19D98] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                      Ingredients Categorized
                    </span>
                  </div>

                  {Array.isArray(shoppingList) && shoppingList.length > 0 && typeof shoppingList[0] === 'object' && shoppingList[0].category ? (
                    <div className="space-y-4">
                      {shoppingList.map((cat, catIdx) => (
                        <div key={catIdx} className="bg-[#171717] border border-white/10 rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-[#FF7300] uppercase tracking-wider mb-2.5">
                            {cat.category}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(cat.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/10 text-xs text-[#F5F5F5]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300] shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : Array.isArray(shoppingList) ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#A19D98]">
                      {shoppingList.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 p-2 bg-white/5 rounded-lg border border-white/10 text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7300] shrink-0" />
                          <span>{typeof item === 'string' ? item : (item.name || JSON.stringify(item))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#A19D98]">{JSON.stringify(shoppingList)}</p>
                  )}
                </div>
              )}
            </div>
          ) : !loading ? (
            <div className="bg-[#121212] border border-dashed border-white/10 rounded-2xl p-14 text-center text-[#A19D98] flex flex-col items-center justify-center gap-2">
              <Utensils className="w-8 h-8 opacity-20 text-[#FF7300]" />
              <p className="text-xs font-light">Set your biological parameters on the left and select "Calculate & Generate Schedule".</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MealPlannerView;
