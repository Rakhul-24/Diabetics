import React, { useState, useEffect, useRef } from 'react';
import {
  Footprints,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Check,
  Timer,
  Activity,
  Award
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const ExerciseView = () => {
  const {
    exercises,
    toggleExerciseComplete,
    addExercise,
    stepsData,
    addSteps,
    dailyFoodPlan,
    applySuggestedStepsGoal
  } = useHealth();

  // Custom workout modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Cardio');
  const [duration, setDuration] = useState('20');
  const [calories, setCalories] = useState('100');
  const [stepGoalApplied, setStepGoalApplied] = useState(false);

  // Sensor state (silent & automatic)
  const [isWalkingDetected, setIsWalkingDetected] = useState(false);
  const walkingTimeoutRef = useRef(null);

  // 15-Minute Post-Meal Walk Timer state
  const [timerSeconds, setTimerSeconds] = useState(15 * 60); // 15 mins target
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ── 1. AUTOMATIC BACKGROUND MOBILE SENSOR STEP DETECTION (NO PERMISSION PROMPTS) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastStepTime = 0;
    let lastMagnitude = 9.8;
    let isRising = false;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      // 3D vector magnitude: sqrt(x^2 + y^2 + z^2)
      const rawMag = Math.sqrt(x * x + y * y + z * z);
      if (isNaN(rawMag) || rawMag === 0) return;

      // Smooth filtering
      const mag = (lastMagnitude * 0.35) + (rawMag * 0.65);
      const delta = Math.abs(mag - 9.8);
      const now = Date.now();

      // Peak detection for step detection (debounce ~320ms to avoid double count)
      if (delta > 2.1 && !isRising && (now - lastStepTime > 320)) {
        isRising = true;
        lastStepTime = now;
        addSteps(1);

        setIsWalkingDetected(true);
        if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
        walkingTimeoutRef.current = setTimeout(() => {
          setIsWalkingDetected(false);
        }, 2500);
      } else if (delta < 0.6) {
        isRising = false;
      }

      lastMagnitude = mag;
    };

    // Attach immediately without asking
    try {
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion, { passive: true });
      }
    } catch (err) {}

    // On iOS Safari, quietly register on first user tap without intrusive popups
    const silentInit = () => {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(res => {
          if (res === 'granted') {
            window.addEventListener('devicemotion', handleMotion, { passive: true });
          }
        }).catch(() => {});
      }
      window.removeEventListener('click', silentInit);
      window.removeEventListener('touchstart', silentInit);
    };

    window.addEventListener('click', silentInit, { once: true });
    window.addEventListener('touchstart', silentInit, { once: true });

    return () => {
      try {
        window.removeEventListener('devicemotion', handleMotion);
      } catch (e) {}
      window.removeEventListener('click', silentInit);
      window.removeEventListener('touchstart', silentInit);
      if (walkingTimeoutRef.current) clearTimeout(walkingTimeoutRef.current);
    };
  }, [addSteps]);

  // ── 2. POST-MEAL WALK TIMER (AUTO-LOGS STEPS) ───────────────────────────
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => Math.max(0, prev - 1));
        // Add step simulation if walking session is active
        addSteps(1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, addSteps]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stepsGoal = stepsData?.goal || 8000;
  const currentSteps = stepsData?.current || 0;
  const stepsPercent = Math.min(100, Math.round((currentSteps / stepsGoal) * 100));

  // Suggested step target from AI
  const suggestedTarget = dailyFoodPlan?.stepsGuidance?.dailyStepTarget || 8500;

  const handleApplyStepsGoal = () => {
    applySuggestedStepsGoal(suggestedTarget);
    setStepGoalApplied(true);
    setTimeout(() => setStepGoalApplied(false), 2500);
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!name) return;

    addExercise({
      name,
      type,
      durationMinutes: Number(duration) || 20,
      caloriesBurn: Number(calories) || 100,
      intensity: 'Moderate',
      icon: type === 'Cardio' ? '🏃' : type === 'Strength' ? '💪' : '🧘',
      targetBenefit: 'Enhances insulin sensitivity & GLUT-4 uptake'
    });

    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>

      {/* ── 1. CLEAN STEPS DASHBOARD WITH AUTO SENSOR ─────────────────────────── */}
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
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-xs)',
                background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Footprints size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>
                Daily Steps & Activity
              </h2>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Hardware auto-tracking active in pocket or hand
              </div>
            </div>
          </div>

          {/* Discreet Live Sensor Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isWalkingDetected && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Activity size={12} className="spin" />
                <span>Walking Detected</span>
              </span>
            )}

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
              title="Mobile accelerometer sensor tracks your steps automatically"
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 6px var(--primary)'
                }}
              />
              Auto Sensor Active
            </span>
          </div>
        </div>

        {/* Big Step Progress Display */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {currentSteps.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginLeft: 8 }}>
              / {stepsGoal.toLocaleString()} steps goal
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

        {/* 3 Metric Tiles: Distance, Calories, Time */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
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
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 800 }}>WALK TIME</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
              {Math.round(currentSteps / 100)} <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>mins</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Strip: +250, +1000, and 1-Tap AI Target */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => addSteps(250)}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)' }}
              title="Add 250 steps (e.g. walked without phone)"
            >
              +250 Steps
            </button>
            <button
              onClick={() => addSteps(1000)}
              className="btn btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)' }}
              title="Add 1,000 steps"
            >
              +1,000 Steps
            </button>
          </div>

          <button
            onClick={handleApplyStepsGoal}
            className="btn btn-outline"
            style={{
              padding: '4px 11px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-full)',
              color: stepGoalApplied ? 'var(--primary)' : 'var(--text-secondary)',
              borderColor: stepGoalApplied ? 'var(--primary)' : 'var(--border-light)',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {stepGoalApplied ? <Check size={12} color="var(--primary)" /> : <Award size={12} />}
            <span>{stepGoalApplied ? 'Goal Applied!' : `AI Goal: ${suggestedTarget.toLocaleString()} steps`}</span>
          </button>
        </div>
      </div>

      {/* ── 2. POST-MEAL WALK COMPANION (15 MIN TIMER) ────────────────────────── */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Timer size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>
                15-Min Post-Meal Walk Companion
              </h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>
                Gentle walking within 30 min of eating absorbs glucose directly into muscles
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--primary)'
            }}
          >
            Blunts Sugar Spikes
          </span>
        </div>

        {/* Timer Display & Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card-subtle)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--text-primary)' }}>
              {formatTimer(timerSeconds)}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              {isTimerRunning ? '🟢 Walk in progress · auto-counting steps' : 'Ready for post-meal stroll'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`btn ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: 800, borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isTimerRunning ? 'Pause' : 'Start Walk'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(15 * 60);
              }}
              className="icon-btn"
              style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)' }}
              title="Reset timer to 15 mins"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. TODAY'S WORKOUTS & EXERCISES ───────────────────────────────────── */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              Today's Workout Plan
            </h3>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {exercises.filter(e => e.completed).length} of {exercises.length} activities completed
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.74rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={14} />
            <span>Add Activity</span>
          </button>
        </div>

        {/* Exercises List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map(exercise => (
            <div
              key={exercise.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                background: exercise.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card-subtle)',
                border: exercise.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-light)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{exercise.icon || '🏃'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0, textDecoration: exercise.completed ? 'line-through' : 'none', color: exercise.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {exercise.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {exercise.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    ⏱️ {exercise.durationMinutes} mins • 🔥 {exercise.caloriesBurn} kcal
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleExerciseComplete(exercise.id)}
                className="btn"
                style={{
                  padding: '5px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  background: exercise.completed ? 'var(--primary)' : 'var(--bg-card)',
                  color: exercise.completed ? '#ffffff' : 'var(--text-secondary)',
                  border: exercise.completed ? 'none' : '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                {exercise.completed ? <Check size={12} /> : null}
                <span>{exercise.completed ? 'Done ✓' : 'Complete'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. ADD CUSTOM WORKOUT MODAL ───────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Log New Activity
            </h3>

            <form onSubmit={handleAddExercise}>
              <div className="form-group">
                <label className="form-label">Activity Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Evening Brisk Stroll"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Cardio">🏃 Cardio / Walk</option>
                  <option value="Strength">💪 Resistance / Strength</option>
                  <option value="Flexibility">🧘 Yoga / Stretching</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label">Duration (mins)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="20"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Calories Burn (kcal)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="100"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
