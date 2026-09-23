import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Flame, Calendar, Trash2, CheckCircle, AlertCircle, 
  Loader2, BookmarkCheck, User, Scale, Heart, LogIn, 
  ArrowRight, BarChart3, ChevronDown, ChevronUp, Utensils, Target, Plus
} from 'lucide-react';
import { getUserProfileAPI, updateUserProfileAPI, getUserMealPlansAPI, deleteMealPlanAPI, demoLoginAPI } from '../../services/api';

const DashboardView = ({ user, token, onOpenAuth, onAuthSuccess, onProfileUpdated, onSelectView }) => {
  const [profile, setProfile] = useState({
    age: '',
    weight_kg: '',
    height_cm: '',
    gender: 'male',
    activity_level: 'moderate',
    dietary_preference: 'veg',
    primary_goal: 'muscle_gain',
    bmi: null,
    tdee: null
  });

  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  const isGuest = !user || !token;
  const onProfileUpdatedRef = useRef(onProfileUpdated);

  useEffect(() => {
    onProfileUpdatedRef.current = onProfileUpdated;
  }, [onProfileUpdated]);

  // Load profile and saved plans from PostgreSQL whenever token is valid
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.allSettled([
      getUserProfileAPI(token),
      getUserMealPlansAPI(token)
    ]).then(([profileRes, plansRes]) => {
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const data = profileRes.value;
        setProfile({
          age: data.age || '',
          weight_kg: data.weight_kg || '',
          height_cm: data.height_cm || '',
          gender: data.gender || 'male',
          activity_level: data.activity_level || 'moderate',
          dietary_preference: data.dietary_preference || 'veg',
          primary_goal: data.primary_goal || 'muscle_gain',
          bmi: data.bmi,
          tdee: data.tdee
        });
        if (onProfileUpdatedRef.current) {
          onProfileUpdatedRef.current(data);
        }
      }

      if (plansRes.status === 'fulfilled' && plansRes.value) {
        setSavedPlans(plansRes.value || []);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [token]);

  const handleDemoUnlock = async () => {
    setDemoLoading(true);
    setStatusMsg(null);
    try {
      const data = await demoLoginAPI();
      if (onAuthSuccess) {
        onAuthSuccess(data.access_token, data.user);
      }
    } catch (err) {
      alert("Failed to unlock demo account: " + err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (isGuest) {
      handleDemoUnlock();
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const updated = await updateUserProfileAPI({
        age: parseInt(profile.age, 10) || null,
        weight_kg: parseFloat(profile.weight_kg) || null,
        height_cm: parseFloat(profile.height_cm) || null,
        gender: profile.gender,
        activity_level: profile.activity_level,
        dietary_preference: profile.dietary_preference,
        primary_goal: profile.primary_goal
      }, token);

      setProfile(prev => ({
        ...prev,
        bmi: updated.bmi,
        tdee: updated.tdee
      }));

      if (onProfileUpdatedRef.current) {
        onProfileUpdatedRef.current(updated);
      }
      setStatusMsg({ type: 'success', text: 'Biometric profile synced to PostgreSQL database.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (isGuest) {
      handleDemoUnlock();
      return;
    }
    if (!window.confirm("Are you sure you want to remove this saved meal plan?")) return;
    try {
      await deleteMealPlanAPI(planId, token);
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
      if (expandedPlanId === planId) setExpandedPlanId(null);
    } catch (err) {
      alert("Failed to delete plan: " + err.message);
    }
  };

  const toggleExpand = (planId) => {
    setExpandedPlanId(prev => prev === planId ? null : planId);
  };

  // Clean formatted name without awkward "(Demo Account)" text
  const cleanDisplayName = user?.full_name 
    ? user.full_name.replace(/\s*\([^)]*\)/g, '').trim() 
    : (user?.email?.split('@')[0] || 'Member');

  const isDemoAccount = user?.email === 'demo@mealswitch.io' || user?.role === 'demo';

  // ─────────────────────────────────────────────────
  // GUEST STATE: Clean lock-screen, no fake data
  // ─────────────────────────────────────────────────
  if (isGuest) {
    const featureCards = [
      {
        icon: Activity,
        title: 'BMI & TDEE Calculator',
        desc: 'Mifflin-St Jeor precision metabolic targets calibrated to your exact biometrics.'
      },
      {
        icon: BookmarkCheck,
        title: 'Cloud Saved Plans',
        desc: 'All your AI-generated schedules stored in PostgreSQL, accessible anytime.'
      },
      {
        icon: User,
        title: 'Biometric Profile',
        desc: 'Sync age, weight, and fitness targets so every plan is mathematically customized.'
      },
      {
        icon: Heart,
        title: 'Goal Calibration',
        desc: 'Caloric curves adjust for muscle hypertrophy, fat loss, or longevity.'
      },
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center gap-10 max-w-3xl mx-auto w-full font-sans text-[#F5F5F5] py-16"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-[#FF7300]/10 border border-[#FF7300]/20 flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-[#FF7300]" />
        </div>

        {/* Heading */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-normal font-serif text-white leading-tight mb-4">
            Your personal <br />
            <span className="italic text-[#FF7300]">Health OS</span>
          </h1>
          <p className="text-base md:text-lg text-[#A19D98] leading-relaxed font-light">
            Calculate your metabolic targets, review saved cloud meal plans, and sync your biometric profile.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={handleDemoUnlock}
            disabled={demoLoading}
            className="px-6 py-3.5 bg-[#FF7300] text-black rounded-xl font-bold text-xs hover:bg-[#FF8822] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            <span>Try Demo Account</span>
          </button>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
          {featureCards.map((item, i) => (
            <div
              key={i}
              className="bg-[#121212] border border-white/8 rounded-2xl p-5 flex items-start gap-4 text-left hover:border-[#FF7300]/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF7300]/10 border border-[#FF7300]/20 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="w-5 h-5 text-[#FF7300]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-[#A19D98] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────
  // AUTHENTICATED STATE: Real dashboard with user data
  // ─────────────────────────────────────────────────
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 max-w-6xl mx-auto w-full font-sans text-[#F5F5F5]"
    >
      {/* User Greeting Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4 pt-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF7300] text-black flex items-center justify-center text-2xl font-serif font-bold shadow-[0_0_20px_rgba(255,115,0,0.3)]">
            {cleanDisplayName ? cleanDisplayName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-white">
                {cleanDisplayName}
              </h1>
              {isDemoAccount && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FF7300]/15 text-[#FF7300] border border-[#FF7300]/30">
                  Demo Sandbox
                </span>
              )}
            </div>
            <p className="text-xs text-[#A19D98] mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="text-xs font-medium px-3.5 py-1.5 rounded-full border text-emerald-400 bg-emerald-500/15 border-emerald-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Cloud Synchronized</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-[#A19D98]">
            <span>BMI</span>
            <Activity className="w-4 h-4 text-[#FF7300]" />
          </div>
          <span className="text-3xl font-normal font-serif text-white">
            {profile.bmi ? (typeof profile.bmi === 'number' ? profile.bmi.toFixed(1) : profile.bmi) : '--'}
          </span>
          <span className="text-[11px] text-[#A19D98]">
            {profile.bmi ? (Number(profile.bmi) < 25 ? 'Normal Range' : 'Elevated') : 'Set height & weight'}
          </span>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-[#A19D98]">
            <span>Daily TDEE</span>
            <Flame className="w-4 h-4 text-[#FF7300]" />
          </div>
          <span className="text-3xl font-normal font-serif text-white">
            {profile.tdee ? Math.round(Number(profile.tdee)) : '--'}
          </span>
          <span className="text-[11px] text-[#A19D98]">kcal / day</span>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-[#A19D98]">
            <span>Weight</span>
            <Scale className="w-4 h-4 text-[#FF7300]" />
          </div>
          <span className="text-3xl font-normal font-serif text-white">
            {profile.weight_kg ? `${profile.weight_kg}` : '--'}
          </span>
          <span className="text-[11px] text-[#A19D98]">kg</span>
        </div>

        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-[#A19D98]">
            <span>Saved Plans</span>
            <Calendar className="w-4 h-4 text-[#FF7300]" />
          </div>
          <span className="text-3xl font-normal font-serif text-white">
            {loading ? '...' : savedPlans.length}
          </span>
          <span className="text-[11px] text-[#A19D98]">in database</span>
        </div>
      </div>

      {/* Main Grid: Profile Form + Saved Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Profile Configuration */}
        <form
          onSubmit={handleUpdateProfile}
          className="lg:col-span-5 bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col gap-4 shadow-2xl"
        >
          <div>
            <h3 className="text-xl font-normal font-serif text-white mb-1">Biometric Profile</h3>
            <p className="text-xs text-[#A19D98]">Keep your metrics updated for accurate AI meal generation.</p>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs ${statusMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Age</label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="25"
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={profile.weight_kg || ''}
                onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                placeholder="70"
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Height (cm)</label>
              <input
                type="number"
                value={profile.height_cm || ''}
                onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                placeholder="175"
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Gender</label>
              <select
                value={profile.gender || 'male'}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#F5F5F5]">Diet</label>
              <select
                value={profile.dietary_preference || 'veg'}
                onChange={(e) => setProfile({ ...profile, dietary_preference: e.target.value })}
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
              value={profile.activity_level || 'moderate'}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
            >
              <option value="sedentary">Sedentary (Little to no exercise)</option>
              <option value="moderate">Moderate (Exercise 3-4 days/week)</option>
              <option value="active">Active (Heavy training daily)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#F5F5F5]">Primary Health Goal</label>
            <select
              value={profile.primary_goal || 'muscle_gain'}
              onChange={(e) => setProfile({ ...profile, primary_goal: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#FF7300]"
            >
              <option value="muscle_gain">Muscle Hypertrophy</option>
              <option value="weight_loss">Weight Loss & Fat Shred</option>
              <option value="healthy_lifestyle">Metabolic Longevity</option>
              <option value="energy_boost">Endurance & Vitality</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 py-3.5 bg-[#FF7300] text-black rounded-2xl text-xs font-bold hover:bg-[#FF8822] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,115,0,0.3)] active:scale-98"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        </form>

        {/* Right Gallery: Saved Meal Plans */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-normal font-serif text-white">Saved Meal Plans</h3>
              <span className="text-xs text-[#A19D98]">
                ({savedPlans.length})
              </span>
            </div>

            {onSelectView && (
              <button
                type="button"
                onClick={() => onSelectView('planner')}
                className="text-xs font-semibold text-[#FF7300] hover:text-[#FF8822] flex items-center gap-1 transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-[#FF7300]/10 border border-[#FF7300]/25"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Plan</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3.5">
              {[1, 2].map((i) => (
                <div key={i} className="bg-[#121212] border border-white/10 rounded-2xl p-5 animate-pulse flex items-center justify-between">
                  <div className="flex flex-col gap-2.5">
                    <div className="h-4 w-48 bg-white/10 rounded"></div>
                    <div className="h-3 w-28 bg-white/5 rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-white/5 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : savedPlans.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {savedPlans.map((plan) => {
                const isExpanded = expandedPlanId === plan.id;
                const planDetails = plan.plan_data?.plan || plan.plan_data?.meals || null;

                return (
                  <div
                    key={plan.id}
                    className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-white/20 transition-all"
                  >
                    <div 
                      onClick={() => toggleExpand(plan.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-normal text-white font-serif">{plan.title}</span>
                        <div className="flex items-center gap-3 text-xs text-[#A19D98]">
                          <span className="text-[#FF7300] font-serif text-sm">{plan.actual_calories || plan.target_calories} kcal</span>
                          <span>•</span>
                          <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                          {plan.is_optimized && (
                            <span className="text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/25">
                              AI Optimised
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleExpand(plan.id)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A19D98] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse Details" : "View Meals"}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A19D98] hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Meal Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-white/10 bg-[#0E0E0E] px-5 py-4 flex flex-col gap-3"
                        >
                          {planDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {Object.entries(planDetails).map(([mealKey, mealVal]) => {
                                const mealObj = typeof mealVal === 'object' ? mealVal : { name: String(mealVal) };
                                return (
                                  <div key={mealKey} className="bg-[#171717] border border-white/5 rounded-xl p-3 flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-[#FF7300] uppercase tracking-wider">
                                      {mealKey}
                                    </span>
                                    <span className="text-xs font-medium text-white line-clamp-2">
                                      {mealObj.name || mealObj.food_name || 'Nutrient Meal'}
                                    </span>
                                    {mealObj.calories && (
                                      <span className="text-[11px] text-[#A19D98]">
                                        {mealObj.calories} kcal
                                      </span>
                                    )}
                                    {mealObj.description && (
                                      <p className="text-[10px] text-[#7A7671] mt-1 line-clamp-2">
                                        {mealObj.description}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-[#A19D98] italic">
                              Target: {plan.target_calories} kcal | Actual: {plan.actual_calories} kcal
                            </p>
                          )}

                          {onSelectView && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => onSelectView('planner')}
                                className="text-xs text-[#FF7300] hover:text-[#FF8822] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                              >
                                <span>Open Planner</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#121212] border border-dashed border-white/10 rounded-2xl p-12 text-center text-[#A19D98] text-xs font-light">
              No plans saved yet. Generate a schedule in the Meal Planner and click "Save to DB".
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardView;
