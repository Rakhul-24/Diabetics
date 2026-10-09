import React, { useState } from 'react';
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  Watch,
  Heart,
  Moon,
  Footprints,
  Flame,
  ShieldCheck,
  Info,
  Check,
  Mail,
  X,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const GoogleFitView = () => {
  const {
    user,
    stepsData,
    sleepData,
    syncGoogleFitData,
    googleFitConnected,
    setGoogleFitConnected,
    lastGoogleFitSync
  } = useHealth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [selectedWatch, setSelectedWatch] = useState('Galaxy Watch 6 Classic');

  // Google Account Connect Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState(
    localStorage.getItem('google_fit_email') || (user?.email ? user.email : '')
  );
  const [emailError, setEmailError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const currentConnectedEmail = localStorage.getItem('google_fit_email') || '';

  const watchModels = [
    { id: 'gw6', name: 'Samsung Galaxy Watch 6 / 5', brand: 'Samsung Health via Health Connect', battery: 84 },
    { id: 'pw2', name: 'Google Pixel Watch 2 / 1', brand: 'Fitbit & Google Fit Native', battery: 91 },
    { id: 'fitbit', name: 'Fitbit Charge 6 / Sense 2', brand: 'Fitbit to Google Fit Cloud', battery: 76 },
    { id: 'apple', name: 'Apple Watch Series 9 / Ultra', brand: 'Apple Health via Health Connect', battery: 88 },
    { id: 'garmin', name: 'Garmin Venu 3 / Forerunner', brand: 'Garmin Connect to Google Fit', battery: 95 },
    { id: 'amazfit', name: 'Amazfit & Xiaomi Mi Band', brand: 'Zepp Life / Mi Fitness Sync', battery: 82 }
  ];

  const handleOpenAuthModal = () => {
    setEmailError('');
    setIsAuthModalOpen(true);
  };

  const handleAuthorizeGoogleAccount = (e) => {
    e?.preventDefault();
    const cleanEmail = inputEmail.trim().toLowerCase();
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setEmailError('Please enter a valid Google / Gmail address (e.g. name@gmail.com)');
      return;
    }

    setIsAuthenticating(true);
    setEmailError('');

    setTimeout(() => {
      localStorage.setItem('google_fit_email', cleanEmail);
      localStorage.setItem('google_fit_connected', 'true');
      setGoogleFitConnected(true);
      setIsAuthenticating(false);
      setIsAuthModalOpen(false);

      setSyncFeedback(`Successfully linked Google Fit for ${cleanEmail}!`);
      setTimeout(() => setSyncFeedback(null), 4000);

      if (syncGoogleFitData) {
        syncGoogleFitData();
      }
    }, 1200);
  };

  const handleDisconnect = () => {
    setGoogleFitConnected(false);
    localStorage.removeItem('google_fit_connected');
    localStorage.removeItem('google_fit_email');
    setInputEmail('');
    setSyncFeedback('Disconnected from Google Fit');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      if (syncGoogleFitData) {
        syncGoogleFitData();
      }
      setIsSyncing(false);
      setSyncFeedback('Latest Smartwatch data synced via Google Fit!');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 1200);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Google Fit Hero Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.12) 0%, rgba(52, 168, 83, 0.1) 50%, rgba(234, 67, 53, 0.08) 100%)',
          border: '1.5px solid rgba(66, 133, 244, 0.35)',
          padding: '16px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-sm)',
                background: '#ffffff',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {/* Google Fit Quad-Color Heart Icon */}
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                <path fill="#34A853" d="M12 6.5C10.5 4.5 8 3.5 6 4.5c-2 1-3 3.5-2 6l8 10 3-3.5L12 6.5z" opacity="0.8" />
                <path fill="#4285F4" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 7 2.5 5.5 3.5 4.5L12 14l8.5-9.5c1 1 1.5 2.5 1.5 4 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0.6" />
                <path fill="#FBBC05" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09L15 11l5-5c-.9-1.9-2.5-3-3.5-3z" />
              </svg>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Google Fit & Smartwatch</h3>
                {googleFitConnected && currentConnectedEmail && (
                  <span
                    style={{
                      background: 'rgba(52, 168, 83, 0.15)',
                      color: '#16a34a',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(52, 168, 83, 0.3)'
                    }}
                  >
                    ● CONNECTED
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {googleFitConnected && currentConnectedEmail
                  ? `Linked: ${currentConnectedEmail} • ${lastGoogleFitSync}`
                  : 'Connect your personal Google Account to sync steps, heart rate & sleep from your watch'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {googleFitConnected && currentConnectedEmail ? (
              <>
                <button
                  className="btn btn-primary"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  style={{
                    background: '#4285F4',
                    boxShadow: '0 3px 12px rgba(66, 133, 244, 0.35)',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'spin-anim' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={handleOpenAuthModal}
                  className="btn btn-secondary"
                  style={{ padding: '8px 10px', fontSize: '0.76rem' }}
                  title="Switch Google Account"
                >
                  Switch Account
                </button>
                <button
                  onClick={handleDisconnect}
                  className="btn btn-secondary"
                  style={{ padding: '8px 10px', fontSize: '0.76rem', color: 'var(--danger)' }}
                  title="Disconnect Google Fit"
                >
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleOpenAuthModal}
                style={{
                  background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                  boxShadow: '0 4px 14px rgba(66, 133, 244, 0.4)',
                  padding: '9px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 700
                }}
              >
                <Mail size={15} />
                <span>Choose Google Account</span>
              </button>
            )}
          </div>
        </div>

        {syncFeedback && (
          <div
            style={{
              marginTop: 12,
              padding: '7px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(52, 168, 83, 0.15)',
              border: '1px solid rgba(52, 168, 83, 0.3)',
              color: '#15803d',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <CheckCircle2 size={14} />
            <span>{syncFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. Synced Smartwatch Health Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {/* Steps Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Footprints size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>STEPS</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>Google Fit</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {(stepsData?.current || 6420).toLocaleString()}{' '}
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>/ {stepsData?.goal || 8000}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {stepsData?.distanceKm || 4.5} km • {stepsData?.caloriesBurned || 280} kcal
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.round(((stepsData?.current || 6420) / (stepsData?.goal || 8000)) * 100))}%`,
                height: '100%',
                background: 'var(--primary-gradient)'
              }}
            />
          </div>
        </div>

        {/* Heart Rate Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Heart size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>PULSE</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700 }}>Live Watch</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            72 <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>bpm</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Resting: 64 bpm • Max: 118 bpm
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'var(--danger)' }} />
          </div>
        </div>

        {/* Sleep Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(139, 92, 246, 0.12)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Moon size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>SLEEP</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', fontWeight: 700 }}>Auto-Tracked</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            {sleepData?.lastNightDurationHours || 7.2} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>hrs</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Score: {sleepData?.qualityScore || 84}/100 • Deep: {sleepData?.deepSleepHours || 1.8}h
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: '84%', height: '100%', background: 'var(--accent-purple)' }} />
          </div>
        </div>

        {/* Active Calories Card */}
        <div className="app-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Flame size={16} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>ENERGY</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--warning)', fontWeight: 700 }}>Google Fit</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            420 <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Active Walk: 35 mins • Moderate
          </div>
          <div style={{ width: '100%', height: 4, background: 'var(--border-light)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: 'var(--warning)' }} />
          </div>
        </div>
      </div>

      {/* 3. Paired Smartwatch Brand Selector */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Watch size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800 }}>Smartwatch Ecosystem</h3>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Auto-syncs via Health Connect
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {watchModels.map(watch => {
            const isSelected = selectedWatch === watch.name;
            return (
              <div
                key={watch.id}
                onClick={() => setSelectedWatch(watch.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-xs)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Watch size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {watch.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {watch.brand} • 🔋 {watch.battery}%
                    </div>
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}
                    >
                      <Check size={12} />
                      <span>Active Watch</span>
                    </span>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Google Fit Permissions & Sync Configuration */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldCheck size={18} color="#16a34a" />
          <h3 style={{ fontSize: '0.94rem', fontWeight: 800 }}>Granted Google Fit Scopes</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { scope: 'fitness.activity.read', desc: 'Steps, Walking Distance & Active Calories', icon: Footprints },
            { scope: 'fitness.body.read', desc: 'Heart Rate, Resting Pulse & Weight Vitals', icon: Heart },
            { scope: 'fitness.sleep.read', desc: 'Sleep Stages (Deep, REM, Light Rest)', icon: Moon },
            { scope: 'fitness.blood_glucose.read', desc: 'Blood Sugar Readings from Connected CGMs', icon: Activity }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.76rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={14} color="var(--primary)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.desc}</span>
                </div>
                <span style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <CheckCircle2 size={13} />
                  Granted
                </span>
              </div>
            );
          })}
        </div>

        {/* Auto Sync Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Continuous Background Sync</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Automatically fetch smartwatch steps & vitals every 15 minutes
            </div>
          </div>

          <button
            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: autoSyncEnabled ? 'var(--primary)' : 'var(--border-light)',
              position: 'relative',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: autoSyncEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: 'var(--shadow-xs)'
              }}
            />
          </button>
        </div>
      </div>

      {/* 5. How It Works Note */}
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
        <Info size={18} color="var(--secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--text-primary)' }}>How Smartwatch Sync Works:</strong> Your smartwatch automatically sends steps, workouts, and sleep to its companion app (Samsung Health, Fitbit, Apple Health, Garmin, Zepp), which writes directly to <strong>Google Fit / Android Health Connect</strong>. GlucoCare AI reads this data seamlessly in the background without needing battery-draining direct Bluetooth connections!
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. GOOGLE ACCOUNT SIGN-IN / AUTHORIZE MODAL */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 440, padding: '20px 22px' }}
          >
            <div className="modal-handle" />

            {/* Modal Header with Google Branding */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Connect Google Account</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Authorize GlucoCare to read Google Fit vitals
                  </p>
                </div>
              </div>

              <button
                className="icon-btn"
                onClick={() => setIsAuthModalOpen(false)}
                style={{ width: 30, height: 30 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAuthorizeGoogleAccount} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email Input Field */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                  Enter your Google / Gmail Address:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="e.g. yourname@gmail.com"
                    value={inputEmail}
                    onChange={e => {
                      setInputEmail(e.target.value);
                      setEmailError('');
                    }}
                    style={{
                      padding: '10px 14px 10px 38px',
                      fontSize: '0.88rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    autoFocus
                  />
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                {emailError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>
                    {emailError}
                  </div>
                )}
              </div>

              {/* Account Quick Suggestions (if user profile has an email) */}
              {user?.email && user.email !== inputEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Or use profile email:</span>
                  <button
                    type="button"
                    onClick={() => setInputEmail(user.email)}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      background: 'var(--primary-light)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer'
                    }}
                  >
                    {user.email}
                  </button>
                </div>
              )}

              {/* Requested Permissions Info */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  GLUCOCARE WILL REQUEST READ-ONLY ACCESS TO:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#16a34a" />
                    <span>Daily Steps & Walking Distance from Smartwatch</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#16a34a" />
                    <span>Continuous & Resting Heart Rate (BPM)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#16a34a" />
                    <span>Sleep Stages & Recovery Metrics</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating || !inputEmail.trim()}
                  className="btn btn-primary"
                  style={{
                    flex: 2,
                    padding: '10px',
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                    boxShadow: '0 3px 12px rgba(66, 133, 244, 0.35)'
                  }}
                >
                  {isAuthenticating ? (
                    <>
                      <RefreshCw size={15} className="spin-anim" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} />
                      <span>Authorize & Connect</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
