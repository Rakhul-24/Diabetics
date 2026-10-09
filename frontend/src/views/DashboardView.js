import React from 'react';
import {
  Droplet,
  GlassWater,
  Moon,
  Footprints,
  Pill,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Bot,
  Calendar,
  Utensils,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const DashboardView = ({ onViewChange, onOpenGlucoseModal }) => {
  const {
    user,
    latestGlucose,
    formatGlucose,
    getGlucoseUnit,
    getGlucoseStatus,
    tirPercentage,
    medications,
    toggleMedicationTaken,
    waterData,
    addWater,
    sleepData,
    stepsData,
    dailyFoodPlan,
    mealPlan
  } = useHealth();

  const status = getGlucoseStatus(latestGlucose.readingMg);
  const waterPercent = Math.min(100, Math.round((waterData.currentMl / waterData.dailyGoalMl) * 100));
  const stepsPercent = Math.min(100, Math.round((stepsData.current / stepsData.goal) * 100));

  // Calories eaten from mealPlan
  const allMeals = mealPlan?.meals ? Object.values(mealPlan.meals).flat() : [];
  const totalCalsEaten = allMeals.filter(m => m.eaten).reduce((acc, m) => acc + (Number(m.calories) || 0), 0);
  const calTarget = dailyFoodPlan?.targetNutrition?.dailyCalorieTarget || mealPlan?.dailyCalorieTarget || 1750;
  const calPercent = Math.min(100, Math.round((totalCalsEaten / calTarget) * 100));

  // Dynamic friendly greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── 1. WELCOME GREETING & DATE BANNER ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.08rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)' }}>
            {getGreeting()}, {user?.name || 'Arjun'} 👋
          </h2>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <Calendar size={12} color="var(--primary)" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <span>{user?.diabetesType || 'Type 2 Diabetes'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
            {tirPercentage}% In-Range
          </span>
        </div>
      </div>

      {/* ── 2. HERO BLOOD GLUCOSE CARD ───────────────────────────────────────── */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          border: '1.5px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 18px 16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Top Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Droplet size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Blood Glucose
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Latest reading recorded
              </div>
            </div>
          </div>

          <span className={`status-badge ${status.class}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {status.label}
          </span>
        </div>

        {/* Big Reading Display & Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: status.color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {formatGlucose(latestGlucose.readingMg)}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {getGlucoseUnit()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 5 }}>
              <Clock size={12} />
              <span>
                {latestGlucose.type ? latestGlucose.type.toUpperCase() : 'FASTING'} • {new Date(latestGlucose.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={onOpenGlucoseModal}
              style={{ padding: '8px 14px', fontSize: '0.8rem', fontWeight: 800, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Plus size={15} />
              <span>+ Log Glucose</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onViewChange('glucose')}
              style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>Trends</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Target Range Slider */}
        <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
            <span>Target Zone: 70 – 140 mg/dL</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{tirPercentage}% In Range (7-Day)</span>
          </div>
          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '15%', background: '#3b82f6' }} title="Hypoglycemia (<70)" />
            <div style={{ width: `${tirPercentage}%`, background: 'var(--primary)' }} title="Target In-Range (70-140)" />
            <div style={{ width: '15%', background: '#f59e0b' }} title="Elevated (141-180)" />
            <div style={{ width: `${Math.max(0, 100 - tirPercentage - 30)}%`, background: '#ef4444' }} title="High (>180)" />
          </div>
        </div>
      </div>

      {/* ── 3. 1-TAP QUICK ACTION CHIPS (FAST ACCESSIBLE LOGGING) ─────────────── */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0' }}>
        <button
          onClick={() => addWater(250, 'Quick +250ml')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            color: 'var(--secondary)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <GlassWater size={14} />
          <span>+250ml Water</span>
        </button>

        <button
          onClick={onOpenGlucoseModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            color: 'var(--primary)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <Droplet size={14} />
          <span>Log Glucose</span>
        </button>

        <button
          onClick={() => onViewChange('food')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            color: 'var(--warning)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <Utensils size={14} />
          <span>Log Meals</span>
        </button>

        <button
          onClick={() => onViewChange('exercise')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            color: 'var(--primary)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <Activity size={14} />
          <span>15m Walk</span>
        </button>

        <button
          onClick={() => onViewChange('ai-coach')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            color: 'var(--accent-purple)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            cursor: 'pointer'
          }}
        >
          <Bot size={14} />
          <span>Ask AI Coach</span>
        </button>
      </div>

      {/* ── 4. 4 HEALTH PILLARS GRID (STEPS, FOOD, WATER, SLEEP) ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>

        {/* 1. Workout & Steps (Auto-Sensor Active) */}
        <div
          className="app-card"
          onClick={() => onViewChange('exercise')}
          style={{
            cursor: 'pointer',
            padding: '13px 15px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Footprints size={15} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--primary)' }}>
              🟢 AUTO
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
            {stepsData.current.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Goal: {stepsData.goal.toLocaleString()} ({stepsPercent}%)
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${stepsPercent}%`, height: '100%', background: 'var(--primary)' }} />
          </div>
        </div>

        {/* 2. Diet & Nutrition Calories */}
        <div
          className="app-card"
          onClick={() => onViewChange('food')}
          style={{
            cursor: 'pointer',
            padding: '13px 15px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={15} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              NUTRITION
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
            {totalCalsEaten} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Target: {calTarget} kcal ({calPercent}%)
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${calPercent}%`, height: '100%', background: 'var(--warning)' }} />
          </div>
        </div>

        {/* 3. Hydration */}
        <div
          className="app-card"
          onClick={() => onViewChange('water')}
          style={{
            cursor: 'pointer',
            padding: '13px 15px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'rgba(14, 165, 233, 0.12)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GlassWater size={15} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              WATER
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
            {waterData.currentMl} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ml</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Goal: {waterData.dailyGoalMl} ml ({waterPercent}%)
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${waterPercent}%`, height: '100%', background: 'var(--secondary)' }} />
          </div>
        </div>

        {/* 4. Sleep & Rest */}
        <div
          className="app-card"
          onClick={() => onViewChange('sleep')}
          style={{
            cursor: 'pointer',
            padding: '13px 15px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-xs)', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={15} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              SLEEP
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.1 }}>
            {sleepData.lastNightDurationHours} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Score: {sleepData.qualityScore}% ({sleepData.qualityLabel})
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${sleepData.qualityScore}%`, height: '100%', background: 'var(--accent-purple)' }} />
          </div>
        </div>

      </div>

      {/* ── 5. AI CLINICAL DIET & STEP RECOMMENDATION HIGHLIGHT ───────────────── */}
      {dailyFoodPlan && (
        <div
          className="app-card"
          onClick={() => onViewChange('food')}
          style={{
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Today's Indian Nutrition Recommendation
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
              <span>View Food Menu</span>
              <ChevronRight size={13} />
            </span>
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            {dailyFoodPlan.analysis?.statusSummary ||
              'Recommended meals curated with slow-digesting complex carbs and high fiber to prevent postprandial glucose surges.'}
          </p>
        </div>
      )}

      {/* ── 6. TODAY'S PRESCRIPTIONS CHECKLIST ───────────────────────────────── */}
      <div className="app-card" style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill size={17} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
              Today's Prescriptions
            </h3>
          </div>
          <button
            onClick={() => onViewChange('medications')}
            style={{ fontSize: '0.74rem', color: 'var(--primary)', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Manage Meds →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {medications.map(med => (
            <div
              key={med.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ minWidth: 0, marginRight: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {med.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.74rem' }}>({med.dosage})</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {med.frequency}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {med.times.map((time, idx) => {
                  const isTaken = med.takenToday[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMedicationTaken(med.id, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${isTaken ? 'var(--primary)' : 'var(--border-light)'}`,
                        background: isTaken ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-card)',
                        color: isTaken ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isTaken ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                      <span>{time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
