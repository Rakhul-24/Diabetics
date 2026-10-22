import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Key,
  Utensils,
  Bot,
  Send,
  ShieldAlert,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { DiabetesAiEngine } from '../services/aiService';
import { PreMealRecommendationCard } from '../components/common/PreMealRecommendationCard';

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
    icon: '🌾',
    giScore: 'GI 73 (High Glycemic Index)',
    whyAvoid: 'Low in bran/germ; digested fast, causing immediate postprandial glucose surge.',
    safeAlternative: 'Brown Basmati Rice, Foxtail Millet (Kangni), or Cauliflower Rice mix'
  },
  {
    id: 'df_potatoes',
    name: 'Fried Potatoes, French Fries & Aloo Chips',
    category: 'moderate',
    categoryLabel: 'Moderate Spike Risk',
    categoryBadgeColor: '#F59E0B',
    categoryBgColor: 'rgba(245, 158, 11, 0.08)',
    categoryBorderColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🥔',
    giScore: 'GI 82 (Boiled/Fried)',
    whyAvoid: 'Rapid amylopectin breakdown spikes glucose faster than table sugar in large amounts.',
    safeAlternative: 'Boiled Sweet Potato (Shakarkandi) with skin and lemon, or Roasted Paneer Cubes'
  },
  {
    id: 'df_poha_large',
    name: 'Plain White Poha (Flattened Rice without Veggies)',
    category: 'moderate',
    categoryLabel: 'Moderate Spike Risk',
    categoryBadgeColor: '#F59E0B',
    categoryBgColor: 'rgba(245, 158, 11, 0.08)',
    categoryBorderColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🥣',
    giScore: 'GI 70',
    whyAvoid: 'High glycemic load when eaten without adequate roasted peanuts, sprouts, or veggies.',
    safeAlternative: 'Vegetable Oats Upma, Sprouted Moong Poha, or Broken Wheat (Dalia) Khichdi'
  },

  // ── Caution Foods: Portion Control Required ────────────────────────────────
  {
    id: 'df_mango',
    name: 'Ripe Mangoes, Chiku & Grapes (High Fructose)',
    category: 'caution',
    categoryLabel: 'Portion Caution',
    categoryBadgeColor: '#EAB308',
    categoryBgColor: 'rgba(234, 179, 8, 0.08)',
    categoryBorderColor: 'rgba(234, 179, 8, 0.25)',
    icon: '🥭',
    giScore: 'GI 55–65 (High Sugar per portion)',
    whyAvoid: 'High fructose load causes rapid hepatic glucose output if eaten in large bowls.',
    safeAlternative: 'Limit to 2-3 thin slices right after a high-protein meal; or choose Guava / Papaya'
  },
  {
    id: 'df_instant_noodles',
    name: 'Instant Noodles & Processed Pasta',
    category: 'caution',
    categoryLabel: 'Portion Caution',
    categoryBadgeColor: '#EAB308',
    categoryBgColor: 'rgba(234, 179, 8, 0.08)',
    categoryBorderColor: 'rgba(234, 179, 8, 0.25)',
    icon: '🍜',
    giScore: 'GI 65 + Very High Sodium',
    whyAvoid: 'Refined wheat with palm oil preservatives increases vascular stiffness & spikes glucose.',
    safeAlternative: 'Millet Noodles (Barnyard/Ragi) loaded with stir-fried capsicum, cabbage, and tofu'
  },
  {
    id: 'df_packaged_sauces',
    name: 'Commercial Tomato Ketchup & Sweet Chutneys',
    category: 'caution',
    categoryLabel: 'Portion Caution',
    categoryBadgeColor: '#EAB308',
    categoryBgColor: 'rgba(234, 179, 8, 0.08)',
    categoryBorderColor: 'rgba(234, 179, 8, 0.25)',
    icon: '🥫',
    giScore: 'Hidden Sugars (Up to 30% Corn Syrup)',
    whyAvoid: 'Contains hidden high-fructose corn syrup disguised in small condiment servings.',
    safeAlternative: 'Fresh Mint-Coriander Chutney, Tomato-Garlic Salsa, or Hung Curd Dip'
  }
];

export const FoodView = () => {
  const {
    dailyFoodPlan,
    isAnalyzingFoodPlan,
    foodPlanSource,
    generateDailyFoodPlan,
    stepsData,
    latestGlucose,
    avgGlucoseMg,
    formatGlucose,
    getGlucoseUnit,
    getGlucoseStatus,
    user,
    setUser,
    glucoseReadings,
    medications,
    waterData,
    estimatedA1c
  } = useHealth();

  // Primary Navigation Section: 'dont-foods' | 'ask-ai'
  const [activeSection, setActiveSection] = useState('dont-foods');

  // Don't foods filter & search state
  const [dontCategoryFilter, setDontCategoryFilter] = useState('all');
  const [dontSearchQuery, setDontSearchQuery] = useState('');

  // Modals & form state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState(user?.geminiApiKey || localStorage.getItem('gemini_api_key') || '');
  const [showAiInsightBanner, setShowAiInsightBanner] = useState(false);

  // ── Ask with AI State ──────────────────────────────────────────────────
  const [askAiQuery, setAskAiQuery] = useState('');
  const [askAiLoading, setAskAiLoading] = useState(false);
  const [askAiHistory, setAskAiHistory] = useState([
    {
      id: 'welcome',
      question: 'How does food fit my sugar levels today?',
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
  const calTarget = dailyFoodPlan?.targetNutrition?.dailyCalorieTarget || 1750;
  const carbLimit = dailyFoodPlan?.targetNutrition?.dailyCarbTarget || 160;
  const proteinTarget = dailyFoodPlan?.targetNutrition?.dailyProteinTarget || 75;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── 1. CLEAN NUTRITION GUIDELINES HERO BANNER ────────────────────────── */}
      <div
        className="app-card"
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Top Strip: Clinical Targets & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Utensils size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
                Diet & Nutrition
              </h2>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Daily Calorie Budget: <strong style={{ color: 'var(--primary)' }}>{calTarget} kcal</strong> • Glycemic Targets Tailored to {user?.diabetesType || 'Type 2 Diabetes'}
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
              onClick={() => setShowApiKeyModal(true)}
              className="icon-btn"
              style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)' }}
              title="Gemini API Key"
            >
              <Key size={13} />
            </button>
          </div>
        </div>

        {/* 4 Clean Clinical Nutrition Target Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>CALORIES</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--primary)', marginTop: 1 }}>
              {calTarget} <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>kcal</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>CARB LIMIT</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--warning)', marginTop: 1 }}>
              &lt; {carbLimit} <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>g/day</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROTEIN</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--accent-purple)', marginTop: 1 }}>
              ~{proteinTarget} <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>g/day</span>
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>CURRENT GLUCOSE</div>
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
                'Pair carbohydrate intake with soluble fiber (methi, ragi, karela) and aim for walking before or after meals to blunt glucose spikes.'}
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button
                onClick={() => generateDailyFoodPlan({ force: true })}
                disabled={isAnalyzingFoodPlan}
                className="btn btn-primary"
                style={{ padding: '5px 10px', fontSize: '0.7rem', fontWeight: 700 }}
              >
                <RefreshCw size={11} className={isAnalyzingFoodPlan ? 'spin' : ''} />
                <span>{isAnalyzingFoodPlan ? 'Analyzing...' : 'Re-generate Strategy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 1b. 1-HOUR PRE-MEAL FOOD RECOMMENDATION ALGORITHM ────────────────── */}
      <PreMealRecommendationCard />

      {/* ── 2. SECTION TABS (FOODS TO AVOID / ASK AI CHEF) ───────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
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
          onClick={() => setActiveSection('dont-foods')}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
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
          <ShieldAlert size={15} />
          <span>🚫 Foods to Avoid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('ask-ai')}
          style={{
            padding: '9px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
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
          <span>🤖 Ask AI Chef</span>
        </button>
      </div>

      {/* ── SECTION 1: FOODS TO AVOID BY RISK CATEGORY ────────────────────────── */}
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
                  Clinical guidance on glycemic spike foods and safe Indian substitutes
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
              placeholder="Search foods to avoid (e.g. rice, samosa, juice, naan)..."
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
          <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(prompt)}
                disabled={askAiLoading}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat History Messages */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 400,
              overflowY: 'auto',
              paddingRight: 2
            }}
          >
            {askAiHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Q: {item.question}
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

      {/* ── 3. QUICK GEMINI API KEY MODAL ────────────────────────────────────── */}
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
    </div>
  );
};
