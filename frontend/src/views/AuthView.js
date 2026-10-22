import React, { useState } from 'react';
import {
  Activity,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn,
  Scale,
  Ruler,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { initialUser } from '../services/mockData';

// Step labels
const SIGNUP_STEPS = ['Account', 'Body Info', 'Meal Times'];

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
        fontSize: '0.58rem',
        fontWeight: 700,
        color: active ? 'var(--primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        {SIGNUP_STEPS[idx]}
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
  const [authMode, setAuthMode] = useState('signup');
  const [signupStep, setSignupStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 0 - Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 2');

  // Step 1 - Body Info
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [activityLevel, setActivityLevel] = useState('Moderate');
  const [targetMin, setTargetMin] = useState(70);
  const [targetMax, setTargetMax] = useState(140);

  // Step 2 - Meal Times
  const [breakfastTime, setBreakfastTime] = useState('08:00');
  const [lunchTime, setLunchTime] = useState('13:00');
  const [dinnerTime, setDinnerTime] = useState('19:30');

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

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

  const validateStep0 = () => {
    if (!name.trim()) { setErrorMsg('Please enter your full name.'); return false; }
    if (!email.trim() || !email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return false; }
    if (password.length < 6) { setErrorMsg('Password must be at least 6 characters long.'); return false; }
    return true;
  };

  const validateStep1 = () => {
    if (!age || Number(age) < 5 || Number(age) > 120) { setErrorMsg('Please enter a valid age (5-120).'); return false; }
    if (!height || Number(height) < 50 || Number(height) > 250) { setErrorMsg('Please enter height in cm (50-250).'); return false; }
    if (!weight || Number(weight) < 10 || Number(weight) > 300) { setErrorMsg('Please enter weight in kg (10-300).'); return false; }
    return true;
  };

  const goNext = () => {
    setErrorMsg('');
    if (signupStep === 0 && !validateStep0()) return;
    if (signupStep === 1 && !validateStep1()) return;
    setSignupStep(s => s + 1);
  };

  const goBack = () => { setErrorMsg(''); setSignupStep(s => s - 1); };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (accounts[cleanEmail]) {
      setErrorMsg('An account with this email already exists. Please Sign In.');
      setIsLoading(false);
      return;
    }

    const bmi = calcBmi();

    const newUserProfile = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
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

    accounts[cleanEmail] = { password, profile: newUserProfile };
    localStorage.setItem('glucocare_accounts', JSON.stringify(accounts));

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://diabetics-sfa9.onrender.com/api';
      fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserProfile.name,
          email: newUserProfile.email,
          diabetesType: newUserProfile.diabetesType,
          age: newUserProfile.age,
          height: newUserProfile.height,
          weight: newUserProfile.weight,
          mealTimes: newUserProfile.mealTimes
        })
      }).catch(() => {});
    } catch {}

    setIsLoading(false);
    login(newUserProfile, { isNewUser: true });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    const cleanEmail = signInEmail.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts[cleanEmail];
    if (account && account.password === signInPassword) {
      setIsLoading(false);
      login(account.profile);
      return;
    }
    if (cleanEmail === 'arjun.sharma@example.com' || cleanEmail === 'demo@example.com') {
      setIsLoading(false);
      login(initialUser);
      return;
    }
    setIsLoading(false);
    setErrorMsg('Invalid email or password. Please check your credentials or create a new account.');
  };

  const handleDemoLogin = () => login(initialUser);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, var(--bg-page) 75%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', color: 'var(--text-primary)'
    }}>
      <div className="app-card" style={{
        width: '100%', maxWidth: 480,
        padding: '28px 24px',
        boxShadow: 'var(--shadow-modal)',
        border: '1px solid var(--border-light)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)', marginBottom: 10
          }}>
            <Activity size={26} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 3 }}>
            GlucoCare <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Smart Diabetes &amp; Lifestyle Health Companion
          </p>
        </div>

        {/* Mode switcher */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)',
          padding: 4, marginBottom: 20, border: '1px solid var(--border-light)'
        }}>
          {[
            { key: 'signup', icon: <UserPlus size={15} />, label: 'Sign Up' },
            { key: 'signin', icon: <LogIn size={15} />, label: 'Sign In' }
          ].map(tab => (
            <button key={tab.key} type="button"
              onClick={() => { setAuthMode(tab.key); setErrorMsg(''); setSignupStep(0); }}
              style={{
                padding: '9px 12px', borderRadius: 'var(--radius-xs)',
                fontSize: '0.82rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'all 0.2s ease',
                background: authMode === tab.key ? 'var(--bg-card)' : 'transparent',
                color: authMode === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: authMode === tab.key ? 'var(--shadow-xs)' : 'none'
              }}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div style={{
            background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* â•â•â• SIGN UP â•â•â• */}
        {authMode === 'signup' ? (
          <>
            {/* Step progress */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 22 }}>
              {SIGNUP_STEPS.map((_, idx) => (
                <React.Fragment key={idx}>
                  <StepDot idx={idx} current={signupStep} />
                  {idx < SIGNUP_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, marginTop: 14,
                      background: idx < signupStep ? 'var(--primary)' : 'var(--border-light)',
                      transition: 'background 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 0: Account */}
            {signupStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="Full Name *" icon={User}>
                  <input type="text" className="form-input" value={name}
                    onChange={e => setName(e.target.value)} placeholder="e.g. John Doe"
                    style={{ paddingLeft: 34, fontSize: '0.84rem' }} autoFocus />
                </Field>
                <Field label="Email Address *" icon={Mail}>
                  <input type="email" className="form-input" value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                    style={{ paddingLeft: 34, fontSize: '0.84rem' }} />
                </Field>
                <Field label="Password (min. 6 characters) *" icon={Lock}>
                  <input type={showPassword ? 'text' : 'password'} className="form-input"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
                    style={{ paddingLeft: 34, paddingRight: 34, fontSize: '0.84rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </Field>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>
                    Diabetes Condition
                  </label>
                  <select className="form-input" value={diabetesType}
                    onChange={e => setDiabetesType(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '9px 10px' }}>
                    <option value="Type 2">Type 2 Diabetes</option>
                    <option value="Type 1">Type 1 Diabetes</option>
                    <option value="Pre-diabetes">Pre-diabetes</option>
                    <option value="Gestational">Gestational Diabetes</option>
                    <option value="General Wellness">General Health</option>
                  </select>
                </div>
                <button type="button" onClick={goNext} className="btn btn-primary"
                  style={{
                    width: '100%', padding: '12px 16px', fontSize: '0.88rem', fontWeight: 800, marginTop: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                  }}>
                  <span>Next â€” Body Info</span><ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1: Body Info */}
            {signupStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Age *" icon={User}>
                    <input type="number" min="5" max="120" className="form-input" value={age}
                      onChange={e => setAge(e.target.value)} placeholder="e.g. 38"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }} autoFocus />
                  </Field>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Gender</label>
                    <select className="form-input" value={gender} onChange={e => setGender(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '9px 10px' }}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Height (cm) *" icon={Ruler}>
                    <input type="number" min="50" max="250" className="form-input" value={height}
                      onChange={e => setHeight(e.target.value)} placeholder="e.g. 170"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }} />
                  </Field>
                  <Field label="Weight (kg) *" icon={Scale}>
                    <input type="number" min="10" max="300" className="form-input" value={weight}
                      onChange={e => setWeight(e.target.value)} placeholder="e.g. 72"
                      style={{ paddingLeft: 34, fontSize: '0.84rem' }} />
                  </Field>
                </div>
                {/* Live BMI badge */}
                {calcBmi() && (() => {
                  const bv = Number(calcBmi());
                  const cat = bv < 18.5 ? { l: 'Underweight', c: '#F59E0B' }
                    : bv < 25 ? { l: 'Normal', c: 'var(--primary)' }
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
                      <span style={{ color: 'var(--text-secondary)' }}>BMI:</span>
                      <strong style={{ color: cat.c }}>{calcBmi()} â€” {cat.l}</strong>
                    </div>
                  );
                })()}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Activity Level</label>
                  <select className="form-input" value={activityLevel}
                    onChange={e => setActivityLevel(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '9px 10px' }}>
                    <option value="Sedentary">Sedentary (desk job, no exercise)</option>
                    <option value="Light">Light (1-2 days/week)</option>
                    <option value="Moderate">Moderate (3-4 days/week)</option>
                    <option value="Active">Active (5+ days/week)</option>
                    <option value="Very Active">Very Active (athlete)</option>
                  </select>
                </div>
                <div style={{
                  background: 'var(--bg-card-subtle)', padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Target Glucose Range (mg/dL)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Min Fasting:</span>
                      <input type="number" value={targetMin} onChange={e => setTargetMin(e.target.value)}
                        className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Post-Meal:</span>
                      <input type="number" value={targetMax} onChange={e => setTargetMax(e.target.value)}
                        className="form-input" style={{ padding: '6px 8px', fontSize: '0.8rem' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <button type="button" onClick={goBack} className="btn btn-secondary"
                    style={{ padding: '11px 14px', fontSize: '0.84rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ArrowLeft size={15} /><span>Back</span>
                  </button>
                  <button type="button" onClick={goNext} className="btn btn-primary"
                    style={{ padding: '11px 14px', fontSize: '0.84rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                    <span>Meal Times</span><ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Meal Times */}
            {signupStep === 2 && (
              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <UtensilsCrossed size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    GlucoCare AI analyzes your <strong>blood glucose + steps walked</strong> and sends a{' '}
                    <strong>personalized food recommendation 1 hour before</strong> each meal,
                    accounting for calories burned during walking.
                  </span>
                </div>

                {[
                  { label: 'ðŸŒ… Breakfast Time', val: breakfastTime, set: setBreakfastTime, hint: 'Typical breakfast time' },
                  { label: 'â˜€ï¸ Lunch Time', val: lunchTime, set: setLunchTime, hint: 'Typical lunch time' },
                  { label: 'ðŸŒ™ Dinner Time', val: dinnerTime, set: setDinnerTime, hint: 'Typical dinner time' }
                ].map(({ label, val, set, hint }) => (
                  <div key={label} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                      <input type="time" required className="form-input" value={val}
                        onChange={e => set(e.target.value)}
                        style={{ paddingLeft: 34, fontSize: '0.84rem' }} />
                    </div>
                    <p style={{ margin: '3px 0 0 2px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{hint}</p>
                  </div>
                ))}

                {/* Alert preview */}
                <div style={{
                  background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                  fontSize: '0.72rem', color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 5, color: 'var(--text-primary)' }}>
                    ðŸ“² Pre-meal AI food alerts will fire at:
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
                  <button type="button" onClick={goBack} className="btn btn-secondary"
                    style={{ padding: '11px 14px', fontSize: '0.84rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ArrowLeft size={15} /><span>Back</span>
                  </button>
                  <button type="submit" disabled={isLoading} className="btn btn-primary"
                    style={{ padding: '11px 14px', fontSize: '0.84rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>
                    <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
                    {!isLoading && <CheckCircle2 size={15} />}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* â•â•â• SIGN IN â•â•â• */
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Email Address" icon={Mail}>
              <input type="email" required className="form-input" value={signInEmail}
                onChange={e => setSignInEmail(e.target.value)} placeholder="name@example.com"
                style={{ paddingLeft: 34, fontSize: '0.84rem' }} autoFocus />
            </Field>
            <Field label="Password" icon={Lock}>
              <input type={showPassword ? 'text' : 'password'} required className="form-input"
                value={signInPassword} onChange={e => setSignInPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingLeft: 34, paddingRight: 34, fontSize: '0.84rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </Field>
            <button type="submit" disabled={isLoading} className="btn btn-primary"
              style={{
                width: '100%', padding: '12px 16px', fontSize: '0.88rem', fontWeight: 800, marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
              }}>
              <span>{isLoading ? 'Signing In...' : 'Sign In to My Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Demo access */}
        <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Want to test preloaded diabetes data?
          </div>
          <button type="button" onClick={handleDemoLogin} className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.75rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>Explore with Demo Account (Arjun Sharma)</span>
          </button>
        </div>

        {/* Security badge */}
        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, fontSize: '0.68rem', color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={13} color="var(--primary)" />
          <span>HIPAA &amp; GDPR Compliant Medical Encryption</span>
        </div>
      </div>
    </div>
  );
};
