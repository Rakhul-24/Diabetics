import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Clock,
  Flame,
  Footprints,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Droplets,
  Lock,
  Unlock,
  Calendar
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import {
  getMealWindowDetails,
  getUpcomingMealWindow
} from '../../services/preMealRecommendationAlgorithm';

export const PreMealRecommendationCard = ({ compact = false, onNavigateToFood }) => {
  const {
    user,
    latestGlucose,
    stepsData,
    preMealPlan,
    isGeneratingPreMealPlan,
    generatePreMealPlan
  } = useHealth();

  const [selectedMeal, setSelectedMeal] = useState(() => {
    const windowInfo = getUpcomingMealWindow(user?.mealTimes);
    return windowInfo.currentSelection?.type || 'breakfast';
  });
  const [expandedItem, setExpandedItem] = useState(null);
  const [showSimulations, setShowSimulations] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Live clock interval to update window status in real time
  // Automatically refreshes the component when rolling past 11:59 PM into midnight
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const mealTimes = user?.mealTimes || { breakfast: '08:00', lunch: '13:00', dinner: '20:00' };

  // Calculate window details for currently selected meal
  const currentWindow = getMealWindowDetails(selectedMeal, mealTimes, currentTime);
  const isRecommendedToday = currentWindow.isRecommendedToday;
  const isRecommendingFood = isRecommendedToday || previewMode;

  const handleMealSwitch = (mealType) => {
    setSelectedMeal(mealType);
    setPreviewMode(false);
    generatePreMealPlan({ mealType });
  };

  const handleSimulate = (simSteps, simGlucose) => {
    setPreviewMode(true);
    generatePreMealPlan({
      mealType: selectedMeal,
      forceSteps: simSteps,
      forceGlucose: simGlucose
    });
  };

  const plan = preMealPlan;
  const analysis = plan?.clinicalAnalysis;
  const metrics = plan?.metrics || {};

  const badgeBg = analysis?.alertLevel === 'danger'
    ? 'rgba(239, 68, 68, 0.12)'
    : analysis?.alertLevel === 'warning'
    ? 'rgba(245, 158, 11, 0.12)'
    : 'rgba(16, 185, 129, 0.12)';

  const badgeBorder = analysis?.alertLevel === 'danger'
    ? 'rgba(239, 68, 68, 0.35)'
    : analysis?.alertLevel === 'warning'
    ? 'rgba(245, 158, 11, 0.35)'
    : 'rgba(16, 185, 129, 0.35)';

  const badgeColor = analysis?.alertLevel === 'danger'
    ? 'var(--danger)'
    : analysis?.alertLevel === 'warning'
    ? 'var(--warning)'
    : 'var(--primary)';

  // Schedule status for each meal tab
  const tabWindows = {
    breakfast: getMealWindowDetails('breakfast', mealTimes, currentTime),
    lunch: getMealWindowDetails('lunch', mealTimes, currentTime),
    dinner: getMealWindowDetails('dinner', mealTimes, currentTime)
  };

  return (
    <div
      className="app-card"
      style={{
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid var(--border-light)',
        background: 'var(--bg-card)'
      }}
    >
      {/* ── TOP BANNER & TIMING HEADER ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: isRecommendedToday
                ? 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(59,130,246,0.25) 100%)'
                : 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(99,102,241,0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UtensilsCrossed size={19} color={isRecommendedToday ? 'var(--primary)' : '#f59e0b'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
                1-Hour Pre-Meal Food Advisor
              </h3>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: isRecommendedToday ? 'var(--primary-gradient)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}
              >
                {isRecommendedToday ? <Unlock size={10} /> : <Lock size={10} />}
                <span>{isRecommendedToday ? 'Active Till 11:59 PM' : 'Scheduled (1 Hr Prior)'}</span>
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Clock size={11} color="var(--primary)" />
              <span>
                Recommended <strong>1 hr before eating time</strong> &bull; Active throughout the day till <strong>11:59 PM</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => generatePreMealPlan({ mealType: selectedMeal })}
          disabled={isGeneratingPreMealPlan}
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <RefreshCw size={12} className={isGeneratingPreMealPlan ? 'spin' : ''} />
          <span>{isGeneratingPreMealPlan ? 'Analyzing...' : 'Recalculate'}</span>
        </button>
      </div>

      {/* ── MEAL SELECTION TABS ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          background: 'var(--bg-card-subtle)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: 14
        }}
      >
        {[
          { type: 'breakfast', label: 'Breakfast', info: tabWindows.breakfast },
          { type: 'lunch', label: 'Lunch', info: tabWindows.lunch },
          { type: 'dinner', label: 'Dinner', info: tabWindows.dinner }
        ].map(m => {
          const active = selectedMeal === m.type;
          const isUnlocked = m.info.isRecommendedToday;
          return (
            <button
              key={m.type}
              type="button"
              onClick={() => handleMealSwitch(m.type)}
              style={{
                border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontWeight: active ? 800 : 600,
                fontSize: '0.75rem',
                padding: '7px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{m.label}</span>
                {isUnlocked && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: active ? '#fff' : '#10b981',
                      display: 'inline-block'
                    }}
                    title="Recommended and active throughout the day till 11:59 PM"
                  />
                )}
              </div>
              <span style={{ fontSize: '0.62rem', opacity: active ? 0.95 : 0.75 }}>
                {m.info.eatingTime12h} {isUnlocked ? '• Active' : `• ${m.info.recommendationTime12h}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── CASE 1: BEFORE 1-HOUR TRIGGER -> SHOW "RECOMMEND MESSAGE" ────── */}
      {!isRecommendingFood && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Main Informative Recommend Message Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(59, 130, 246, 0.07) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}
                >
                  <Clock size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                    Food Recommendations Scheduled
                  </div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>
                    Unlocks exactly 1 hour prior to eating time
                  </div>
                </div>
              </div>

              {/* Countdown Pill */}
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(245, 158, 11, 0.14)',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Clock size={11} />
                <span>
                  Opens at {currentWindow.recommendationTime12h} (in {currentWindow.countdownFormatted})
                </span>
              </span>
            </div>

            {/* Clear Recommend Message Announcement */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.35 }}>
                🍽️ Personalized food recommendations for <strong>{currentWindow.mealLabel}</strong> will be recommended at{' '}
                <span style={{ textDecoration: 'underline', color: 'var(--primary)' }}>{currentWindow.recommendationTime12h}</span>{' '}
                (1 hour before your scheduled meal at <strong>{currentWindow.eatingTime12h}</strong>).
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                Once recommended at {currentWindow.recommendationTime12h}, your tailored meal plan remains available <strong>throughout the day until 11:59 PM</strong>. At 11:59 PM, it automatically refreshes for the new day to provide fresh pre-meal guidance.
              </p>
            </div>

            {/* Pre-Meal Biomarkers Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                background: 'var(--bg-card)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.60rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Current Glucose
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: metrics.glucoseColor || 'var(--primary)', marginTop: 1 }}>
                  {metrics.currentGlucose || latestGlucose?.readingMg || 110} <span style={{ fontSize: '0.60rem' }}>mg/dL</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.60rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Walking Steps
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <Footprints size={12} color="var(--primary)" />
                  <span>{(metrics.stepsWalked !== undefined ? metrics.stepsWalked : (stepsData?.current || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.60rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Walking Burn
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f59e0b', marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <Flame size={12} color="#f59e0b" />
                  <span>{metrics.caloriesBurned || 0} <span style={{ fontSize: '0.60rem' }}>kcal</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Meal Daily Schedule Timetable */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <Calendar size={13} color="var(--primary)" />
              <span>Daily Pre-Meal Recommendation Schedule (Active till 11:59 PM)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { name: 'Breakfast', emoji: '🌅', time: tabWindows.breakfast.eatingTime12h, recTime: tabWindows.breakfast.recommendationTime12h, active: tabWindows.breakfast.isRecommendedToday },
                { name: 'Lunch', emoji: '☀️', time: tabWindows.lunch.eatingTime12h, recTime: tabWindows.lunch.recommendationTime12h, active: tabWindows.lunch.isRecommendedToday },
                { name: 'Dinner', emoji: '🌙', time: tabWindows.dinner.eatingTime12h, recTime: tabWindows.dinner.recommendationTime12h, active: tabWindows.dinner.isRecommendedToday }
              ].map(s => (
                <div
                  key={s.name}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: s.active ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
                    border: s.active ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-light)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {s.emoji} {s.name}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Eating: <strong>{s.time}</strong>
                  </div>
                  <div style={{ fontSize: '0.64rem', color: s.active ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, marginTop: 1 }}>
                    Rec: <strong>{s.recTime}</strong>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)',
                        background: s.active ? '#10b981' : 'var(--bg-card-subtle)',
                        color: s.active ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      {s.active ? 'Active till 11:59 PM' : `Opens at ${s.recTime}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Meal Health & Waiting Tips */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              💡 Clinical Pre-Meal Recommendations While You Wait:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-primary)' }}>
              <Droplets size={13} color="#0284c7" />
              <span><strong>Hydrate:</strong> Drink 1-2 glasses of water now to maintain good blood viscosity.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-primary)' }}>
              <Footprints size={13} color="var(--primary)" />
              <span><strong>Pre-Meal Walk:</strong> A light 10–15 min walk before {currentWindow.mealLabel} improves insulin sensitivity for upcoming carbs.</span>
            </div>
          </div>

          {/* Action Row: Preview Recommendations Toggle & Simulation Mode */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Eye size={13} color="var(--primary)" />
              <span>Preview Food Recommendations</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSimulations(!showSimulations)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: 0
              }}
            >
              <span>{showSimulations ? 'Hide Scenarios' : '⚡ Test High Walking vs Sedentary'}</span>
              {showSimulations ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Simulation Drawer if toggled */}
          {showSimulations && (
            <div
              style={{
                padding: '10px 12px',
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-light)'
              }}
            >
              <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                Select a test scenario to simulate how the pre-meal food recommendations adjust:
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleSimulate(6500, 88)}
                  className="btn btn-secondary"
                  style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700 }}
                >
                  🏃 High Walking (6,500 steps, Sugar 88)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate(800, 165)}
                  className="btn btn-secondary"
                  style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700 }}
                >
                  🪑 Sedentary (800 steps, Sugar 165)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate(5000, 62)}
                  className="btn btn-secondary"
                  style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)' }}
                >
                  ⚠️ Hypoglycemia (Sugar 62)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CASE 2: ACTIVE (1-HOUR MARK ARRIVED TILL 11:59 PM) OR PREVIEW MODE ── */}
      {isRecommendingFood && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Active Window Banner or Preview Mode Notice */}
          {previewMode && !isRecommendedToday ? (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} />
                <span>
                  <strong>Preview Mode:</strong> Simulating recommendations for {currentWindow.mealLabel}. Live recommendation unlocks at {currentWindow.recommendationTime12h} (active till 11:59 PM).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="btn btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.68rem', fontWeight: 700 }}
              >
                <EyeOff size={11} />
                <span>Return to Scheduled View</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6
              }}
            >
              <div style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Unlock size={14} />
                <span>
                  🟢 Food Recommendations Active for {currentWindow.mealLabel}! (Eating: {currentWindow.eatingTime12h})
                </span>
              </div>
              <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {currentWindow.isImmediatePreMeal && currentWindow.diffToMeal > 0
                  ? `Eating in ${currentWindow.diffToMeal} mins • Active till 11:59 PM`
                  : 'Active throughout the day till 11:59 PM'}
              </span>
            </div>
          )}

          {/* Vitals & Walking Metrics Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              background: 'var(--bg-card-subtle)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            {/* Glucose */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Current Glucose
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: metrics.glucoseColor || 'var(--primary)', marginTop: 2 }}>
                {metrics.currentGlucose || latestGlucose?.readingMg || 110} <span style={{ fontSize: '0.66rem' }}>mg/dL</span>
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: metrics.glucoseColor || 'var(--text-secondary)' }}>
                {metrics.glucoseLabel || 'Normal'}
              </div>
            </div>

            {/* Steps Walked */}
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Steps Walked
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Footprints size={14} color="var(--primary)" />
                <span>{(metrics.stepsWalked !== undefined ? metrics.stepsWalked : (stepsData?.current || 0)).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--primary)' }}>
                {metrics.activityBadge || 'Logged Activity'}
              </div>
            </div>

            {/* Calories Burned */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Walking Burn
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Flame size={14} color="#f59e0b" />
                <span>{metrics.caloriesBurned || 0} <span style={{ fontSize: '0.66rem' }}>kcal</span></span>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {metrics.distanceKm || 0} km walked
              </div>
            </div>
          </div>

          {/* Clinical Physiological Impact Notice */}
          {analysis && (
            <div
              style={{
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                borderRadius: 'var(--radius-md)',
                padding: '11px 13px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {analysis.alertLevel === 'danger' ? (
                    <ShieldAlert size={16} color={badgeColor} />
                  ) : analysis.alertLevel === 'warning' ? (
                    <AlertTriangle size={16} color={badgeColor} />
                  ) : (
                    <CheckCircle2 size={16} color={badgeColor} />
                  )}
                  <strong style={{ fontSize: '0.78rem', color: badgeColor }}>
                    {analysis.alertBadge}
                  </strong>
                </div>

                {analysis.carbAdjustmentGram !== 0 && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      color: analysis.carbAdjustmentGram > 0 ? '#10b981' : '#f59e0b',
                      background: 'var(--bg-card)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {analysis.carbAdjustmentGram > 0 ? `+${analysis.carbAdjustmentGram}g Carbs Added` : `${analysis.carbAdjustmentGram}g Carbs Restricted`}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.74rem', color: 'var(--text-primary)', margin: '4px 0 6px', lineHeight: 1.45 }}>
                {analysis.physiologicalRationale}
              </p>

              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <span><strong>Clinical Action:</strong> {plan?.actionAdvice || 'Eat fiber first, followed by complex carbohydrates.'}</span>
              </div>
            </div>
          )}

          {/* Recommended Authentic Indian Meal Dishes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={14} color="var(--primary)" />
                <span>Recommended Indian Dishes for {plan?.mealLabel || currentWindow.mealLabel}</span>
              </h4>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Authentic Low-GI Curated
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(plan?.recommendedMeals || []).map((dish, idx) => {
                const isExpanded = expandedItem === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{dish.icon || '🍲'}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                            {dish.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            {dish.portion}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedItem(isExpanded ? null : idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 2,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Macro Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 4 }}>
                        {dish.calories} kcal
                      </span>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: 4 }}>
                        Carbs: {dish.carbs}g
                      </span>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: 4 }}>
                        Protein: {dish.protein}g
                      </span>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 6px', borderRadius: 4 }}>
                        Fiber: {dish.fiber}g
                      </span>
                      <span style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--text-muted)', border: '1px solid var(--border-light)', padding: '1px 5px', borderRadius: 4 }}>
                        GI: {dish.giIndex} ({dish.giRating})
                      </span>
                    </div>

                    {/* Glycemic Reason */}
                    <div
                      style={{
                        fontSize: '0.70rem',
                        color: 'var(--text-secondary)',
                        marginTop: 6,
                        padding: '5px 8px',
                        background: 'var(--bg-card)',
                        borderRadius: 4,
                        borderLeft: '2px solid var(--primary)'
                      }}
                    >
                      💡 {dish.glycemicReason}
                    </div>

                    {/* Expandable Recipe & Ingredients */}
                    {isExpanded && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)', fontSize: '0.72rem' }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Indian Ingredients: </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{(dish.ingredients || []).join(', ')}</span>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Preparation: </strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{dish.recipe}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Beverage & Post-Meal Walk Target */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              background: 'var(--bg-card-subtle)',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Recommended Beverage
              </span>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                {plan?.recommendedBeverage || 'Fresh Jeera Buttermilk (Chaas)'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Pre-Meal Walking Activity
              </span>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Activity size={13} />
                <span>{(metrics.stepsWalked || 0).toLocaleString()} steps ({metrics.caloriesBurned || 0} kcal burned)</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Panel Toggle & Navigation */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowSimulations(!showSimulations)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0
                }}
              >
                <span>{showSimulations ? 'Hide Clinical Test Scenarios' : '⚡ Test High Walking vs Sedentary Scenarios'}</span>
                {showSimulations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {onNavigateToFood && (
                <button
                  type="button"
                  onClick={onNavigateToFood}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0
                  }}
                >
                  <span>Full Diet View</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {showSimulations && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-light)'
                }}
              >
                <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Select a scenario to witness how the algorithm dynamically adapts to high walking calorie burns vs sedentary risks:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleSimulate(6500, 88)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700 }}
                  >
                    🏃 High Walking (6,500 steps, Sugar 88)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulate(800, 165)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700 }}
                  >
                    🪑 Sedentary (800 steps, Sugar 165)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulate(5000, 62)}
                    className="btn btn-secondary"
                    style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--danger)' }}
                  >
                    ⚠️ Hypoglycemia (Sugar 62)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewMode(false);
                      handleSimulate(stepsData?.current || 3200, latestGlucose?.readingMg || 110);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '5px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)' }}
                  >
                    🔄 Reset to Live Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
