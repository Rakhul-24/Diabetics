import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const PreMealRecommendationCard = ({ compact = false, onNavigateToFood }) => {
  const {
    user,
    latestGlucose,
    stepsData,
    preMealPlan,
    isGeneratingPreMealPlan,
    upcomingMealInfo,
    generatePreMealPlan
  } = useHealth();

  const [selectedMeal, setSelectedMeal] = useState(upcomingMealInfo?.currentSelection?.type || 'lunch');
  const [expandedItem, setExpandedItem] = useState(null);
  const [showSimulations, setShowSimulations] = useState(false);

  const mealTimes = user?.mealTimes || { breakfast: '08:00', lunch: '13:00', dinner: '20:00' };

  const handleMealSwitch = (mealType) => {
    setSelectedMeal(mealType);
    generatePreMealPlan({ mealType });
  };

  const handleSimulate = (simSteps, simGlucose) => {
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

  return (
    <div className="app-card" style={{
      padding: '16px 18px',
      position: 'relative',
      overflow: 'hidden',
      border: '1.5px solid var(--border-light)',
      background: 'var(--bg-card)'
    }}>
      {/* Top Banner & Timing Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={19} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0 }}>
                1-Hour Pre-Meal Food Advisor
              </h3>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
                background: 'var(--primary-gradient)', color: '#fff',
                padding: '2px 7px', borderRadius: 'var(--radius-full)'
              }}>
                Smart Algorithm
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Clock size={11} color="var(--primary)" />
              <span>
                Calculated 1 hr prior based on <strong>Steps Walked</strong> &amp; <strong>Calories Burned</strong>
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

      {/* Meal Selection Tabs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
        background: 'var(--bg-card-subtle)', padding: 4, borderRadius: 'var(--radius-md)', marginBottom: 14
      }}>
        {[
          { type: 'breakfast', label: 'Breakfast', time: mealTimes.breakfast || '08:00' },
          { type: 'lunch', label: 'Lunch', time: mealTimes.lunch || '13:00' },
          { type: 'dinner', label: 'Dinner', time: mealTimes.dinner || '20:00' }
        ].map(m => {
          const active = selectedMeal === m.type;
          return (
            <button
              key={m.type}
              type="button"
              onClick={() => handleMealSwitch(m.type)}
              style={{
                border: 'none',
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                fontWeight: active ? 800 : 600,
                fontSize: '0.75rem',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
              }}
            >
              <span>{m.label}</span>
              <span style={{ fontSize: '0.62rem', opacity: active ? 0.9 : 0.7 }}>
                {m.time}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vitals & Walking Metrics Strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        background: 'var(--bg-card-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)', marginBottom: 12
      }}>
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
        <div style={{
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          borderRadius: 'var(--radius-md)',
          padding: '11px 13px',
          marginBottom: 14
        }}>
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
              <span style={{
                fontSize: '0.68rem', fontWeight: 800,
                color: analysis.carbAdjustmentGram > 0 ? '#10b981' : '#f59e0b',
                background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)'
              }}>
                {analysis.carbAdjustmentGram > 0 ? `+${analysis.carbAdjustmentGram}g Carbs Added` : `${analysis.carbAdjustmentGram}g Carbs Restricted`}
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--text-primary)', margin: '4px 0 6px', lineHeight: 1.45 }}>
            {analysis.physiologicalRationale}
          </p>

          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span><strong>Clinical Action:</strong> {plan.actionAdvice || 'Eat fiber first, followed by complex carbohydrates.'}</span>
          </div>
        </div>
      )}

      {/* Recommended Authentic Indian Meal Dishes */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Recommended Indian Dishes for {plan?.mealLabel || 'This Meal'}</span>
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
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center'
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
                <div style={{
                  fontSize: '0.70rem', color: 'var(--text-secondary)', marginTop: 6,
                  padding: '5px 8px', background: 'var(--bg-card)', borderRadius: 4,
                  borderLeft: '2px solid var(--primary)'
                }}>
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
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        background: 'var(--bg-card-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)', marginBottom: 12
      }}>
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

      {/* Interactive Simulation Panel Toggle */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setShowSimulations(!showSimulations)}
            style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, padding: 0
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
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, padding: 0
              }}
            >
              <span>Full Diet View</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {showSimulations && (
          <div style={{
            marginTop: 10, padding: '10px 12px', background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)'
          }}>
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
                onClick={() => handleSimulate(stepsData?.current || 3200, latestGlucose?.readingMg || 110)}
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
  );
};
