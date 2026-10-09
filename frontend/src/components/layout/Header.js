import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  AlertCircle,
  Calendar,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../context/HealthContext';

export const Header = ({ currentView, onViewChange, onOpenNotifications }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, notifications, logout } = useHealth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return { title: `Hi, ${user.name?.split(' ')[0] || 'Friend'} 👋`, subtitle: 'Daily Health Overview' };
      case 'glucose': return { title: 'Blood Glucose', subtitle: 'Continuous Tracker' };
      case 'food': return { title: 'Diet & Nutrition', subtitle: 'Low-GI Meal Plans' };
      case 'medications': return { title: 'Medications', subtitle: 'Daily Prescriptions' };
      case 'exercise': return { title: 'Workouts & Steps', subtitle: 'Daily Activity' };
      case 'water': return { title: 'Hydration', subtitle: 'Target: 2.5 Liters' };
      case 'sleep': return { title: 'Sleep & Recovery', subtitle: 'Rest Stages' };
      case 'ai-coach': return { title: 'AI Health Coach', subtitle: '24/7 Smart Guidance' };
      case 'reports': return { title: 'Clinical Reports', subtitle: 'Doctor Summary' };
      case 'step-tracker':
      case 'google-fit':
      case 'bluetooth': return { title: 'Phone Step Sensor', subtitle: 'Live Motion Pedometer' };
      case 'emergency': return { title: 'Emergency SOS', subtitle: 'Rule of 15 & Medical ID' };
      case 'settings': return { title: 'Profile & Settings', subtitle: 'Preferences & Units' };
      default: return { title: 'GlucoCare AI', subtitle: 'Diabetes Health' };
    }
  };

  const { title, subtitle } = getViewTitle();

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Profile Avatar Trigger on Left */}
        <button
          onClick={() => onViewChange('settings')}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-light)',
            flexShrink: 0
          }}
          title="Profile & Settings"
        >
          {user.name ? user.name.charAt(0) : 'U'}
        </button>

        <div className="header-title-block">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Prominent Live Date Badge */}
        <div
          className="header-date-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-light)',
            fontSize: '0.73rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap'
          }}
          title="Today's Date"
        >
          <Calendar size={13} color="var(--primary)" />
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Compact SOS Button */}
        <button
          className="emergency-chip-btn"
          onClick={() => onViewChange('emergency')}
          title="Emergency Help & SOS"
        >
          <AlertCircle size={13} />
          <span>SOS</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle Dark/Light"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          className="icon-btn"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && <span className="badge-dot" />}
        </button>

        {/* Logout Button */}
        <button
          className="icon-btn"
          onClick={() => setShowLogoutModal(true)}
          aria-label="Log Out"
          title="Log Out of GlucoCare"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogoutModal(false)}
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
              <LogOut size={22} />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 6 }}>
              Log Out of GlucoCare?
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              You will return to the sign-in screen. All your glucose and activity logs remain safely stored on this device.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn btn-secondary"
                style={{ padding: '9px 14px', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
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
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
