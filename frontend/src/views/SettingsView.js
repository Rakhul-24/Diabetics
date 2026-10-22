import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Moon,
  Sun,
  Save,
  CheckCircle,
  LogOut,
  Smartphone,
  Download,
  ShieldCheck,
  Play,
  Pause,
  Clock,
  UtensilsCrossed
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsView = () => {
  const {
    user,
    setUser,
    logout,
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
    stepsData
  } = useHealth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user.name || '');
  const [age, setAge] = useState(user.age || 40);
  const [weight, setWeight] = useState(user.weight || 75);
  const [height, setHeight] = useState(user.height || 175);
  const [diabetesType, setDiabetesType] = useState(user.diabetesType || 'Type 2');
  const [unitPreference, setUnitPreference] = useState(user.unitPreference || 'mg/dL');
  const [breakfastTime, setBreakfastTime] = useState(user.mealTimes?.breakfast || '08:00');
  const [lunchTime, setLunchTime] = useState(user.mealTimes?.lunch || '13:00');
  const [dinnerTime, setDinnerTime] = useState(user.mealTimes?.dinner || '20:00');
  const [geminiApiKey, setGeminiApiKey] = useState(user.geminiApiKey || localStorage.getItem('gemini_api_key') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      alert("To install on Android: Tap the 3 dots (⋮) in Chrome and select 'Install app' or 'Add to Home Screen'.\n\nTo install on iPhone: Tap the Share icon (⎋) in Safari and select 'Add to Home Screen'.");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  // BMI Calculation
  const heightMeters = height / 100;
  const bmi = (weight / (heightMeters * heightMeters)).toFixed(1);
  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: 'Underweight', color: 'var(--info)' };
    if (val < 25) return { label: 'Normal', color: 'var(--primary)' };
    if (val < 30) return { label: 'Overweight', color: 'var(--warning)' };
    return { label: 'Obese', color: 'var(--danger)' };
  };
  const bmiCat = getBmiCategory(Number(bmi));

  const handleSave = (e) => {
    e.preventDefault();
    if (geminiApiKey) {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setUser(prev => {
      const updated = {
        ...prev,
        name,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        diabetesType,
        unitPreference,
        mealTimes: {
          breakfast: breakfastTime,
          lunch: lunchTime,
          dinner: dinnerTime
        },
        geminiApiKey: geminiApiKey.trim()
      };
      localStorage.setItem('glucocare_user', JSON.stringify(updated));
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Profile & Settings Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Profile Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Profile</h3>
            </div>

            {/* BMI Badge */}
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: bmiCat.color, background: 'var(--bg-card-subtle)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              BMI {bmi} • {bmiCat.label}
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label" style={{ fontSize: '0.76rem' }}>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Age (yrs)</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={e => setAge(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.88rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Weight (kg)</label>
              <input
                type="number"
                className="form-input"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.88rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.72rem' }}>Height (cm)</label>
              <input
                type="number"
                className="form-input"
                value={height}
                onChange={e => setHeight(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0, marginTop: 10 }}>
            <label className="form-label" style={{ fontSize: '0.76rem' }}>Diabetes Type</label>
            <select
              className="form-select"
              value={diabetesType}
              onChange={e => setDiabetesType(e.target.value)}
              style={{ padding: '8px 10px', fontSize: '0.88rem' }}
            >
              <option value="Type 2">Type 2 Diabetes (T2D)</option>
              <option value="Type 1">Type 1 Diabetes (T1D)</option>
              <option value="Prediabetes">Prediabetes</option>
              <option value="Gestational">Gestational Diabetes</option>
            </select>
          </div>
        </div>

        {/* Daily Meal Times Card (1-Hour Pre-Meal Food Algorithm) */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UtensilsCrossed size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Meal Eating Times</h3>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              1-Hr Pre-Meal AI
            </span>
          </div>

          <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
            Our clinical algorithm analyzes your walking steps and calorie burn <strong>1 hour before each meal</strong> to recommend foods that prevent low blood sugar crashes or sedentary glucose spikes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.70rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} color="var(--primary)" />
                <span>Breakfast</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={breakfastTime}
                onChange={e => setBreakfastTime(e.target.value)}
                style={{ padding: '8px 6px', fontSize: '0.82rem', textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                Alert at {breakfastTime ? `${String((Number(breakfastTime.split(':')[0]) - 1 + 24) % 24).padStart(2, '0')}:${breakfastTime.split(':')[1]}` : '--:--'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.70rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} color="var(--primary)" />
                <span>Lunch</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={lunchTime}
                onChange={e => setLunchTime(e.target.value)}
                style={{ padding: '8px 6px', fontSize: '0.82rem', textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                Alert at {lunchTime ? `${String((Number(lunchTime.split(':')[0]) - 1 + 24) % 24).padStart(2, '0')}:${lunchTime.split(':')[1]}` : '--:--'}
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.70rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} color="var(--primary)" />
                <span>Dinner</span>
              </label>
              <input
                type="time"
                className="form-input"
                value={dinnerTime}
                onChange={e => setDinnerTime(e.target.value)}
                style={{ padding: '8px 6px', fontSize: '0.82rem', textAlign: 'center' }}
              />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                Alert at {dinnerTime ? `${String((Number(dinnerTime.split(':')[0]) - 1 + 24) % 24).padStart(2, '0')}:${dinnerTime.split(':')[1]}` : '--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* App Preferences Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Sliders size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Preferences</h3>
          </div>

          {/* Unit Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Sugar Unit</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                mg/dL vs mmol/L
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {['mg/dL', 'mmol/L'].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnitPreference(u)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    background: unitPreference === u ? 'var(--primary)' : 'var(--bg-card-subtle)',
                    color: unitPreference === u ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Theme</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleTheme}
              style={{ padding: '5px 10px', fontSize: '0.76rem' }}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Phone Sensor Pedometer Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Mobile Step Sensor</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Built-in 3D Accelerometer Pedometer
              </div>
            </div>

            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              ● Device Sensor
            </span>
          </div>

          {/* Google Gemini Live AI Key */}
          <div style={{ padding: '10px 0 2px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.86rem', marginBottom: 2 }}>
              🤖 Google Gemini AI Key (Optional)
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              Enables live Gemini 2.5 Flash generative AI responses for any question.
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="Paste AI Studio API Key (AIzaSy...)"
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '11px 20px', flex: 1 }}>
            <Save size={16} />
            <span>Save Profile</span>
          </button>
          {savedSuccess && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
              <CheckCircle size={16} />
              Saved!
            </span>
          )}
        </div>
      </form>

      {/* 1.5. Mobile Step Sensor & Background Pedometer Settings */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-xs)',
                background: isPedometerActive ? 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)' : 'var(--bg-card-subtle)',
                color: isPedometerActive ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>Mobile Step Sensor & Background Tracking</h3>
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
                  {isWalking ? `● WALKING (${cadence} SPM)` : isPedometerActive ? '● ACTIVE' : '○ PAUSED'}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2, margin: 0 }}>
                Counts physical walking steps in real time via phone 3-axis accelerometer
              </p>
            </div>
          </div>

          <button
            type="button"
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
        </div>

        {/* Live Sensor Telemetry */}
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 5 }}>
            <span>Live Motion: <strong>{sensorValues?.magnitude || 0} m/s²</strong> (Δ {sensorValues?.dynamicDelta || 0})</span>
            <span>Today's Recorded: <strong style={{ color: 'var(--primary)' }}>{stepsData?.current?.toLocaleString() || 0} steps</strong></span>
          </div>
          <div style={{ width: '100%', height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
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

        {/* Background Pocket Tracking Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={14} color="var(--primary)" />
              <span>Background Pocket Tracking</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Uses audio keep-alive so step sensor keeps counting when screen locks or is placed in pocket
            </div>
          </div>

          <button
            type="button"
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
        <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Motion Sensitivity Preset:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'high', label: 'High (Loose Pocket / Purse)' },
              { id: 'normal', label: 'Normal (Standard Walk)' },
              { id: 'low', label: 'Low (Firm / Jogging)' }
            ].map(s => (
              <button
                type="button"
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
            type="button"
            onClick={requestSensorPermission}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.78rem', width: '100%', marginTop: 10 }}
          >
            Grant Motion Sensor Permission
          </button>
        )}
      </div>

      {/* 2. Mobile App Installation & Phone Setup */}
      <div
        className="app-card"
        style={{
          padding: '16px 18px',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800 }}>Install as Mobile App on Phone</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Progressive Web App (PWA) • Runs Fullscreen like a Native App
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: isInstalled ? 'var(--primary)' : 'var(--secondary)',
              background: 'var(--bg-card)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)'
            }}
          >
            {isInstalled ? '✓ Installed' : 'Ready to Install'}
          </span>
        </div>

        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.45 }}>
          You can install GlucoCare directly onto your Android or iPhone home screen. It will open without browser address bars, track physical steps using your phone's built-in accelerometer, and work offline!
        </p>

        {/* Install Action Button */}
        <button
          type="button"
          onClick={handleInstallClick}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '0.84rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            marginBottom: 14,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}
        >
          <Download size={16} />
          <span>{isInstalled ? 'App Already Installed' : 'Install on This Device'}</span>
        </button>

        {/* Step-by-Step Instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.72rem' }}>
          <div style={{ padding: '9px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 3 }}>
              🤖 On Android Phone (Chrome or Samsung Internet):
            </strong>
            <ol style={{ margin: '0 0 0 16px', padding: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <li>Connect your phone to the same Wi-Fi as your computer.</li>
              <li>Open Chrome and go to: <code style={{ color: 'var(--primary)', fontWeight: 800, background: 'rgba(16, 185, 129, 0.1)', padding: '1px 4px', borderRadius: 4 }}>http://10.160.253.140:3000</code></li>
              <li>Tap the <strong>3 dots (⋮)</strong> menu in the top right.</li>
              <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
            </ol>
          </div>

          <div style={{ padding: '9px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: 3 }}>
              🍎 On iPhone / iPad (Apple Safari):
            </strong>
            <ol style={{ margin: '0 0 0 16px', padding: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              <li>Connect your iPhone to the same Wi-Fi as your computer.</li>
              <li>Open Safari and go to: <code style={{ color: 'var(--secondary)', fontWeight: 800, background: 'rgba(14, 165, 233, 0.1)', padding: '1px 4px', borderRadius: 4 }}>http://10.160.253.140:3000</code></li>
              <li>Tap the <strong>Share button (⎋)</strong> at the bottom center.</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong>, then tap <strong>Add</strong>.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 3. Account & Session Management */}
      <div className="app-card" style={{ padding: '14px 16px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Account & Session</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user.name || 'Arjun Sharma'}</strong> ({user.email || 'arjun@example.com'})
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>
          Logging out returns you to the sign-in screen. All health history and offline logs remain stored on this device.
        </p>

        <button
          type="button"
          onClick={logout}
          className="btn"
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '0.84rem',
            fontWeight: 800,
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7
          }}
        >
          <LogOut size={16} />
          <span>Log Out of GlucoCare</span>
        </button>
      </div>
    </div>
  );
};
