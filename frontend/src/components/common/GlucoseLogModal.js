import React, { useState } from 'react';
import { X, Droplet, Check } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const GlucoseLogModal = ({ isOpen, onClose }) => {
  const { user, addGlucoseReading, formatGlucose, getGlucoseUnit, getGlucoseStatus } = useHealth();
  const [readingMg, setReadingMg] = useState(115);
  const [type, setType] = useState('fasting');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const readingTypes = [
    { id: 'fasting', label: 'Fasting' },
    { id: 'beforeMeal', label: 'Before Meal' },
    { id: 'afterMeal', label: 'After Meal' },
    { id: 'bedtime', label: 'Bedtime' },
    { id: 'random', label: 'Random' }
  ];

  const status = getGlucoseStatus(readingMg);
  const isMmol = user.unitPreference === 'mmol/L';

  const handleSubmit = (e) => {
    e.preventDefault();
    addGlucoseReading({
      readingMg: Number(readingMg),
      type,
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Droplet size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Log Glucose</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Track your sugar reading
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Reading Display */}
          <div
            style={{
              padding: '16px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-subtle)',
              textAlign: 'center',
              marginBottom: 14,
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: status.color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {formatGlucose(readingMg)}
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: 5 }}>
                {getGlucoseUnit()}
              </span>
            </div>

            {isMmol && (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                ≈ {readingMg} mg/dL
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <span className={`status-badge ${status.class}`} style={{ fontSize: '0.76rem', padding: '3px 10px' }}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>40 (Hypo)</span>
              <span>Slide to adjust</span>
              <span>350 (High)</span>
            </div>
            <input
              type="range"
              min="40"
              max="350"
              step="1"
              value={readingMg}
              onChange={e => setReadingMg(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--primary)',
                height: 6,
                borderRadius: 3,
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Reading Type Selector */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label" style={{ fontSize: '0.76rem' }}>Context</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {readingTypes.map(t => {
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-input)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: '0.76rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" style={{ fontSize: '0.76rem' }}>Notes (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1 hr after lunch"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.86rem' }}
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px' }}>
            <Check size={16} />
            <span>Save Reading</span>
          </button>
        </form>
      </div>
    </div>
  );
};
