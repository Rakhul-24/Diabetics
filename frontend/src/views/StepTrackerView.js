import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Footprints,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Calendar,
  CheckCircle2,
  Award,
  BarChart2
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const StepTrackerView = () => {
  const {
    stepsData,
    stepHistory,
    addSteps,
    resetTodaySteps,
    isPedometerActive,
    setIsPedometerActive,
    dailyFoodPlan,
    applySuggestedStepsGoal
  } = useHealth();

  const [stepGoalApplied, setStepGoalApplied] = useState(false);
  const [selectedHistoryDay, setSelectedHistoryDay] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Sensor state
  const [sensorValues, setSensorValues] = useState({ x: 0, y: 0, z: 0, magnitude: 9.8 });
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [stepSensitivity, setStepSensitivity] = useState('normal'); // 'low', 'normal', 'high'
  const [cadence, setCadence] = useState(0); // steps per minute
  const [isWalking, setIsWalking] = useState(false);

  // Post-meal walk session timer
  const [postMealTimerActive, setPostMealTimerActive] = useState(false);
  const [postMealSeconds, setPostMealSeconds] = useState(15 * 60); // 15 mins target
  const [postMealSteps, setPostMealSteps] = useState(0);

  // References for peak detection algorithm
  const lastStepTimeRef = useRef(0);
  const lastMagnitudeRef = useRef(9.8);
  const isRisingRef = useRef(false);
  const stepTimesHistoryRef = useRef([]);
  const walkingTimeoutRef = useRef(null);

  // Sensitivity thresholds (magnitude difference in m/s^2)
  const getThreshold = useCallback(() => {
    switch (stepSensitivity) {
      case 'high': return 1.8;
      case 'low': return 3.2;
      default: return 2.3; // normal
    }
  }, [stepSensitivity]);

  // Handle a step detected
  const handleStepDetected = useCallback((count = 1) => {
    const now = Date.now();
    lastStepTimeRef.current = now;

    // Update global app state (with day check & persistent storage)
    addSteps(count);

    // Update local session
    if (postMealTimerActive) {
      setPostMealSteps(prev => prev + count);
    }

    // Walking status flag
    setIsWalking(true);
    if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
    walkingTimeoutRef.current = setTimeout(() => {
      setIsWalking(false);
      setCadence(0);
    }, 2800);

    // Calculate cadence (steps in last 10 seconds extrapolated to 60s)
    stepTimesHistoryRef.current.push(now);
    const tenSecondsAgo = now - 10000;
    stepTimesHistoryRef.current = stepTimesHistoryRef.current.filter(t => t > tenSecondsAgo);
    const recentCount = stepTimesHistoryRef.current.length;
    const computedCadence = Math.round((recentCount / 10) * 60);
    setCadence(computedCadence);
  }, [addSteps, postMealTimerActive]);

  // Accelerometer DeviceMotion Listener
  useEffect(() => {
    if (!isPedometerActive) return;

    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      return;
    }

    const threshold = getThreshold();

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      // 3D vector magnitude: sqrt(x^2 + y^2 + z^2)
      const rawMagnitude = Math.sqrt(x * x + y * y + z * z);
      
      // Low-pass filter for smooth motion
      const magnitude = (lastMagnitudeRef.current * 0.3) + (rawMagnitude * 0.7);
      const intensity = Math.max(0, Math.min(100, Math.round(Math.abs(magnitude - 9.8) * 15)));

      setSensorValues({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        z: Number(z.toFixed(2)),
        magnitude: Number(magnitude.toFixed(2))
      });
      setMotionIntensity(intensity);

      const now = Date.now();
      const timeSinceLastStep = now - lastStepTimeRef.current;
      const magDiff = magnitude - 9.8;

      // Step Peak Detection with debounce (min 280ms between steps)
      if (magDiff > threshold && !isRisingRef.current && timeSinceLastStep > 280) {
        isRisingRef.current = true;
      } else if (magDiff < 0.4 && isRisingRef.current) {
        isRisingRef.current = false;
        handleStepDetected(1);
      }

      lastMagnitudeRef.current = magnitude;
    };

    window.addEventListener('devicemotion', handleMotion, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isPedometerActive, getThreshold, handleStepDetected]);

  // Request Sensor Permission (required for iOS Safari and some modern browsers)
  const requestMotionPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setIsPedometerActive(true);
        }
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        setIsPedometerActive(true);
      }
    } else {
      // Android & Desktop Chrome
      setIsPedometerActive(true);
    }
  };

  // Post-meal countdown timer
  useEffect(() => {
    let interval = null;
    if (postMealTimerActive && postMealSeconds > 0) {
      interval = setInterval(() => {
        setPostMealSeconds(prev => prev - 1);
      }, 1000);
    } else if (postMealSeconds === 0) {
      setPostMealTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [postMealTimerActive, postMealSeconds]);

  const toggleTracking = () => {
    if (!isPedometerActive) {
      requestMotionPermission();
    } else {
      setIsPedometerActive(false);
      setCadence(0);
      setIsWalking(false);
    }
  };

  // Manual Step Simulation (Useful for testing without physical phone motion)
  const handleSimulateStep = (count = 1) => {
    handleStepDetected(count);
  };

  const stepsGoal = stepsData?.goal || 8000;
  const currentSteps = stepsData?.current || 0;
  const stepsPercent = Math.min(100, Math.round((currentSteps / stepsGoal) * 100));
  const distanceKm = stepsData?.distanceKm || (currentSteps * 0.00075).toFixed(2);
  const caloriesBurned = stepsData?.caloriesBurned || Math.round(currentSteps * 0.04);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Today's Date String for Display
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Calculate 7-Day Statistics
  const historyList = stepHistory || [];
  const allDaysForChart = [
    ...historyList.slice(-6),
    {
      date: stepsData?.date || 'Today',
      day: 'Today',
      steps: currentSteps,
      goal: stepsGoal,
      distanceKm: Number(distanceKm),
      caloriesBurned: caloriesBurned,
      achieved: currentSteps >= stepsGoal
    }
  ];

  const totalWeekSteps = allDaysForChart.reduce((acc, d) => acc + (d.steps || 0), 0);
  const avgWeekSteps = Math.round(totalWeekSteps / allDaysForChart.length);
  const streakDays = allDaysForChart.filter(d => d.achieved).length;
  const bestDay = allDaysForChart.reduce((max, d) => ((d.steps || 0) > (max?.steps || 0) ? d : max), allDaysForChart[0]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Active Tracking Date Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Live Daily Sensor Active • Automatic rollover at 00:00 AM midnight
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowResetModal(true)}
          className="btn btn-secondary"
          style={{
            padding: '5px 10px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--danger)',
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}
          title="Reset today's steps counter"
        >
          <RotateCcw size={12} />
          <span>Reset Today</span>
        </button>
      </div>

      {/* 0. AI Prescribed Daily Step Target Card */}
      {dailyFoodPlan?.stepsGuidance && (
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(16, 185, 129, 0.1) 100%)',
            border: '1.5px solid rgba(14, 165, 233, 0.35)',
            padding: '14px 16px',
            boxShadow: '0 4px 16px rgba(14, 165, 233, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--secondary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={17} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    AI Prescribed Daily Steps: {dailyFoodPlan.stepsGuidance.dailyStepTarget.toLocaleString()} steps/day
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, background: 'rgba(14, 165, 233, 0.2)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: 4 }}>
                    Google Gemini 2.5 Flash
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Correlated with your glucose records & postprandial spike management
                </div>
              </div>
            </div>

            {stepsGoal !== dailyFoodPlan.stepsGuidance.dailyStepTarget && (
              <button
                onClick={() => {
                  applySuggestedStepsGoal(dailyFoodPlan.stepsGuidance.dailyStepTarget);
                  setStepGoalApplied(true);
                  setTimeout(() => setStepGoalApplied(false), 2500);
                }}
                className="btn btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {stepGoalApplied ? <CheckCircle2 size={14} /> : <Footprints size={14} />}
                <span>{stepGoalApplied ? 'Goal Applied!' : `Set Goal to ${dailyFoodPlan.stepsGuidance.dailyStepTarget.toLocaleString()}`}</span>
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 8 }}>
            <strong>Endocrinologist & Exercise Strategy:</strong> {dailyFoodPlan.stepsGuidance.clinicalRationale}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--primary)', fontWeight: 700 }}>
              <ShieldCheck size={14} />
              <span>{dailyFoodPlan.stepsGuidance.postMealWalkMinutes || 15} min Post-Meal Walk Recommended</span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>•</div>
            <div style={{ color: 'var(--warning)', fontWeight: 700 }}>
              🔥 ~{dailyFoodPlan.stepsGuidance.estimatedCaloriesBurn || 320} kcal estimated burn
            </div>
          </div>
        </div>
      )}

      {/* 1. Live Sensor Status Banner */}
      <div
        className="app-card"
        style={{
          background: isPedometerActive
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(14, 165, 233, 0.1) 100%)'
            : 'var(--bg-card-subtle)',
          border: isPedometerActive
            ? '1.5px solid rgba(16, 185, 129, 0.4)'
            : '1px solid var(--border-light)',
          padding: '14px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-xs)',
                background: isPedometerActive ? 'var(--primary-gradient)' : 'var(--bg-card)',
                color: isPedometerActive ? '#fff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPedometerActive ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
                flexShrink: 0
              }}
            >
              <Smartphone size={20} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Mobile Motion Sensor</h3>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isPedometerActive ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                    color: isPedometerActive ? '#15803d' : 'var(--text-muted)',
                    border: `1px solid ${isPedometerActive ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-light)'}`
                  }}
                >
                  {isPedometerActive ? (isWalking ? '● WALKING DETECTED' : '● SENSOR ACTIVE') : '○ PAUSED'}
                </span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {isPedometerActive
                  ? 'Counting physical steps in real-time via phone 3-axis accelerometer'
                  : 'Start tracker to detect walking steps using built-in phone hardware'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={toggleTracking}
              className="btn btn-primary"
              style={{
                background: isPedometerActive ? 'var(--danger)' : 'var(--primary-gradient)',
                boxShadow: isPedometerActive ? '0 3px 10px rgba(239, 68, 68, 0.35)' : '0 3px 12px rgba(16, 185, 129, 0.35)',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              {isPedometerActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPedometerActive ? 'Pause Sensor' : 'Start Sensor'}</span>
            </button>
          </div>
        </div>

        {/* Live Motion Intensity Meter */}
        {isPedometerActive && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Phone Accelerometer Magnitude: <strong>{sensorValues.magnitude} m/s²</strong></span>
              <span>Cadence: <strong>{cadence} steps/min</strong></span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${motionIntensity}%`,
                  height: '100%',
                  background: motionIntensity > 50 ? 'var(--primary-gradient)' : 'var(--secondary)',
                  transition: 'width 0.1s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Hero Step Counter Card with Date & Auto-Reset Status */}
      <div
        className="app-card"
        style={{
          padding: '20px 18px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Footprints size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Today's Total Steps</span>
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>
            {stepsPercent}% of {stepsGoal.toLocaleString()} goal
          </span>
        </div>

        {/* Current Day Label & Auto-Reset Notice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            📅 {todayFormatted}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#16a34a', background: 'rgba(52, 168, 83, 0.12)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            ● Midnight Auto-Reset
          </span>
        </div>

        {/* Large Step Number Display */}
        <div style={{ margin: '12px 0' }}>
          <div style={{ fontSize: '3.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {currentSteps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600 }}>
            Physical Steps Recorded Today
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden', margin: '10px 0 16px' }}>
          <div
            style={{
              width: `${stepsPercent}%`,
              height: '100%',
              background: 'var(--primary-gradient)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* 3 Metric Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ padding: '10px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>DISTANCE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary)', marginTop: 2 }}>
              {distanceKm} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>km</span>
            </div>
          </div>

          <div style={{ padding: '10px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>BURNED</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--warning)', marginTop: 2 }}>
              {caloriesBurned} <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>kcal</span>
            </div>
          </div>

          <div style={{ padding: '10px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>CADENCE</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-purple)', marginTop: 2 }}>
              {cadence || (isPedometerActive ? '102' : '0')} <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>spm</span>
            </div>
          </div>
        </div>

        {/* Quick Test / Manual Step Add Buttons */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
          <button
            onClick={() => handleSimulateStep(1)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
            title="Simulate 1 step"
          >
            +1 Step
          </button>
          <button
            onClick={() => handleSimulateStep(50)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
          >
            +50 Steps
          </button>
          <button
            onClick={() => handleSimulateStep(250)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem' }}
          >
            +250 Steps
          </button>
          <button
            onClick={() => setShowResetModal(true)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.76rem', color: 'var(--danger)' }}
            title="Reset steps for today"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 3. STEP ANALYTICS & PREVIOUS DAYS EXPLORER */}
      <div className="app-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <BarChart2 size={18} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Step Analytics & Previous Days Explorer</h3>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                Tap any day to inspect glycemic impact & energy metrics
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            ● Daily Auto-Archive
          </span>
        </div>

        {/* 4 Summary Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          <div style={{ padding: '8px 8px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>7-DAY AVG</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
              {avgWeekSteps.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>steps/day</div>
          </div>

          <div style={{ padding: '8px 8px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEST DAY</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--warning)', marginTop: 2 }}>
              {bestDay?.steps?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{bestDay?.day || 'Record'} 🏆</div>
          </div>

          <div style={{ padding: '8px 8px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>GOAL STREAK</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#16a34a', marginTop: 2 }}>
              {streakDays}/{allDaysForChart.length}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Days Met 🔥</div>
          </div>

          <div style={{ padding: '8px 8px', borderRadius: 'var(--radius-xs)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE BURN</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)', marginTop: 2 }}>
              {Math.round(totalWeekSteps * 0.04).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>total kcal</div>
          </div>
        </div>

        {/* Visual Interactive 7-Day Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, padding: '10px 4px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 12 }}>
          {allDaysForChart.map((dayItem, idx) => {
            const isToday = idx === allDaysForChart.length - 1;
            const pct = Math.min(100, Math.round(((dayItem.steps || 0) / (dayItem.goal || 8000)) * 100));
            const barHeight = Math.max(14, Math.round((pct / 100) * 80));
            const isGoalMet = (dayItem.steps || 0) >= (dayItem.goal || 8000);
            const isSelected = selectedHistoryDay?.date === dayItem.date;

            return (
              <div
                key={dayItem.date || idx}
                onClick={() => setSelectedHistoryDay(dayItem)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  flex: 1,
                  cursor: 'pointer',
                  padding: '4px 2px',
                  borderRadius: 'var(--radius-xs)',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
                title={`Click to analyze ${dayItem.day} (${dayItem.steps?.toLocaleString()} steps)`}
              >
                <div style={{ fontSize: '0.64rem', fontWeight: 800, color: isGoalMet ? '#16a34a' : 'var(--text-secondary)' }}>
                  {((dayItem.steps || 0) / 1000).toFixed(1)}k
                </div>

                <div
                  style={{
                    width: '65%',
                    maxWidth: 26,
                    height: `${barHeight}px`,
                    background: isToday
                      ? 'var(--primary-gradient)'
                      : isGoalMet
                      ? '#16a34a'
                      : 'var(--secondary)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    boxShadow: isSelected
                      ? '0 0 10px rgba(16, 185, 129, 0.6)'
                      : isToday
                      ? '0 2px 8px rgba(16, 185, 129, 0.35)'
                      : 'none',
                    border: isSelected ? '1.5px solid #fff' : 'none'
                  }}
                />

                <div style={{ fontSize: '0.7rem', fontWeight: isToday || isSelected ? 800 : 600, color: isToday ? 'var(--primary)' : isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {dayItem.day || 'Day'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Deep-Dive Analysis Panel */}
        {selectedHistoryDay && (
          <div
            style={{
              marginBottom: 14,
              padding: '12px 14px',
              borderRadius: 'var(--radius-xs)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={15} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Analysis: {selectedHistoryDay.day} • {selectedHistoryDay.date}
                </span>
              </div>
              <button
                onClick={() => setSelectedHistoryDay(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
              <div style={{ padding: '6px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>STEPS / GOAL</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {selectedHistoryDay.steps?.toLocaleString()} / {(selectedHistoryDay.goal || 8000).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: selectedHistoryDay.steps >= (selectedHistoryDay.goal || 8000) ? '#16a34a' : 'var(--warning)' }}>
                  {Math.round(((selectedHistoryDay.steps || 0) / (selectedHistoryDay.goal || 8000)) * 100)}% of Target
                </div>
              </div>

              <div style={{ padding: '6px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>DISTANCE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--secondary)' }}>
                  {selectedHistoryDay.distanceKm || (selectedHistoryDay.steps * 0.00075).toFixed(2)} km
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>
                  ~{Math.round((selectedHistoryDay.steps || 0) / 100)} mins active
                </div>
              </div>

              <div style={{ padding: '6px 8px', background: 'var(--bg-card)', borderRadius: 6 }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700 }}>CALORIES</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--warning)' }}>
                  {selectedHistoryDay.caloriesBurned || Math.round((selectedHistoryDay.steps || 0) * 0.04)} kcal
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Active energy</div>
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              🩺 <strong>Glycemic Impact:</strong> Walking {selectedHistoryDay.steps?.toLocaleString()} steps on this day stimulated skeletal muscle glucose transporters (GLUT-4) independently of insulin, effectively blunting postprandial glucose surges by an estimated 25-35 mg/dL.
            </div>
          </div>
        )}

        {/* Daily Archive Log List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {allDaysForChart.slice().reverse().map((record, index) => {
            const isSelected = selectedHistoryDay?.date === record.date;
            const isToday = index === 0;
            const isGoalMet = record.steps >= (record.goal || 8000);

            return (
              <div
                key={record.date || index}
                onClick={() => setSelectedHistoryDay(record)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: isSelected
                    ? 'rgba(16, 185, 129, 0.15)'
                    : isToday
                    ? 'var(--primary-light)'
                    : 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  border: isSelected
                    ? '1.5px solid var(--primary)'
                    : isToday
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                title="Click to view detailed metrics"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: isGoalMet ? 'rgba(22, 163, 74, 0.15)' : 'var(--bg-card)',
                      color: isGoalMet ? '#16a34a' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}
                  >
                    {record.day?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.82rem', color: isToday ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {isToday ? 'Today (Active)' : record.date}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        • {record.day}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {record.distanceKm || (record.steps * 0.00075).toFixed(1)} km • {record.caloriesBurned || Math.round(record.steps * 0.04)} kcal burned
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {record.steps?.toLocaleString()} steps
                    </div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 700, color: isGoalMet ? '#16a34a' : 'var(--text-muted)' }}>
                      {Math.round(((record.steps || 0) / (record.goal || 8000)) * 100)}% of goal
                    </div>
                  </div>

                  {isGoalMet ? (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }} title="Daily Goal Met!">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>
                      Incomplete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowResetModal(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 360, textAlign: 'center', padding: '24px 20px' }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--danger)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}
            >
              <RotateCcw size={22} />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 6 }}>
              Reset Today's Steps?
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.4 }}>
              This will reset today's active step count, distance, and calories to 0. All previous days' history and logs will remain permanently saved.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn btn-secondary"
                style={{ padding: '9px 14px', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  resetTodaySteps();
                }}
                className="btn"
                style={{
                  padding: '9px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  background: 'var(--danger)',
                  color: '#ffffff'
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Post-Meal Glucose Walking Coach Session */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '16px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={17} color="var(--warning)" />
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800 }}>Post-Meal Sugar Lowering Walk</h3>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            15 Min Goal
          </span>
        </div>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 12 }}>
          Walking for 15 minutes (~1,500 steps) within 30 minutes after eating activates muscle GLUT4 receptors, reducing blood glucose spikes by <strong>20-35 mg/dL</strong>.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SESSION TIMER</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
              {formatTimer(postMealSeconds)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>
              Session Steps: {postMealSteps.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                if (!postMealTimerActive) {
                  setPostMealTimerActive(true);
                  if (!isPedometerActive) requestMotionPermission();
                } else {
                  setPostMealTimerActive(false);
                }
              }}
              className="btn btn-primary"
              style={{
                background: postMealTimerActive ? 'var(--warning)' : 'var(--primary)',
                padding: '8px 14px',
                fontSize: '0.78rem'
              }}
            >
              {postMealTimerActive ? 'Pause Walk' : 'Start Post-Meal Walk'}
            </button>
            <button
              onClick={() => {
                setPostMealTimerActive(false);
                setPostMealSeconds(15 * 60);
                setPostMealSteps(0);
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 10px' }}
              title="Reset Timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Sensitivity & Sensor Calibration Settings */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Compass size={17} color="var(--secondary)" />
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800 }}>Pedometer Sensitivity</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { id: 'high', label: 'Sensitive', desc: 'Handheld / Slow walk' },
            { id: 'normal', label: 'Normal', desc: 'Pocket / Daily walk' },
            { id: 'low', label: 'Low', desc: 'Brisk / Running' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setStepSensitivity(opt.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 'var(--radius-sm)',
                background: stepSensitivity === opt.id ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                border: `1.5px solid ${stepSensitivity === opt.id ? 'var(--primary)' : 'var(--border-light)'}`,
                color: stepSensitivity === opt.id ? 'var(--primary)' : 'var(--text-primary)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', marginTop: 2 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Privacy & Auto-Reset Info */}
      <div
        className="app-card"
        style={{
          background: 'var(--bg-card-subtle)',
          padding: '12px 14px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start'
        }}
      >
        <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Daily Auto-Archive & Reset:</strong> Your steps automatically archive to your history every day at 12:00 AM midnight, resetting today's counter to 0 for a fresh day. All historical records are safely preserved in local device storage.
        </div>
      </div>
    </div>
  );
};
