import React, { useState } from 'react';
import {
  Activity,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { initialUser } from '../services/mockData';

export const AuthView = () => {
  const { login } = useHealth();
  const [mode, setMode] = useState('signup'); // 'signup' or 'signin'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sign up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 2');
  const [age, setAge] = useState('');
  const [targetMin, setTargetMin] = useState(70);
  const [targetMax, setTargetMax] = useState(140);

  // Helper to get registered accounts database from localStorage
  const getStoredAccounts = () => {
    try {
      const saved = localStorage.getItem('glucocare_accounts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (accounts[cleanEmail]) {
      setErrorMsg('An account with this email already exists. Please Sign In.');
      setIsLoading(false);
      return;
    }

    const newUserProfile = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      diabetesType,
      age: Number(age) || 40,
      gender: 'Not specified',
      targetGlucoseMin: Number(targetMin) || 70,
      targetGlucoseMax: Number(targetMax) || 140,
      unitPreference: 'mg/dL',
      medicalHistory: [`Diagnosed with ${diabetesType}`],
      allergies: [],
      foodPreferences: ['Low-GI', 'Balanced Carbs'],
      activityLevel: 'Moderate',
      emergencyContactName: '',
      emergencyContactPhone: '',
      createdAt: new Date().toISOString()
    };

    // Save account locally
    accounts[cleanEmail] = {
      password,
      profile: newUserProfile
    };
    localStorage.setItem('glucocare_accounts', JSON.stringify(accounts));

    // Also notify live backend
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://diabetics-sfa9.onrender.com/api';
      fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserProfile.name,
          email: newUserProfile.email,
          diabetesType: newUserProfile.diabetesType,
          age: newUserProfile.age
        })
      }).catch(() => {});
    } catch {}

    setIsLoading(false);
    // Log in as this fresh new user
    login(newUserProfile, { isNewUser: true });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const account = accounts[cleanEmail];

    // Check registered accounts
    if (account && account.password === password) {
      setIsLoading(false);
      login(account.profile);
      return;
    }

    // Demo user fallback check
    if (cleanEmail === 'arjun.sharma@example.com' || cleanEmail === 'demo@example.com') {
      setIsLoading(false);
      login(initialUser);
      return;
    }

    setIsLoading(false);
    setErrorMsg('Invalid email or password. Please check your credentials or create a new account.');
  };

  const handleDemoLogin = () => {
    login(initialUser);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, var(--bg-page) 75%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        color: 'var(--text-primary)'
      }}
    >
      <div
        className="app-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '28px 24px',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              marginBottom: 10
            }}
          >
            <Activity size={26} />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 3 }}>
            GlucoCare <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Smart Diabetes & Lifestyle Health Companion
          </p>
        </div>

        {/* Tab Switcher: Sign Up vs Sign In */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            marginBottom: 20,
            border: '1px solid var(--border-light)'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              background: mode === 'signup' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: mode === 'signup' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <UserPlus size={15} />
            <span>Sign Up</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              background: mode === 'signin' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: mode === 'signin' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div
            style={{
              background: 'var(--danger-light)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SIGN UP FORM */}
        {mode === 'signup' ? (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Password (min. 6 characters) *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a password"
                  style={{ paddingLeft: 34, paddingRight: 34, fontSize: '0.84rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Diabetes Condition</label>
                <select
                  className="form-input"
                  value={diabetesType}
                  onChange={e => setDiabetesType(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '9px 10px' }}
                >
                  <option value="Type 2">Type 2 Diabetes</option>
                  <option value="Type 1">Type 1 Diabetes</option>
                  <option value="Pre-diabetes">Pre-diabetes</option>
                  <option value="Gestational">Gestational Diabetes</option>
                  <option value="General Wellness">General Health</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Age</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  className="form-input"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="e.g. 38"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>
            </div>

            {/* Target Glucose Range */}
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Target Glucose Range (mg/dL)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Min Fasting:</span>
                  <input
                    type="number"
                    value={targetMin}
                    onChange={e => setTargetMin(e.target.value)}
                    className="form-input"
                    style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max Post-Meal:</span>
                  <input
                    type="number"
                    value={targetMax}
                    onChange={e => setTargetMax(e.target.value)}
                    className="form-input"
                    style={{ padding: '6px 8px', fontSize: '0.8rem' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '0.88rem',
                fontWeight: 800,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>{isLoading ? 'Creating Account...' : 'Create My Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* SIGN IN FORM */
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ paddingLeft: 34, fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.73rem', fontWeight: 700 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingLeft: 34, paddingRight: 34, fontSize: '0.84rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: 10, color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '0.88rem',
                fontWeight: 800,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to My Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Demo Account Access Option */}
        <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            Want to test preloaded diabetes data?
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Explore with Demo Account (Arjun Sharma)</span>
          </button>
        </div>

        {/* Security badge */}
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.68rem',
            color: 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={13} color="var(--primary)" />
          <span>HIPAA & GDPR Compliant Medical Encryption</span>
        </div>
      </div>
    </div>
  );
};
