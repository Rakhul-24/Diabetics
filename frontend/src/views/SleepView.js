import React from 'react';
import {
  Moon,
  Bed,
  SunMedium,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const SleepView = () => {
  const { sleepData, logSleep } = useHealth();

  const totalSleep = (sleepData.deepSleepHours || 0) + (sleepData.remSleepHours || 0) + (sleepData.lightSleepHours || 0);
  const deepPercent = totalSleep > 0 ? Math.round(((sleepData.deepSleepHours || 0) / totalSleep) * 100) : 0;
  const remPercent = totalSleep > 0 ? Math.round(((sleepData.remSleepHours || 0) / totalSleep) * 100) : 0;
  const lightPercent = totalSleep > 0 ? Math.round(((sleepData.lightSleepHours || 0) / totalSleep) * 100) : 0;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Sleep Summary Hero Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.3)',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Moon size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Last Night's Sleep</h3>
          </div>
          <span
            className="status-badge"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'var(--accent-purple)',
              fontSize: '0.74rem'
            }}
          >
            {sleepData.qualityLabel} {sleepData.qualityScore > 0 ? `(${sleepData.qualityScore}%)` : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-purple)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            {sleepData.lastNightDurationHours || 0}
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            hours of sleep
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bed size={14} />
            <span>In Bed: {sleepData.bedTime || '--:--'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SunMedium size={14} />
            <span>Woke Up: {sleepData.wakeTime || '--:--'}</span>
          </div>
        </div>

        {/* Quick Log Sleep If Not Recorded Yet */}
        {(!sleepData.lastNightDurationHours || sleepData.lastNightDurationHours === 0) && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: 8 }}>
              ⚡ Log Today's Sleep Duration:
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { hours: 6.0, label: '6.0h (Short)', quality: 68, qualityLabel: 'Fair Quality' },
                { hours: 7.0, label: '7.0h (Good)', quality: 82, qualityLabel: 'Good Quality' },
                { hours: 7.5, label: '7.5h (Optimal)', quality: 88, qualityLabel: 'Optimal Rest' },
                { hours: 8.0, label: '8.0h (Restful)', quality: 92, qualityLabel: 'Deep Rest' },
                { hours: 8.5, label: '8.5h (Extended)', quality: 86, qualityLabel: 'Good Quality' }
              ].map(opt => (
                <button
                  key={opt.hours}
                  onClick={() => logSleep({
                    hours: opt.hours,
                    qualityLabel: opt.qualityLabel,
                    qualityScore: opt.quality,
                    bedTime: '23:00',
                    wakeTime: opt.hours === 8 ? '07:00' : '06:30'
                  })}
                  className="btn btn-outline"
                  style={{
                    padding: '5px 9px',
                    fontSize: '0.73rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)',
                    borderColor: 'rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sleep Stages Progress Stack */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
            <span>Architecture</span>
            <span style={{ fontWeight: 600 }}>Deep {deepPercent}% • REM {remPercent}% • Light {lightPercent}%</span>
          </div>

          <div style={{ width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: 'var(--border-light)' }}>
            <div style={{ width: `${deepPercent}%`, background: '#6366f1' }} title={`Deep Sleep: ${sleepData.deepSleepHours}h`} />
            <div style={{ width: `${remPercent}%`, background: '#8b5cf6' }} title={`REM Sleep: ${sleepData.remSleepHours}h`} />
            <div style={{ width: `${lightPercent}%`, background: '#a78bfa' }} title={`Light Sleep: ${sleepData.lightSleepHours}h`} />
          </div>
        </div>
      </div>

      {/* 2. Sleep Stages Breakdown Cards */}
      <div className="grid-cols-3">
        <div className="app-card" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>DEEP</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{sleepData.deepSleepHours} hrs</div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Cortisol & physical reset
          </p>
        </div>

        <div className="app-card" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>REM</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{sleepData.remSleepHours} hrs</div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Stress & mood regulation
          </p>
        </div>

        <div className="app-card" style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)' }}>LIGHT</span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{sleepData.lightSleepHours} hrs</div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Foundation rest
          </p>
        </div>
      </div>

      {/* 3. 7-Day Sleep Duration Trend */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 12 }}>7-Day Regularity</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 95, padding: '0 4px' }}>
          {sleepData.history.map((day, i) => {
            const barHeight = Math.min(100, (day.hours / 9) * 100);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{day.hours}h</div>
                <div
                  style={{
                    width: '60%',
                    maxWidth: 20,
                    height: `${barHeight}%`,
                    borderRadius: '3px 3px 0 0',
                    background: day.hours >= 7 ? 'var(--accent-purple)' : 'var(--border-light)'
                  }}
                />
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sleep & Glucose Connection Tips */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Sparkles size={16} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Sleep & Morning Fasting Sugar</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Getting 7-8 hours of uninterrupted sleep lowers nighttime cortisol and counters morning insulin resistance (the "Dawn Phenomenon").
        </p>
      </div>
    </div>
  );
};
