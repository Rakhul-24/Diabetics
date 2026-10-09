import React, { useState, useMemo } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Check,
  TrendingUp,
  Key,
  RotateCcw,
  Trash2,
  Utensils,
  Bot,
  Send,
  ShieldAlert,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { DiabetesAiEngine } from '../services/aiService';

// Comprehensive Don't Foods Database with Clinical Risk Categories & Healthy Indian Swaps
const DONT_FOODS_DATA = [
  // ── High Risk: Severe Glycemic Spike (GI > 70 & Ultra Refined) ───────────
  {
    id: 'df_maida',
    name: 'Maida Items (Naan, Bhatura, Parotta, Biscuits)',
    category: 'severe',
    categoryLabel: 'Severe Spike Risk',
    categoryBadgeColor: '#EF4444',
    categoryBgColor: 'rgba(239, 68, 68, 0.08)',
    categoryBorderColor: 'rgba(239, 68, 68, 0.25)',
    icon: '🥐',
    giScore: 'GI 78–88 (Very High)',
    whyAvoid: 'Stripped of fiber; rapidly converts into pure blood glucose driving spikes >200 mg/dL.',
    safeAlternative: 'Methi Multigrain Roti (Wheat + 30% Besan) or Almond flour roti'
  },
  {
    id: 'df_beverages',
    name: 'Sugary Drinks, Packaged Juices & Sweetened Chai',
    category: 'severe',
    categoryLabel: 'Severe Spike Risk',
    categoryBadgeColor: '#EF4444',
    categoryBgColor: 'rgba(239, 68, 68, 0.08)',
    categoryBorderColor: 'rgba(239, 68, 68, 0.25)',
    icon: '🧃',
    giScore: 'GI 80+ (Liquid Glycemic Load)',
    whyAvoid: 'Liquid sugars lack digestive buffer, causing an acute sugar spike in 15 minutes.',
    safeAlternative: 'Spiced Buttermilk (Chaas) with Jeera & Curry Leaves, or Sugar-Free Masala Chai'
  },
  {
    id: 'df_mithai',
    name: 'Traditional Indian Sweets (Gulab Jamun, Jalebi, Laddoo)',
    category: 'severe',
    categoryLabel: 'Severe Spike Risk',
    categoryBadgeColor: '#EF4444',
    categoryBgColor: 'rgba(239, 68, 68, 0.08)',
    categoryBorderColor: 'rgba(239, 68, 68, 0.25)',
    icon: '🍯',
    giScore: 'GI 75–92 (High Sugar + Trans Fat)',
    whyAvoid: 'Concentrated sucrose and deep-fried fats trigger acute glucose toxicity & insulin resistance.',
    safeAlternative: 'Roasted Makhana (Fox Nuts) Kheer with Stevia & Cardamom, or 85% Dark Chocolate'
  },
  {
    id: 'df_sabudana',
    name: 'Sabudana (Tapioca Pearls) in Large Portions',
    category: 'severe',
    categoryLabel: 'Severe Spike Risk',
    categoryBadgeColor: '#EF4444',
    categoryBgColor: 'rgba(239, 68, 68, 0.08)',
    categoryBorderColor: 'rgba(239, 68, 68, 0.25)',
    icon: '🍚',
    giScore: 'GI 85 (Pure Starch)',
    whyAvoid: '90%+ pure carbohydrates with almost zero fiber or protein; elevates sugar rapidly.',
    safeAlternative: 'Sprouted Moong Dal Cheela or Quinoa Vegetable Khichdi'
  },

  // ── Moderate Risk: Glycemic Volatility & Delayed Spikes ────────────────────
  {
    id: 'df_fried',
    name: 'Deep-Fried Snacks (Samosas, Pakoras, Namkeen, Bhujia)',
    category: 'moderate',
    categoryLabel: 'Moderate Spike Risk',
    categoryBadgeColor: '#F59E0B',
    categoryBgColor: 'rgba(245, 158, 11, 0.08)',
    categoryBorderColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🥟',
    giScore: 'GI 65–72 + High Lipids',
    whyAvoid: 'Trans-fats delay digestion causing a stubborn, prolonged glucose spike 3–5 hours later.',
    safeAlternative: 'Air-Fried Vegetable Cutlets or Dry-Roasted Kala Chana with Lemon & Chaat Masala'
  },
  {
    id: 'df_whiterice',
    name: 'Polished White Rice (Large Portions)',
    category: 'moderate',
    categoryLabel: 'Moderate Spike Risk',
    categoryBadgeColor: '#F59E0B',
    categoryBgColor: 'rgba(245, 158, 11, 0.08)',
    categoryBorderColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🍚',
    giScore: 'GI 73 (Fast Amylopectin)',
    whyAvoid: 'Milling removes outer bran; turns quickly into glucose without fiber to slow absorption.',
    safeAlternative: 'Brown Rice, Hand-Pounded Rice, Ragi Mudde, or Foxtail Millet (Kangni)'
  },
  {
    id: 'df_sweetfruits',
    name: 'Excess High-Fructose Fruits (Mango, Chiku, Custard Apple)',
    category: 'moderate',
    categoryLabel: 'Moderate Spike Risk',
    categoryBadgeColor: '#F59E0B',
    categoryBgColor: 'rgba(245, 158, 11, 0.08)',
    categoryBorderColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🥭',
    giScore: 'GI 58–68 (High Fructose)',
    whyAvoid: 'High simple fruit sugars easily overload liver glycogen when eaten without portion control.',
    safeAlternative: 'Indian Guava (Amrood), Jamun (Black Plum), Papaya, or Green Apple'
  },

  // ── Low-to-Moderate Caution: Hidden Sugars & Saturated Lipids ────────────
  {
    id: 'df_sweetdairy',
    name: 'Sweet Lassi & Commercial Flavored Yogurt',
    category: 'caution',
    categoryLabel: 'Caution / Limit',
    categoryBadgeColor: '#3B82F6',
    categoryBgColor: 'rgba(59, 130, 246, 0.08)',
    categoryBorderColor: 'rgba(59, 130, 246, 0.25)',
    icon: '🥛',
    giScore: 'GI 55 + Added Sugar',
    whyAvoid: 'Commercial flavored cups contain up to 18g of hidden added sucrose per serving.',
    safeAlternative: 'Fresh Homemade Low-Fat Dahi (Curd) with Roasted Cumin, or Fresh Paneer'
  },
  {
    id: 'df_ketchup',
    name: 'Commercial Ketchup & Sweet Chutneys',
    category: 'caution',
    categoryLabel: 'Caution / Limit',
    categoryBadgeColor: '#3B82F6',
    categoryBgColor: 'rgba(59, 130, 246, 0.08)',
    categoryBorderColor: 'rgba(59, 130, 246, 0.25)',
    icon: '🍅',
    giScore: 'GI 55+ (High-Fructose Corn Syrup)',
    whyAvoid: '1 tablespoon has ~4g of hidden concentrated sugars with zero dietary fiber.',
    safeAlternative: 'Fresh Mint-Coriander Green Chutney with Lemon & Green Chillies'
  },
  {
    id: 'df_dalda',
    name: 'Vanaspati / Dalda & Reheated Cooking Oils',
    category: 'caution',
    categoryLabel: 'Caution / Limit',
    categoryBadgeColor: '#3B82F6',
    categoryBgColor: 'rgba(59, 130, 246, 0.08)',
    categoryBorderColor: 'rgba(59, 130, 246, 0.25)',
    icon: '🧈',
    giScore: 'Lipotoxic Trans-Fats',
    whyAvoid: 'Trans fatty acids degrade insulin receptor function and promote chronic vascular inflammation.',
    safeAlternative: 'Cold-Pressed Mustard Oil, Sesame Oil, or 1 tsp Pure A2 Desi Cow Ghee'
  }
];

export const FoodView = () => {
  const {
    mealPlan,
    setMealPlan,
    toggleMealEaten,
    removeMeal,
    resetAllDailyDataForToday,
    dailyFoodPlan,
    isAnalyzingFoodPlan,
    foodPlanSource,
    generateDailyFoodPlan,
    applyRecommendedMealPlan,
    stepsData,
    latestGlucose,
    avgGlucoseMg,
    estimatedA1c,
    formatGlucose,
    getGlucoseUnit,
    getGlucoseStatus,
    user,
    setUser,
    glucoseReadings,
    medications,
    waterData
  } = useHealth();

  // Primary Navigation Section: 'meals' | 'ask-ai' | 'dont-foods'
  const [activeSection, setActiveSection] = useState('meals');

  // Sub-filter for meals view: 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  const [mealCategoryFilter, setMealCategoryFilter] = useState('all');

  // Don't foods filter & search state
  const [dontCategoryFilter, setDontCategoryFilter] = useState('all');
  const [dontSearchQuery, setDontSearchQuery] = useState('');

  // Expandable recipe drawer
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMealCategory, setAddMealCategory] = useState('breakfast');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(user?.geminiApiKey || localStorage.getItem('gemini_api_key') || '');
  const [planAppliedSuccess, setPlanAppliedSuccess] = useState(false);
  const [showAiInsightBanner, setShowAiInsightBanner] = useState(false);

  // New custom item form inputs
  const [newName, setNewName] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const [newGi, setNewGi] = useState('35');
  const [newPortion, setNewPortion] = useState('');

  // ── Ask with AI State ──────────────────────────────────────────────────
  const [askAiQuery, setAskAiQuery] = useState('');
  const [askAiLoading, setAskAiLoading] = useState(false);
  const [askAiHistory, setAskAiHistory] = useState([
    {
      id: 'welcome',
      question: 'How do meals fit my sugar levels today?',
      answer: `👋 **Hello ${user?.name || 'there'}!** I'm your dedicated AI Food & Clinical Nutritionist.\n\n` +
        `• **Current Blood Sugar**: **${formatGlucose(latestGlucose?.readingMg || 114)} ${getGlucoseUnit()}** (Average: **${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()}**).\n` +
        `• **Step Count**: **${(stepsData?.current || 0).toLocaleString()}** steps walked today.\n\n` +
        `Ask me anything! For example: *"Can I eat 2 dosas tonight?"*, *"Is Mango safe?"*, or *"Suggest a 250 kcal low-carb dinner"*.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    '🍛 Can I eat 2 dosas tonight?',
    '🥭 Is Mango safe for my current sugar?',
    '🫓 Roti vs Rice for diabetes?',
    '🌙 Low-carb bedtime Indian snack',
    '🍵 Best drink to lower fasting glucose'
  ];

  const handleAskAi = async (overrideQuery = null) => {
    const question = (overrideQuery || askAiQuery).trim();
    if (!question || askAiLoading) return;

    setAskAiLoading(true);
    setAskAiQuery('');

    const engine = new DiabetesAiEngine({
      user,
      latestGlucose,
      glucoseReadings,
      medications,
      waterData,
      stepsData,
      avgGlucoseMg,
      tirPercentage: 75,
      estimatedA1c,
      formatGlucose,
      getGlucoseUnit,
      getGlucoseStatus
    });

    try {
      let reply = null;
      const apiKey = user?.geminiApiKey || localStorage.getItem('gemini_api_key');

      if (apiKey) {
        reply = await engine.fetchLiveGeminiResponse(question, apiKey);
      }

      if (!reply) {
        reply = engine.generateResponse(question);
      }

      setAskAiHistory(prev => [
        {
          id: 'q_' + Date.now(),
          question,
          answer: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } catch (err) {
      setAskAiHistory(prev => [
        {
          id: 'err_' + Date.now(),
          question,
          answer: '⚠️ Could not process that question right now. Please check connection or Gemini API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } finally {
      setAskAiLoading(false);
    }
  };

  // ── Meal Calculations: Separate Breakfast, Lunch, Dinner, Snacks ──────────
  const mealsData = mealPlan?.meals;
  const breakfastItems = useMemo(() => mealsData?.breakfast || [], [mealsData?.breakfast]);
  const lunchItems = useMemo(() => mealsData?.lunch || [], [mealsData?.lunch]);
  const dinnerItems = useMemo(() => mealsData?.dinner || [], [mealsData?.dinner]);
  const snacksItems = useMemo(() => mealsData?.snacks || [], [mealsData?.snacks]);

  const calcMealStats = (items) => {
    const totalCals = items.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);
    const eatenCals = items.filter(m => m.eaten).reduce((acc, m) => acc + (Number(m.calories) || 0), 0);
    const totalCarbs = items.reduce((acc, m) => acc + (Number(m.carbs) || 0), 0);
    const totalProtein = items.reduce((acc, m) => acc + (Number(m.protein) || 0), 0);
    const totalFat = items.reduce((acc, m) => acc + (Number(m.fat) || 5), 0);
    const totalFiber = items.reduce((acc, m) => acc + (Number(m.fiber) || 4), 0);
    const allEaten = items.length > 0 && items.every(m => m.eaten);
    return { totalCals, eatenCals, totalCarbs, totalProtein, totalFat, totalFiber, allEaten };
  };

  const breakfastStats = useMemo(() => calcMealStats(breakfastItems), [breakfastItems]);
  const lunchStats = useMemo(() => calcMealStats(lunchItems), [lunchItems]);
  const dinnerStats = useMemo(() => calcMealStats(dinnerItems), [dinnerItems]);
  const snacksStats = useMemo(() => calcMealStats(snacksItems), [snacksItems]);

  const allMealsList = useMemo(() => [
    ...breakfastItems,
    ...lunchItems,
    ...dinnerItems,
    ...snacksItems
  ], [breakfastItems, lunchItems, dinnerItems, snacksItems]);

  const eatenMeals = useMemo(() => allMealsList.filter(m => m.eaten === true), [allMealsList]);

  const totalCaloriesEaten = eatenMeals.reduce((a, m) => a + (Number(m.calories) || 0), 0);
  const totalCarbsEaten = eatenMeals.reduce((a, m) => a + (Number(m.carbs) || 0), 0);
  const totalProteinEaten = eatenMeals.reduce((a, m) => a + (Number(m.protein) || 0), 0);
  const totalFatEaten = eatenMeals.reduce((a, m) => a + (Number(m.fat) || 0), 0);

  const calTarget = dailyFoodPlan?.targetNutrition?.dailyCalorieTarget || mealPlan?.dailyCalorieTarget || 1750;
  const calPct = Math.min(100, Math.round((totalCaloriesEaten / calTarget) * 100));
  const caloriesRemaining = Math.max(0, calTarget - totalCaloriesEaten);

  const handleApplyAiPlan = () => {
    const success = applyRecommendedMealPlan();
    if (success) {
      setPlanAppliedSuccess(true);
      setTimeout(() => setPlanAppliedSuccess(false), 2500);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const key = customKeyInput.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      setUser(prev => ({ ...prev, geminiApiKey: key }));
    } else {
      localStorage.removeItem('gemini_api_key');
      setUser(prev => ({ ...prev, geminiApiKey: '' }));
    }
    setShowApiKeyModal(false);
    generateDailyFoodPlan({ force: true });
  };

  const openAddModalFor = (cat) => {
    setAddMealCategory(cat);
    setShowAddModal(true);
  };

  const handleAddMeal = (e) => {
    e.preventDefault();
    if (!newName) return;

    const newItem = {
      id: 'f_' + Date.now(),
      name: newName,
      calories: Number(newCalories) || 200,
      carbs: Number(newCarbs) || 25,
      protein: Number(newProtein) || 10,
      fat: 5,
      fiber: 4,
      giIndex: Number(newGi) || 35,
      giRating: Number(newGi) <= 35 ? 'Very Low GI' : Number(newGi) <= 55 ? 'Low GI' : 'Moderate GI',
      portion: newPortion || '1 serving',
      icon: '🥗',
      eaten: true,
      ingredients: ['Custom logged meal'],
      recipe: 'Custom logged meal entry.'
    };

    setMealPlan(prev => ({
      ...prev,
      date: localStorage.getItem('glucocare_last_reset_date') || new Date().toISOString().slice(0, 10),
      meals: {
        ...prev.meals,
        [addMealCategory]: [...(prev.meals[addMealCategory] || []), newItem]
      }
    }));

    setNewName('');
    setNewCalories('');
    setNewCarbs('');
    setNewProtein('');
    setNewPortion('');
    setShowAddModal(false);
  };

  // Filtered Don't Foods
  const filteredDontFoods = useMemo(() => {
    return DONT_FOODS_DATA.filter(item => {
      const matchesCategory = dontCategoryFilter === 'all' || item.category === dontCategoryFilter;
      const matchesQuery = !dontSearchQuery.trim() ||
        item.name.toLowerCase().includes(dontSearchQuery.toLowerCase()) ||
        item.safeAlternative.toLowerCase().includes(dontSearchQuery.toLowerCase()) ||
        item.whyAvoid.toLowerCase().includes(dontSearchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [dontCategoryFilter, dontSearchQuery]);

  const currentReadingMg = latestGlucose?.readingMg || 135;
  const glucoseStatus = getGlucoseStatus(currentReadingMg);

  // ── Render Single Meal Section Card ──────────────────────────────────────
  const renderMealCard = (mealKey, title, emoji, items, stats) => {
    return (
      <div
        key={mealKey}
        className="app-card"
        style={{
          padding: '16px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: stats.allEaten
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Card Header: Meal Name & Distinct Calories */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{emoji}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0 }}>{title}</h3>
                {stats.allEaten && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--primary)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    Done ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                {items.length} {items.length === 1 ? 'item planned' : 'items planned'}
              </div>
            </div>
          </div>

          {/* Prominent Calorie Badge for This Meal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                textAlign: 'right',
                background: 'var(--bg-card-subtle)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.5px' }}>
                MEAL CALORIES
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)' }}>
                {stats.totalCals} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>kcal</span>
                {stats.eatenCals > 0 && (
                  <span style={{ fontSize: '0.72rem', color: '#10B981', marginLeft: 4, fontWeight: 700 }}>
                    ({stats.eatenCals} eaten)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => openAddModalFor(mealKey)}
              className="btn btn-outline"
              style={{
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title={`Add item to ${title}`}
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Meal Macro Distribution Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, fontSize: '0.7rem' }}>
          <span style={{ background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            🍞 <strong>{stats.totalCarbs}g</strong> Carbs
          </span>
          <span style={{ background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            🥩 <strong>{stats.totalProtein}g</strong> Protein
          </span>
          <span style={{ background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            🥑 <strong>{stats.totalFat}g</strong> Fat
          </span>
          <span style={{ background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            🌾 <strong>{stats.totalFiber}g</strong> Fiber
          </span>
        </div>

        {/* Items List */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            No foods logged for {title} yet.{' '}
            <button
              onClick={() => openAddModalFor(mealKey)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              + Add food
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(meal => {
              const isExpanded = expandedRecipeId === meal.id;
              return (
                <div
                  key={meal.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: meal.eaten ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card-subtle)',
                    border: meal.eaten ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-light)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{meal.icon || '🥗'}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{meal.name}</h4>
                          <span
                            style={{
                              background: (meal.giIndex || 35) <= 35 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: (meal.giIndex || 35) <= 35 ? 'var(--primary)' : 'var(--warning)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: 4
                            }}
                          >
                            GI {meal.giIndex || 35}
                          </span>
                        </div>

                        {/* Portion & Calories */}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{meal.portion}</span>
                          <span>•</span>
                          <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{meal.calories} kcal</strong>
                          <span>•</span>
                          <span>{meal.carbs}g Carbs</span>
                        </div>

                        {/* Glycemic Insight if available */}
                        {meal.glycemicReason && (
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: '0.7rem',
                              color: 'var(--primary)',
                              background: 'rgba(16, 185, 129, 0.08)',
                              padding: '3px 8px',
                              borderRadius: 4,
                              borderLeft: '3px solid var(--primary)'
                            }}
                          >
                            💡 {meal.glycemicReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: Mark Eaten & Recipe Drawer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={() => toggleMealEaten(meal.id)}
                        className="btn"
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-full)',
                          background: meal.eaten ? 'var(--primary)' : 'var(--bg-card)',
                          color: meal.eaten ? '#ffffff' : 'var(--text-secondary)',
                          border: meal.eaten ? 'none' : '1px solid var(--border-light)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer'
                        }}
                      >
                        {meal.eaten ? <Check size={12} /> : null}
                        <span>{meal.eaten ? 'Eaten ✓' : 'Log Eaten'}</span>
                      </button>

                      {meal.id?.startsWith('f_') && (
                        <button
                          onClick={() => removeMeal(meal.id)}
                          className="icon-btn"
                          style={{ width: 26, height: 26, color: 'var(--danger)' }}
                          title="Delete custom item"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedRecipeId(isExpanded ? null : meal.id)}
                        className="icon-btn"
                        style={{ width: 26, height: 26 }}
                        title="Diabetic Recipe Details"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Recipe & Ingredients */}
                  {isExpanded && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                          Ingredients:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {meal.ingredients?.map((ing, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.68rem',
                                background: 'var(--bg-card)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border-light)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                          Preparation:
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: 'var(--bg-card)', padding: '7px 9px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', margin: 0 }}>
                          {meal.recipe}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>

      {/* ── 1. TOP DASHBOARD: DAILY CALORIE BUDGET & MACRO HEALTH ─────────────── */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Top Strip: Calorie Progress & Day Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Utensils size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
                Diet & Nutrition
              </h2>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Target: <strong style={{ color: 'var(--text-primary)' }}>{calTarget} kcal</strong> • Current: <strong style={{ color: 'var(--primary)' }}>{totalCaloriesEaten} kcal</strong> • <span style={{ color: caloriesRemaining > 0 ? 'var(--primary)' : 'var(--danger)', fontWeight: 700 }}>{caloriesRemaining} kcal remaining</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowAiInsightBanner(!showAiInsightBanner)}
              className="btn btn-outline"
              style={{
                padding: '5px 9px',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Toggle AI Clinical Glucose Insight"
            >
              <TrendingUp size={12} color="var(--primary)" />
              <span>{showAiInsightBanner ? 'Hide Insight' : 'AI Insight'}</span>
            </button>

            <button
              onClick={resetAllDailyDataForToday}
              className="btn btn-outline"
              style={{
                padding: '5px 9px',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-secondary)'
              }}
              title="Reset today's meals to fresh baseline"
            >
              <RotateCcw size={11} />
              <span>Reset Day</span>
            </button>

            <button
              onClick={() => setShowApiKeyModal(true)}
              className="icon-btn"
              style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)' }}
              title="Gemini API Key"
            >
              <Key size={13} />
            </button>
          </div>
        </div>

        {/* Visual Calorie Bar */}
        <div style={{ width: '100%', height: 7, borderRadius: 4, background: 'var(--border-light)', overflow: 'hidden', marginBottom: 12 }}>
          <div
            style={{
              width: `${calPct}%`,
              height: '100%',
              background: calPct > 100 ? 'var(--danger)' : 'var(--primary)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {/* 4 Clean Macro Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>CARBS</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--warning)', marginTop: 1 }}>
              {totalCarbsEaten}g <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {dailyFoodPlan?.targetNutrition?.dailyCarbTarget || mealPlan.dailyCarbTarget}g</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROTEIN</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)', marginTop: 1 }}>
              {totalProteinEaten}g <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {dailyFoodPlan?.targetNutrition?.dailyProteinTarget || mealPlan.dailyProteinTarget}g</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>FAT</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: 1 }}>
              {totalFatEaten}g <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {dailyFoodPlan?.targetNutrition?.dailyFatTarget || mealPlan.dailyFatTarget}g</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>SUGAR CONTEXT</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: glucoseStatus.color, marginTop: 2 }}>
              {formatGlucose(currentReadingMg)} <span style={{ fontSize: '0.62rem' }}>{getGlucoseUnit()}</span>
            </div>
          </div>
        </div>

        {/* Optional Collapsible AI Clinical Strategy Banner */}
        {showAiInsightBanner && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.08)',
              borderLeft: '4px solid var(--primary)',
              borderTop: '1px solid rgba(16, 185, 129, 0.2)',
              borderRight: '1px solid rgba(16, 185, 129, 0.2)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={13} />
                {dailyFoodPlan?.analysis?.trendLabel || 'Endocrinology Nutrition Insight'}
              </span>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                Powered by {foodPlanSource || 'Gemini 2.5 Flash'}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
              {dailyFoodPlan?.analysis?.keyClinicalInsight ||
                'Pair carbohydrate intake with soluble fiber (methi, ragi, karela) and aim for 15-minute post-meal brisk walks to blunt glucose excursions.'}
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button
                onClick={() => generateDailyFoodPlan({ force: true })}
                disabled={isAnalyzingFoodPlan}
                className="btn btn-primary"
                style={{ padding: '5px 10px', fontSize: '0.7rem', fontWeight: 700 }}
              >
                <RefreshCw size={11} className={isAnalyzingFoodPlan ? 'spin' : ''} />
                <span>{isAnalyzingFoodPlan ? 'Analyzing...' : 'Re-generate Plan'}</span>
              </button>
              {dailyFoodPlan?.meals && (
                <button
                  onClick={handleApplyAiPlan}
                  className="btn btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.7rem', fontWeight: 700 }}
                >
                  {planAppliedSuccess ? 'Applied ✓' : 'Apply AI Plan to Tracker'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. USER-FRIENDLY SECTION TABS (MEALS / ASK AI / FOODS TO AVOID) ────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'var(--bg-card)',
          padding: 4,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSection('meals')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: 'none',
            background: activeSection === 'meals' ? 'var(--primary)' : 'transparent',
            color: activeSection === 'meals' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <span>🍱 Daily Meals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('ask-ai')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: 'none',
            background: activeSection === 'ask-ai' ? '#0284c7' : 'transparent',
            color: activeSection === 'ask-ai' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <Bot size={15} />
          <span>Ask AI Chef</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('dont-foods')}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 800,
            border: 'none',
            background: activeSection === 'dont-foods' ? 'var(--danger)' : 'transparent',
            color: activeSection === 'dont-foods' ? '#ffffff' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={14} />
          <span>Foods to Avoid</span>
        </button>
      </div>

      {/* ── SECTION 1: DAILY MEALS (BREAKFAST, LUNCH, DINNER) ─────────────────── */}
      {activeSection === 'meals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Quick Sub-Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
              {[
                { id: 'all', label: 'All Meals' },
                { id: 'breakfast', label: `Breakfast (${breakfastStats.totalCals} kcal)` },
                { id: 'lunch', label: `Lunch (${lunchStats.totalCals} kcal)` },
                { id: 'dinner', label: `Dinner (${dinnerStats.totalCals} kcal)` },
                { id: 'snacks', label: `Snacks (${snacksStats.totalCals} kcal)` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMealCategoryFilter(tab.id)}
                  style={{
                    padding: '5px 11px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: mealCategoryFilter === tab.id ? 'var(--primary)' : 'var(--bg-card)',
                    color: mealCategoryFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => openAddModalFor('breakfast')}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
            >
              <Plus size={14} />
              <span>Log Meal</span>
            </button>
          </div>

          {/* Render Meals */}
          {(mealCategoryFilter === 'all' || mealCategoryFilter === 'breakfast') &&
            renderMealCard('breakfast', 'Breakfast', '🌅', breakfastItems, breakfastStats)}

          {(mealCategoryFilter === 'all' || mealCategoryFilter === 'lunch') &&
            renderMealCard('lunch', 'Lunch', '☀️', lunchItems, lunchStats)}

          {(mealCategoryFilter === 'all' || mealCategoryFilter === 'dinner') &&
            renderMealCard('dinner', 'Dinner', '🌙', dinnerItems, dinnerStats)}

          {(mealCategoryFilter === 'all' || mealCategoryFilter === 'snacks') &&
            renderMealCard('snacks', 'Healthy Snacks & Bedtime', '🍏', snacksItems, snacksStats)}
        </div>
      )}

      {/* ── SECTION 2: ASK WITH AI IN FOOD VIEW ───────────────────────────────── */}
      {activeSection === 'ask-ai' && (
        <div
          className="app-card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            boxShadow: '0 6px 20px rgba(14, 165, 233, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
                  Ask AI Nutritionist & Food Doctor
                </h3>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Personalized to your latest glucose ({formatGlucose(latestGlucose?.readingMg || 114)} {getGlucoseUnit()})
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(14, 165, 233, 0.12)',
                color: '#0284c7'
              }}
            >
              Live Indian Diet Engine
            </span>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            style={{ display: 'flex', gap: 8 }}
          >
            <input
              type="text"
              className="form-input"
              value={askAiQuery}
              onChange={(e) => setAskAiQuery(e.target.value)}
              placeholder="Ask anything: 'Can I eat Biryani?', 'Is Guava safe?', 'How many rotis?'..."
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card-subtle)'
              }}
            />
            <button
              type="submit"
              disabled={askAiLoading || !askAiQuery.trim()}
              className="btn btn-primary"
              style={{
                padding: '0 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                borderColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {askAiLoading ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
              <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>Ask</span>
            </button>
          </form>

          {/* Quick Tap Suggestion Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(prompt)}
                disabled={askAiLoading}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Conversation History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {askAiHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7' }}>
                    ❓ {item.question}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {item.timestamp}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3: FOODS TO AVOID BY RISK CATEGORY ────────────────────────── */}
      {activeSection === 'dont-foods' && (
        <div
          className="app-card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>
                  Foods to Avoid by Risk Category
                </h3>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  Clinical guidance on dangerous foods and safe Indian substitutes
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--danger)'
              }}
            >
              {filteredDontFoods.length} items cataloged
            </span>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              value={dontSearchQuery}
              onChange={(e) => setDontSearchQuery(e.target.value)}
              placeholder="Search foods (e.g. rice, samosa, juice, naan)..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card-subtle)'
              }}
            />
          </div>

          {/* Filter Pills */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {[
              { id: 'all', label: 'All Foods', count: DONT_FOODS_DATA.length },
              { id: 'severe', label: '🔴 Severe Spike', count: DONT_FOODS_DATA.filter(f => f.category === 'severe').length },
              { id: 'moderate', label: '🟠 Moderate Risk', count: DONT_FOODS_DATA.filter(f => f.category === 'moderate').length },
              { id: 'caution', label: '🟡 Portion Caution', count: DONT_FOODS_DATA.filter(f => f.category === 'caution').length }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setDontCategoryFilter(btn.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: dontCategoryFilter === btn.id ? 'var(--danger)' : 'var(--bg-card-subtle)',
                  color: dontCategoryFilter === btn.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          {/* Don't Foods List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredDontFoods.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No foods found matching "{dontSearchQuery}".
              </div>
            ) : (
              filteredDontFoods.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: item.categoryBgColor,
                    border: `1px solid ${item.categoryBorderColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{item.icon}</span>
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {item.name}
                        </h4>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {item.giScore}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: item.categoryBadgeColor,
                        color: '#ffffff'
                      }}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    ⚠️ <strong>Why to Avoid:</strong> {item.whyAvoid}
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      padding: '7px 9px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-card)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.72rem', lineHeight: 1.35 }}>
                      <strong style={{ color: 'var(--primary)' }}>Safe Swap:</strong>{' '}
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.safeAlternative}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 4. QUICK GEMINI API KEY MODAL ────────────────────────────────────── */}
      {showApiKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Key size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Google Gemini API Key</h3>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Your server provides an active Gemini connection. You can also provide your personal Google AI Studio key (AIzaSy...) for real-time diabetic meal recommendations and conversational Q&A.
            </p>

            <form onSubmit={handleSaveApiKey}>
              <div className="form-group">
                <label className="form-label">Gemini API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  value={customKeyInput}
                  onChange={e => setCustomKeyInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowApiKeyModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Save & Re-analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. ADD CUSTOM MEAL MODAL ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Log Meal to {addMealCategory.charAt(0).toUpperCase() + addMealCategory.slice(1)}
            </h3>

            <form onSubmit={handleAddMeal}>
              <div className="form-group">
                <label className="form-label">Meal Slot</label>
                <select
                  className="form-select"
                  value={addMealCategory}
                  onChange={e => setAddMealCategory(e.target.value)}
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snacks">🍏 Snacks & Bedtime</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dish Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Spinach Dal Khichdi"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="250"
                    value={newCalories}
                    onChange={e => setNewCalories(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="30"
                    value={newCarbs}
                    onChange={e => setNewCarbs(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="12"
                    value={newProtein}
                    onChange={e => setNewProtein(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Glycemic Index (GI)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="35"
                    value={newGi}
                    onChange={e => setNewGi(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Portion Size</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1 bowl (200g)"
                  value={newPortion}
                  onChange={e => setNewPortion(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
