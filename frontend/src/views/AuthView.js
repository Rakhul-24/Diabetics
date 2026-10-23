import React, { useState } from 'react';
import {
  Activity,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Scale,
  Ruler,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  Heart,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { initialUser } from '../services/mockData';
import { apiService } from '../services/api';
import { auth, googleProvider, signInWithPopup } from '../config/firebase';

// Official Multi-Colored Google SVG Icon
const GoogleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      fill="#EA4335"
    />
  </svg>
);

// Onboarding Step Indicator
const ONBOARDING_STEPS = ['Health & Body', 'Meal Schedule'];

const StepDot = ({ idx, current }) => {
  const done = idx < current;
  const active = idx === current;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.78rem',
          transition: 'all 0.3s ease',
          background: done ? 'var(--primary)' : active ? 'var(--primary-gradient)' : 'var(--bg-card-subtle)',
          color: done || active ? '#fff' : 'var(--text-muted)',
          border: active ? '2px solid var(--primary)' : done ? 'none' : '2px solid var(--border-light)',
          boxShadow: active ? '0 0 0 4px rgba(16,185,129,0.18)' : 'none'
        }}
      >
        {done ? <CheckCircle2 size={15} /> : idx + 1}
      </div>
      <span style={{
        fontSize: '0.6rem',
        fontWeight: 700,
        color: active ? 'var(--primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        {ONBOARDING_STEPS[idx]}
      </span>
    </div>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)', zIndex: 1 }} />}
      {children}
    </div>
  </div>
);

export const AuthView = () => {
  const { login } = useHealth();

  // State: Google user awaiting clinical onboarding
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Body Info fields
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [targetMin, setTargetMin] = useState(70);
  const [targetMax, setTargetMax] = useState(140);

  // Step 2: Meal Times fields
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('13:00');
  const [dinnerTime, setDinnerTime] = useState('19:30');

  const getStoredAccounts = () => {
    try {
      const saved = localStorage.getItem('glucocare_accounts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const calcBmi = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0) return null;
    return (w / (h * h)).toFixed(1);
  };

  // Process authenticated Google profile
  const handleGoogleSuccess = (googleUser, idToken = null) => {
    setErrorMsg('');
    setIsLoading(true);

    const cleanEmail = googleUser.email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const existingAccount = accounts[cleanEmail];

    // Check if this Google user already has an existing completed profile
    if (existingAccount && existingAccount.profile) {
      setIsLoading(false);
      apiService.googleLogin({ idToken, profile: existingAccount.profile }).catch(() => {});
      login(existingAccount.profile, { isNewUser: false });
      return;
    }

    // Check if it's the demo account
    if (cleanEmail === 'arjun.sharma@example.com' || cleanEmail === 'arjun.sharma@gmail.com') {
      setIsLoading(false);
      login(initialUser, { isNewUser: false });
      return;
    }

    // New Google user: transition to clinical onboarding
    setIsLoading(false);
    setPendingGoogleUser({
      ...googleUser,
      email: cleanEmail,
      idToken
    });
    setOnboardingStep(0);
  };

  // Primary: Trigger real Firebase Google Auth popup window
  const handleGoogleSignInPopup = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Real Google Sign-in popup via Firebase Auth GoogleAuthProvider
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken().catch(() => null);

      const googleProfile = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
        email: firebaseUser.email?.toLowerCase(),
        picture: firebaseUser.photoURL || '',
        sub: firebaseUser.uid
      };

      handleGoogleSuccess(googleProfile, idToken);
    } catch (err) {
      setIsLoading(false);
      console.warn('Firebase signInWithPopup notice:', err.code, err.message);

      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In popup was closed. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else if (
        err.code === 'auth/api-key-not-valid' ||
        err.code === 'auth/invalid-api-key' ||
        err.message?.includes('api-key') ||
        err.message?.includes('API key')
      ) {
        setErrorMsg(
          'Firebase API key not yet set in frontend/.env. Set REACT_APP_FIREBASE_API_KEY from Firebase Console, or test with the Demo Account below.'
        );
      } else {
        setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
      }
    }
  };

  // Quick 1-click Demo Account login
  const handleDemoLogin = () => {
    handleGoogleSuccess({
      name: 'Arjun Sharma',
      email: 'arjun.sharma@gmail.com',
      picture: '',
      sub: 'demo_arjun_sharma'
    });
  };

  // Validate Step 0 of onboarding
  const validateStep0 = () => {
    if (!age || Number(age) < 5 || Number(age) > 120) { setErrorMsg('Please enter a valid age (5-120).'); return false; }
    if (!height || Number(height) < 50 || Number(height) > 250) { setErrorMsg('Please enter height in cm (50-250).'); return false; }
    if (!weight || Number(weight) < 10 || Number(weight) > 300) { setErrorMsg('Please enter weight in kg (10-300).'); return false; }
    return true;
  };

  const handleNextOnboarding = () => {
    setErrorMsg('');
    if (onboardingStep === 0 && !validateStep0()) return;
    setOnboardingStep(s => s + 1);
  };

  const handleBackOnboarding = () => {
    setErrorMsg('');
    setOnboardingStep(s => s - 1);
  };

  // Complete Google Account Profile Setup
  const handleCompleteGoogleOnboarding = async (e) => {
    e.preventDefault();
    if (!pendingGoogleUser) return;
    setErrorMsg('');
    setIsLoading(true);

    const bmi = calcBmi();
    const cleanEmail = pendingGoogleUser.email.trim().toLowerCase();

    const newUserProfile = {
      id: pendingGoogleUser.sub ? `g_${pendingGoogleUser.sub}` : `u_${Date.now()}`,
      name: pendingGoogleUser.name,
      email: cleanEmail,
      profileImageUrl: pendingGoogleUser.picture || '',
      authProvider: 'google',
      diabetesType,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      bmi: bmi ? Number(bmi) : null,
      activityLevel,
      targetGlucoseMin: Number(targetMin) || 70,
      targetGlucoseMax: Number(targetMax) || 140,
      unitPreference: 'mg/dL',
      medicalHistory: [`Diagnosed with ${diabetesType}`],
      allergies: [],
      foodPreferences: ['Low-GI', 'Balanced Carbs'],
      emergencyContactName: '',
      emergencyContactPhone: '',
      doctorName: '',
      doctorPhone: '',
      ambulancePhone: '108',
      doctorHospital: '',
      mealTimes: {
        breakfast: breakfastTime,
        lunch: lunchTime,
        dinner: dinnerTime
      },
      createdAt: new Date().toISOString()
    };

    // Store in local accounts
    const accounts = getStoredAccounts();
    accounts[cleanEmail] = { authProvider: 'google', profile: newUserProfile };
    localStorage.setItem('glucocare_accounts', JSON.stringify(accounts));

    // Sync with backend
    apiService.googleLogin({
      idToken: pendingGoogleUser.idToken,
      profile: newUserProfile
    }).catch(() => {});

    setIsLoading(false);
    login(newUserProfile, { isNewUser: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, var(--bg-page) 75%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', color: 'var(--text-primary)'
    }}>
      <div className="app-card" style={{
        width: '100%', maxWidth: 460,
        padding: '32px 26px',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--border-light)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px rgba(16, 185, 129, 0.35)', marginBottom: 12
          }}>
            <Activity size={30} />
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
            GlucoCare <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Smart Diabetes &amp; Lifestyle Health Companion
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger)', padding: '11px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem', fontWeight: 600, lineHeight: 1.4,
            display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 18
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ═══ VIEW 1: GOOGLE SIGN IN OPTION ═══ */}
        {!pendingGoogleUser ? (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20
            }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
                Sign in with your Google account to access your blood glucose logs, personalized low-GI meal recommendations, and AI health coaching.
              </p>

              {/* Real Google Sign In Button (Firebase signInWithPopup) */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignInPopup}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '30px',
                  background: '#FFFFFF',
                  color: '#1F2937',
                  border: '1.5px solid #E5E7EB',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                  cursor: isLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow = '0 5px 16px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <GoogleIcon size={22} />
                <span>{isLoading ? 'Opening Google Sign-In...' : 'Sign In with Google'}</span>
              </button>
            </div>

            {/* Demo Option */}
            <div style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border-light)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Or explore without signing in:
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="btn btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: '20px'
                }}
              >
                <Sparkles size={14} color="#F59E0B" />
                <span>Test Demo Account (Arjun Sharma)</span>
              </button>
            </div>
          </div>
        ) : (
          /* ═══ VIEW 2: NEW GOOGLE USER CLINICAL ONBOARDING ═══ */
          <div>
            {/* Authenticated Account Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(66, 133, 244, 0.08)',
              border: '1px solid rgba(66, 133, 244, 0.25)',
              marginBottom: 18
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {pendingGoogleUser.picture ? (
                  <img src={pendingGoogleUser.picture} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                ) : (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: '#4285F4', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem'
                  }}>
                    {pendingGoogleUser.name?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{pendingGoogleUser.name}</span>
                    <CheckCircle2 size={13} color="#10B981" />
                  </div>
                  <div style={{ fontSize: '0.71rem', color: 'var(--text-secondary)' }}>{pendingGoogleUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingGoogleUser(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Change
              </button>
            </div>

            {/* Step progress */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 20 }}>
              {ONBOARDING_STEPS.map((_, idx) => (
                <React.Fragment key={idx}>
                  <StepDot idx={idx} current={onboardingStep} />
                  {idx < ONBOARDING_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, marginTop: 14,
                      background: idx < onboardingStep ? 'var(--primary)' : 'var(--border-light)',
                      transition: 'background 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 0: Health & Body Metrics */}
            {onboardingStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>
                    Diabetes Condition *
                  </label>
                  <select
                    className="form-input"
                    value={diabetesType}
                    onChange={e => setDiabetesType(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '9px 10px' }}
                  >
                    <option value="Type 2">Type 2 Diabetes</option>
                    <option value="Type 1">Type 1 Diabetes</option>
                    <option value="Pre-diabetes">Pre-diabetes</option>
                    <option value="Gestational">Gestational Diabetes</option>
                    <option value="General Wellness">General Wellness / Prevention</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Age *" icon={User}>
                    <input
                      type="number" min="5" max="120" className="form-input" value={age}
                      onChange={e => setAge(e.target.value)} placeholder="e.g. 42"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }} autoFocus
                    />
                  </Field>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Gender</label>
                    <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '9px 10px' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Height (cm) *" icon={Ruler}>
                    <input
                      type="number" min="50" max="250" className="form-input" value={height}
                      onChange={e => setHeight(e.target.value)} placeholder="e.g. 175"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                    />
                  </Field>
                  <Field label="Weight (kg) *" icon={Scale}>
                    <input
                      type="number" min="10" max="300" className="form-input" value={weight}
                      onChange={e => setWeight(e.target.value)} placeholder="e.g. 78"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                    />
                  </Field>
                </div>

                {/* Live BMI */}
                {calcBmi() && (() => {
                  const bv = Number(calcBmi());
                  const cat = bv < 18.5 ? { l: 'Underweight', c: '#F59E0B' }
                    : bv < 25 ? { l: 'Normal Weight', c: 'var(--primary)' }
                    : bv < 30 ? { l: 'Overweight', c: '#F59E0B' }
                    : { l: 'Obese', c: 'var(--danger)' };
                  return (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)',
                      fontSize: '0.78rem'
                    }}>
                      <Heart size={14} color={cat.c} />
                      <span style={{ color: 'var(--text-secondary)' }}>Calculated BMI:</span>
                      <strong style={{ color: cat.c }}>{calcBmi()} — {cat.l}</strong>
                    </div>
                  );
                })()}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Activity Level</label>
                  <select
                    className="form-input" value={activityLevel}
                    onChange={e => setActivityLevel(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '9px 10px' }}
                  >
                    <option value="Sedentary">Sedentary (desk job, low movement)</option>
                    <option value="Light">Light (1-2 active days/week)</option>
                    <option value="Moderate">Moderate (3-4 workouts/week)</option>
                    <option value="Active">Active (5+ workouts/week)</option>
                    <option value="Very Active">Very Active (athlete)</option>
                  </select>
                </div>

                {/* Target Glucose Range */}
                <div style={{
                  background: 'var(--bg-card-subtle)', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Target Blood Glucose Range (mg/dL)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Min Fasting:</span>
                      <input
                        type="number" value={targetMin} onChange={e => setTargetMin(e.target.value)}
                        className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Post-Meal:</span>
                      <input
                        type="number" value={targetMax} onChange={e => setTargetMax(e.target.value)}
                        className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextOnboarding}
                  className="btn btn-primary"
                  style={{
                    width: '100%', padding: '12px 16px', fontSize: '0.88rem', fontWeight: 800, marginTop: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                  }}
                >
                  <span>Next: Meal Times</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1: Meal Times */}
            {onboardingStep === 1 && (
              <form onSubmit={handleCompleteGoogleOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <UtensilsCrossed size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    GlucoCare AI continuously tracks your <strong>steps &amp; glucose</strong> and recommends meals{' '}
                    <strong>1 hour before</strong> each eating time, personalized for your <strong>{diabetesType}</strong>.
                  </span>
                </div>

                {[
                  { label: '🌅 Breakfast Time', val: breakfastTime, set: setBreakfastTime, hint: 'Typical morning breakfast' },
                  { label: '☀️ Lunch Time', val: lunchTime, set: setLunchTime, hint: 'Typical afternoon lunch' },
                  { label: '🌙 Dinner Time', val: dinnerTime, set: setDinnerTime, hint: 'Typical evening dinner' }
                ].map(({ label, val, set, hint }) => (
                  <div key={label} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                      <input
                        type="time" required className="form-input" value={val}
                        onChange={e => set(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                      />
                    </div>
                    <p style={{ margin: '3px 0 0 2px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{hint}</p>
                  </div>
                ))}

                {/* Pre-meal 1-hour schedule preview */}
                <div style={{
                  background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                  fontSize: '0.72rem', color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--text-primary)' }}>
                    📲 AI Pre-Meal Food Alerts will fire at:
                  </div>
                  {[
                    { meal: 'Breakfast', time: breakfastTime },
                    { meal: 'Lunch', time: lunchTime },
                    { meal: 'Dinner', time: dinnerTime }
                  ].map(({ meal, time }) => {
                    const [h, m] = time.split(':').map(Number);
                    const totalMin = h * 60 + m - 60;
                    const nh = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60);
                    const nm = ((totalMin % 60) + 60) % 60;
                    const fmt = `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
                    return (
                      <div key={meal} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{meal}</span>
                        <strong style={{ color: 'var(--primary)' }}>{fmt} (1 hr before {time})</strong>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleBackOnboarding}
                    className="btn btn-secondary"
                    style={{
                      padding: '11px 14px', fontSize: '0.84rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{
                      padding: '11px 14px', fontSize: '0.84rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                    }}
                  >
                    <span>{isLoading ? 'Setting Up...' : 'Launch Dashboard'}</span>
                    {!isLoading && <CheckCircle2 size={15} />}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security & HIPAA Compliance Badge */}
        <div style={{
          marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, fontSize: '0.68rem', color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} color="var(--primary)" />
          <span>Secured with Firebase Google Authentication</span>
        </div>
      </div>
    </div>
  );
};
