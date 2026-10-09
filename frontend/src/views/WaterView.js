import React, { useState } from 'react';
import {
  GlassWater,
  Plus,
  Droplet,
  Sparkles
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const WaterView = () => {
  const { waterData, addWater } = useHealth();
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const waterPercent = Math.min(100, Math.round((waterData.currentMl / waterData.dailyGoalMl) * 100));
  const remainingMl = Math.max(0, waterData.dailyGoalMl - waterData.currentMl);

  const handleCustomAdd = (e) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (amount > 0) {
      addWater(amount, `Custom +${amount}ml`);
      setCustomAmount('');
      setShowCustomModal(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Animated Hydration Status & Glass */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          textAlign: 'center',
          padding: '20px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <GlassWater size={20} color="var(--secondary)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Hydration Tracker</h2>
        </div>

        {/* Compact Animated Water Cup Graphic */}
        <div
          style={{
            width: 110,
            height: 140,
            margin: '0 auto 14px',
            borderRadius: '12px 12px 28px 28px',
            border: '3px solid var(--secondary)',
            borderTop: 'none',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-card)',
            boxShadow: '0 6px 18px rgba(14, 165, 233, 0.2)'
          }}
        >
          {/* Water Fill */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${waterPercent}%`,
              background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
              transition: 'height 0.5s ease',
              opacity: 0.85
            }}
          />

          {/* Centered Percentage */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
              fontWeight: 900,
              fontSize: '1.35rem',
              color: waterPercent > 50 ? '#ffffff' : 'var(--text-primary)',
              fontFamily: 'var(--font-heading)'
            }}
          >
            {waterPercent}%
          </div>
        </div>

        {/* Numbers */}
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--secondary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          {waterData.currentMl}
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: 4 }}>
            / {waterData.dailyGoalMl} ml
          </span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {remainingMl === 0 ? '🎉 Goal Completed!' : `${remainingMl} ml remaining to hit goal`}
        </p>

        {/* Quick Add Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => addWater(250, 'Glass (250ml)')}
            style={{ background: 'var(--secondary)', boxShadow: '0 3px 10px rgba(14, 165, 233, 0.35)', padding: '7px 12px', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>+250ml</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => addWater(500, 'Bottle (500ml)')}
            style={{ padding: '7px 12px', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>+500ml</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomModal(true)}
            style={{ padding: '7px 10px', fontSize: '0.78rem' }}
          >
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* 2. Hydration Benefits for Diabetics */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Sparkles size={16} color="var(--secondary)" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Hydration Tip</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Adequate water intake helps kidneys eliminate excess glucose and prevents blood sugar spikes caused by dehydration. Drink a glass before every meal!
        </p>
      </div>

      {/* 3. Today's Water Log Timeline */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 10 }}>Today's Entries</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {waterData.logs.map(log => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(14, 165, 233, 0.15)',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Droplet size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{log.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    {log.time}
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '0.88rem' }}>
                +{log.amountMl} ml
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Modal */}
      {showCustomModal && (
        <div className="modal-backdrop" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Custom Water Log
            </h3>
            <form onSubmit={handleCustomAdd}>
              <div className="form-group">
                <label className="form-label">Water Amount (in Milliliters)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  placeholder="300"
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowCustomModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Add Water
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
