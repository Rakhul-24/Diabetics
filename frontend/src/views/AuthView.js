import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Footprints,
  Apple
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { initialUser } from '../services/mockData';

export const AuthView = () => {
  const { login } = useHealth();
  const [email, setEmail] = useState('arjun.sharma@example.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Arjun Sharma');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleDemoLogin = () => {
    login(initialUser);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profile = {
      ...initialUser,
      name: name.trim() || 'Arjun Sharma',
      email: email.trim() || 'arjun@example.com'
    };
    login(profile);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12) 0%, var(--bg-app) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px'
      }}
    >
      <div
        className="app-card"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '28px 24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-gradient)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              marginBottom: 12
            }}
          >
            <Activity size={28} />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 4 }}>
            GlucoCare <span style={{ color: 'var(--primary)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Intelligent Diabetes Management & Glycemic Health
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 10,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 800
            }}
          >
            <Sparkles size={12} />
            <span>Powered by Google Gemini 2.5 Flash</span>
          </div>
        </div>

        {/* Feature Highlights Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            marginBottom: 20,
            textAlign: 'center'
          }}
        >
          <div style={{ padding: '8px 4px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <Activity size={16} color="var(--primary)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.64rem', fontWeight: 700 }}>CGM & Vitals</div>
          </div>
          <div style={{ padding: '8px 4px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <Apple size={16} color="var(--secondary)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.64rem', fontWeight: 700 }}>AI Food Plan</div>
          </div>
          <div style={{ padding: '8px 4px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-light)' }}>
            <Footprints size={16} color="var(--warning)" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.64rem', fontWeight: 700 }}>Daily Steps</div>
          </div>
        </div>

        {/* One-Click Demo Sign-in */}
        <div style={{ marginBottom: 18 }}>
          <button
            onClick={handleDemoLogin}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>Continue as Arjun Sharma (Demo)</span>
            <ArrowRight size={16} />
          </button>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
            Preloaded with Type 2 Diabetes glucose logs & 7-day step history
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          <span style={{ padding: '0 10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Or sign in with email
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isRegisterMode && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.74rem' }}>Your Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  style={{ paddingLeft: 34, fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ paddingLeft: 34, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingLeft: 34, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '0.84rem',
              fontWeight: 800,
              marginTop: 4
            }}
          >
            {isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 12,
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: '0.68rem',
            color: 'var(--text-muted)'
          }}
        >
          <ShieldCheck size={13} color="var(--primary)" />
          <span>HIPAA & GDPR Compliant Medical Grade Security</span>
        </div>
      </div>
    </div>
  );
};
