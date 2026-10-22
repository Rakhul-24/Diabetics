import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Check,
  Award,
  ShieldCheck,
  Sliders,
  Sunrise,
  Sun,
  Sunset,
  Flame,
  Clock,
  Activity,
  Sparkles,
  Lock
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const ExerciseView = () => {
  const {
    user,
    stepsData,
    resetTodaySteps,
    dailyFoodPlan,
    applySuggestedStepsGoal,
    isPedometerActive,
    toggleStepTracking,
    backgroundKeepAlive,
    toggleBackgroundKeepAlive,
    stepSensitivity,
    setStepSensitivity,
    isWalking,
    cadence,
    motionIntensity,
    sensorStatus,
    sensorValues,
    requestSensorPermission,
    requestWakeLock,
    releaseWakeLock,
    preMealWalks
  } = useHealth();

  const [stepGoalApplied, setStepGoalApplied] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Active Pre-Meal Walk Session State
  const [activeSessionSlot, setActiveSessionSlot] = useState(null); // 'breakfast' | 'lunch' | 'dinner' | null
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionStepsStart, setSessionStepsStart] = useState(0);

  const mealTimes = user?.mealTimes || { breakfast: '08:00', lunch: '13:00', dinner: '20:00' };

  // Current time in minutes for detecting which walk is active right now
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeMin = (timeStr, def) => {
    if (!timeStr) return def;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const breakfastMin = parseTimeMin(mealTimes.breakfast, 480);
  const lunchMin = parseTimeMin(mealTimes.lunch, 780);
  const dinnerMin = parseTimeMin(mealTimes.dinner, 1200);

  // Determine current active walk window
  let currentActiveSlot = 'breakfast';
  if (currentMinutes > breakfastMin && currentMinutes <= lunchMin) {
    currentActiveSlot = 'lunch';
  } else if (currentMinutes > lunchMin && currentMinutes <= dinnerMin + 60) {
    currentActiveSlot = 'dinner';
  }

  // Active session stopwatch & step tracking
  useEffect(() => {
    let interval = null;
    if (activeSessionSlot) {
      requestWakeLock();
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      releaseWakeLock();
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
      releaseWakeLock();
    };
  }, [activeSessionSlot, requestWakeLock, releaseWakeLock]);

  const handleStartWalkSession = (slot) => {
    if (activeSessionSlot === slot) {
      // Pause/Stop
      setActiveSessionSlot(null);
    } else {
      // Start dedicated session
      setActiveSessionSlot(slot);
      setSessionSeconds(0);
      setSessionStepsStart(stepsData?.current || 0);
      if (!isPedometerActive) {
        toggleStepTracking();
      }
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stepsGoal = stepsData?.goal || 8000;
  const currentSteps = stepsData?.current || 0;
  const stepsPercent = Math.min(100, Math.round((currentSteps / stepsGoal) * 100));
  const suggestedTarget = dailyFoodPlan?.stepsGuidance?.dailyStepTarget || 8500;

  const handleApplyStepsGoal = () => {
    applySuggestedStepsGoal(suggestedTarget);
    setStepGoalApplied(true);
    setTimeout(() => setStepGoalApplied(false), 2500);
  };

  const userWeight = Number(user?.weight) || 72;
  const walks = preMealWalks || {};

  // Walk details metadata configuration
  const WALK_CARDS = [
    {
      slot: 'breakfast',
      title: 'Before Breakfast Walk',
      icon: Sunrise,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.12)',
      scheduledWindow: `06:30 – ${mealTimes.breakfast || '08:00'}`,
      eatingTime: mealTimes.breakfast || '08:00',
      targetSteps: walks.breakfast?.targetSteps || 2500,
      steps: walks.breakfast?.steps || 0,
      calories: walks.breakfast?.caloriesBurned || Math.round((walks.breakfast?.steps || 0) * 0.04 * (userWeight / 70)),
      durationMins: walks.breakfast?.durationMins || Math.round((walks.breakfast?.steps || 0) / 100),
      distanceKm: walks.breakfast?.distanceKm || Number(((walks.breakfast?.steps || 0) * 0.00075).toFixed(2)),
      clinicalRationale: 'Flushes overnight liver glycogen, breaks dawn phenomenon cortisol resistance, and primes muscle GLUT4 transporters to handle morning carbohydrates.',
      hypoBenefit: 'Prevents post-walk crashes when paired with your personalized breakfast.',
      isCurrentTime: currentActiveSlot === 'breakfast'
    },
    {
      slot: 'lunch',
      title: 'Before Lunch Walk',
      icon: Sun,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.12)',
      scheduledWindow: `11:30 – ${mealTimes.lunch || '13:00'}`,
      eatingTime: mealTimes.lunch || '13:00',
      targetSteps: walks.lunch?.targetSteps || 3000,
      steps: walks.lunch?.steps || 0,
      calories: walks.lunch?.caloriesBurned || Math.round((walks.lunch?.steps || 0) * 0.04 * (userWeight / 70)),
      durationMins: walks.lunch?.durationMins || Math.round((walks.lunch?.steps || 0) / 100),
      distanceKm: walks.lunch?.distanceKm || Number(((walks.lunch?.steps || 0) * 0.00075).toFixed(2)),
      clinicalRationale: 'Breaks midday sedentary insulin resistance. High walking calorie burn before lunch earns increased complex carb allowance in your 1-hour pre-meal plan.',
      hypoBenefit: 'High burn lowers pre-lunch glucose; requires complex carbohydrates to stabilize.',
      isCurrentTime: currentActiveSlot === 'lunch'
    },
    {
      slot: 'dinner',
      title: 'Before Dinner Walk',
      icon: Sunset,
      iconColor: '#8b5cf6',
      iconBg: 'rgba(139, 92, 246, 0.12)',
      scheduledWindow: `18:30 – ${mealTimes.dinner || '20:00'}`,
      eatingTime: mealTimes.dinner || '20:00',
      targetSteps: walks.dinner?.targetSteps || 2500,
      steps: walks.dinner?.steps || 0,
      calories: walks.dinner?.caloriesBurned || Math.round((walks.dinner?.steps || 0) * 0.04 * (userWeight / 70)),
      durationMins: walks.dinner?.durationMins || Math.round((walks.dinner?.steps || 0) / 100),
      distanceKm: walks.dinner?.distanceKm || Number(((walks.dinner?.steps || 0) * 0.00075).toFixed(2)),
      clinicalRationale: 'Prevents evening glycemic spikes, prepares leg muscles for continuous overnight glucose disposal, and prevents dawn spikes.',
      hypoBenefit: 'Ensures safe, flat blood sugar curve through the night.',
      isCurrentTime: currentActiveSlot === 'dinner'
    }
  ];

  const totalPreMealSteps = WALK_CARDS.reduce((sum, w) => sum + w.steps, 0);
  const totalPreMealCalories = WALK_CARDS.reduce((sum, w) => sum + w.calories, 0);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── 1. HARDWARE STEP SENSOR DASHBOARD ─────────────────────────────────── */}
      <div
        className="app-card"
        style={{
          padding: '18px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Header: Title & Auto-Sensor Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-xs)',
                background: isPedometerActive ? 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)' : 'var(--bg-card-subtle)',
                color: isPedometerActive ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPedometerActive ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <Smartphone size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>
                  Mobile Step Detection
                </h2>
                <span
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isWalking
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isPedometerActive
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                    color: isWalking ? '#15803d' : isPedometerActive ? 'var(--primary)' : 'var(--danger)',
                    border: `1px solid ${isPedometerActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  {isWalking
                    ? `● WALKING (${cadence} SPM)`
                    : isPedometerActive
                    ? '● SENSOR ACTIVE'
                    : '○ PAUSED'}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {isPedometerActive
                  ? 'Counts physical steps automatically in your pocket, hand, or background'
                  : 'Sensor paused • Tap Start to resume automatic pedometer'}
              </div>
            </div>
          </div>

          {/* Action buttons: Pause/Resume + Sensor Tuning */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={toggleStepTracking}
              className="btn btn-outline"
              style={{
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderColor: isPedometerActive ? 'var(--border-light)' : 'var(--primary)',
                color: isPedometerActive ? 'var(--text-secondary)' : 'var(--primary)'
              }}
            >
              {isPedometerActive ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPedometerActive ? 'Pause Sensor' : 'Start Sensor'}</span>
            </button>

            <button
              onClick={() => setShowSettingsDrawer(prev => !prev)}
              className="btn btn-outline"
              style={{
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: showSettingsDrawer ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                borderColor: showSettingsDrawer ? 'var(--primary)' : 'var(--border-light)'
              }}
              title="Configure sensor sensitivity & background pocket mode"
            >
              <Sliders size={12} />
              <span>Sensor Tuning</span>
            </button>
          </div>
        </div>

        {/* Live Motion Intensity & Telemetry Bar */}
        {isPedometerActive && (
          <div style={{ marginBottom: 14, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Phone Accelerometer: <strong>{sensorValues?.magnitude || 0} m/s²</strong></span>
              <span>Cadence: <strong style={{ color: isWalking ? 'var(--primary)' : 'inherit' }}>{cadence} spm</strong></span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${motionIntensity}%`,
                  height: '100%',
                  background: motionIntensity > 40 ? 'var(--primary-gradient)' : 'var(--secondary)',
                  transition: 'width 0.12s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Expandable Sensor Tuning Drawer */}
        {showSettingsDrawer && (
          <div
            style={{
              marginBottom: 14,
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {/* Background Pocket Tracking Switch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span>Background Pocket Tracking</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  Keeps sensors alive when phone screen locks or turns off in your pocket
                </div>
              </div>

              <button
                onClick={toggleBackgroundKeepAlive}
                className="btn btn-outline"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  background: backgroundKeepAlive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: backgroundKeepAlive ? 'var(--primary)' : 'var(--text-muted)',
                  borderColor: backgroundKeepAlive ? 'var(--primary)' : 'var(--border-light)'
                }}
              >
                {backgroundKeepAlive ? 'Active (Recommended)' : 'Disabled'}
              </button>
            </div>

            {/* Sensitivity Selector */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 5 }}>
                Pedometer Sensitivity:
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'high', label: 'High (Loose Pocket / Bag)' },
                  { id: 'normal', label: 'Normal (Standard Walk)' },
                  { id: 'low', label: 'Low (Firm / Jog)' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStepSensitivity(s.id)}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-xs)',
                      border: `1px solid ${stepSensitivity === s.id ? 'var(--primary)' : 'var(--border-light)'}`,
                      background: stepSensitivity === s.id ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card-subtle)',
                      color: stepSensitivity === s.id ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {sensorStatus === 'permission-needed' && (
              <button
                onClick={requestSensorPermission}
                className="btn btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.74rem', width: '100%', marginTop: 2 }}
              >
                Grant Mobile Motion Sensor Permission
              </button>
            )}
          </div>
        )}

        {/* Big Step Progress Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {currentSteps.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
              / {stepsGoal.toLocaleString()} daily goal
            </span>
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 900, color: stepsPercent >= 100 ? 'var(--primary)' : 'var(--text-primary)' }}>
            {stepsPercent}% {stepsPercent >= 100 ? '🏆' : ''}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--border-light)', overflow: 'hidden', marginBottom: 14 }}>
          <div
            style={{
              width: `${stepsPercent}%`,
              height: '100%',
              background: stepsPercent >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #10b981, #0ea5e9)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {/* 3 Metric Tiles: Distance, Calories, Walk Time */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          <div style={{ padding: '9px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800 }}>DISTANCE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>
              {stepsData?.distanceKm || 0} <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>km</span>
            </div>
          </div>

          <div style={{ padding: '9px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800 }}>ACTIVE CALORIES</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--warning)', marginTop: 2 }}>
              {stepsData?.caloriesBurned || 0} <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>kcal</span>
            </div>
          </div>

          <div style={{ padding: '9px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800 }}>TOTAL WALK TIME</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
              {Math.round(currentSteps / 100)} <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>mins</span>
            </div>
          </div>
        </div>

        {/* Strict Hardware Sensor Notice: Manual Step Addition Removed */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
          padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <Lock size={12} color="var(--primary)" />
            <span><strong>Automatic Hardware Only:</strong> Steps are detected strictly from physical phone motion.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleApplyStepsGoal}
              className="btn btn-outline"
              style={{
                padding: '4px 10px',
                fontSize: '0.70rem',
                borderRadius: 'var(--radius-full)',
                color: stepGoalApplied ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: stepGoalApplied ? 'var(--primary)' : 'var(--border-light)',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {stepGoalApplied ? <Check size={11} color="var(--primary)" /> : <Award size={11} />}
              <span>{stepGoalApplied ? 'Goal Applied!' : `AI Target: ${suggestedTarget.toLocaleString()}`}</span>
            </button>

            <button
              onClick={resetTodaySteps}
              className="btn btn-outline"
              style={{ padding: '4px 8px', fontSize: '0.70rem', borderRadius: 'var(--radius-full)', color: 'var(--danger)', borderColor: 'var(--border-light)' }}
              title="Reset today's count"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. PRE-MEAL WALKING ACTIVITY HEADER ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={18} color="var(--primary)" />
            <span>Pre-Meal Walking Activity</span>
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Walking before meals activates GLUT-4 glucose transporters to regulate post-meal blood sugar
          </p>
        </div>

        <span style={{
          fontSize: '0.66rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--primary)', padding: '3px 8px', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          3 Pre-Meal Walks
        </span>
      </div>

      {/* ── 3. PRE-MEAL WALKS SUMMARY STRIP ──────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        background: 'var(--bg-card)', padding: '12px 14px', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Pre-Meal Steps
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
            {totalPreMealSteps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Across all 3 meals</div>
        </div>

        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Walking Burn
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f59e0b', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Flame size={14} color="#f59e0b" />
            <span>{totalPreMealCalories} kcal</span>
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Pre-meal energy burn</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            Current Window
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 3 }}>
            {currentActiveSlot === 'breakfast' ? 'Breakfast' : currentActiveSlot === 'lunch' ? 'Lunch' : 'Dinner'} Walk
          </div>
          <div style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700 }}>
            Active Now 🟢
          </div>
        </div>
      </div>

      {/* ── 4. THE THREE PRE-MEAL WALKS CARDS ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WALK_CARDS.map(walk => {
          const Icon = walk.icon;
          const isSlotActiveSession = activeSessionSlot === walk.slot;
          const sessionStepsAdded = isSlotActiveSession ? Math.max(0, currentSteps - sessionStepsStart) : 0;
          const walkStepsTotal = walk.steps + sessionStepsAdded;
          const pct = Math.min(100, Math.round((walkStepsTotal / walk.targetSteps) * 100));

          return (
            <div
              key={walk.slot}
              className="app-card"
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                background: walk.isCurrentTime
                  ? 'linear-gradient(180deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.04) 100%)'
                  : 'var(--bg-card)',
                border: isSlotActiveSession
                  ? '1.5px solid var(--primary)'
                  : walk.isCurrentTime
                  ? '1.5px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid var(--border-light)',
                boxShadow: isSlotActiveSession ? '0 4px 16px rgba(16, 185, 129, 0.2)' : 'var(--shadow-xs)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Card Header: Icon, Title, Eating Window & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-xs)',
                    background: walk.iconBg, color: walk.iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {walk.title}
                      </h4>
                      {walk.isCurrentTime && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)',
                          background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 'var(--radius-full)'
                        }}>
                          ACTIVE NOW 🟢
                        </span>
                      )}
                      {pct >= 100 && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 800, color: '#16a34a',
                          background: 'rgba(22, 163, 74, 0.15)', padding: '2px 7px', borderRadius: 'var(--radius-full)'
                        }}>
                          COMPLETED 🏆
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Clock size={11} color="var(--primary)" />
                      <span>Walk Window: <strong>{walk.scheduledWindow}</strong></span>
                      <span>•</span>
                      <span>Meal Eating Time: <strong>{walk.eatingTime}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Walk Session Action Button */}
                <button
                  type="button"
                  onClick={() => handleStartWalkSession(walk.slot)}
                  className={`btn ${isSlotActiveSession ? 'btn-secondary' : 'btn-primary'}`}
                  style={{
                    padding: '6px 14px', fontSize: '0.74rem', fontWeight: 800,
                    borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: isSlotActiveSession ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {isSlotActiveSession ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isSlotActiveSession ? 'Pause Walk' : 'Start Walk'}</span>
                </button>
              </div>

              {/* Live Session Active Banner (if user started this walk) */}
              {isSlotActiveSession && (
                <div style={{
                  marginBottom: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      🟢 Live Walk Session in Progress
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: 2 }}>
                      {formatTimer(sessionSeconds)}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-secondary)' }}>
                      Keep phone in your pocket or hand • Automatic hardware detection active
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>SESSION STEPS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>
                      +{sessionStepsAdded.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>
                      🔥 ~{Math.round(sessionStepsAdded * 0.04 * (userWeight / 70))} kcal
                    </div>
                  </div>
                </div>
              )}

              {/* Walk Progress & Metrics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>STEPS</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: 2 }}>
                    {walkStepsTotal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>/ {walk.targetSteps.toLocaleString()}</div>
                </div>

                <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>CALORIES BURN</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f59e0b', marginTop: 2 }}>
                    {walk.calories} <span style={{ fontSize: '0.62rem' }}>kcal</span>
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>energy burned</div>
                </div>

                <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>DISTANCE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--secondary)', marginTop: 2 }}>
                    {walk.distanceKm} <span style={{ fontSize: '0.62rem' }}>km</span>
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>walk distance</div>
                </div>

                <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800 }}>WALK DURATION</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
                    {walk.durationMins} <span style={{ fontSize: '0.62rem' }}>mins</span>
                  </div>
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>active time</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden', marginBottom: 10 }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: pct >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #10b981, #0ea5e9)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              {/* Clinical Glycemic Rationale Callout */}
              <div style={{
                padding: '8px 12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)',
                borderLeft: '3px solid var(--primary)', fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45
              }}>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>💡 Clinical Diabetes Action: </span>
                {walk.clinicalRationale}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 5. PHYSIOLOGICAL GLYCEMIC PRIMING SYNERGY ─────────────────────────── */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Sparkles size={16} color="var(--primary)" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            How Pre-Meal Walking Powers Your 1-Hour Food Advisor
          </h4>
        </div>

        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 10px' }}>
          Walking before eating stimulates muscular GLUT4 transporter translocation without relying on insulin.
          Our clinical algorithm evaluates your steps walked and calories burned <strong>1 hour before each meal</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem' }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 2 }}>🏃 High Walking & Calorie Burn:</strong>
            <span>Muscles consume circulating glucose fast, raising low-sugar (hypoglycemia) vulnerability. Algorithm adds wholesome complex carbs (+25g) to stabilize.</span>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: 2 }}>🪑 Low Walking & Sedentary State:</strong>
            <span>Dormant muscles slow glucose clearance, causing steep sugar spikes. Algorithm restricts carbs (-20g) and prescribes high-fiber Indian dishes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
