import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ShieldCheck
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const MedicationView = () => {
  const { medications, toggleMedicationTaken, addMedication, deleteMedication } = useHealth();
  const [showAddModal, setShowAddModal] = useState(false);

  // New med form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [time1, setTime1] = useState('08:00');
  const [instructions, setInstructions] = useState('');

  // Adherence calculation
  const totalDoses = medications.reduce((sum, m) => sum + m.times.length, 0);
  const takenDoses = medications.reduce(
    (sum, m) => sum + m.takenToday.filter(Boolean).length,
    0
  );
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!name) return;

    addMedication({
      name,
      dosage: dosage || '500 mg',
      frequency,
      times: [time1],
      instructions: instructions || 'Take with food',
      color: '#10B981',
      takenToday: [false]
    });

    setName('');
    setDosage('');
    setInstructions('');
    setShowAddModal(false);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Medication Adherence Header Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          padding: '14px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--accent-purple)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800 }}>Adherence</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {takenDoses} of {totalDoses} doses taken today
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-purple)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {adherencePercent}%
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)' }}>
              {adherencePercent === 100 ? '⭐ Perfect' : 'On Track'}
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 5, background: 'var(--border-light)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: `${adherencePercent}%`, height: '100%', background: 'var(--accent-purple)' }} />
        </div>
      </div>

      {/* 2. Active Prescriptions List */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Pill size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Prescriptions</h3>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>Add Med</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {medications.map(med => (
            <div
              key={med.id}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-xs)',
                      background: `${med.color || '#10B981'}20`,
                      color: med.color || '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Pill size={17} />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>{med.name}</h4>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        {med.dosage}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {med.frequency} • {med.instructions}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteMedication(med.id)}
                  style={{
                    color: 'var(--text-muted)',
                    padding: 4,
                    borderRadius: 4,
                    flexShrink: 0
                  }}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Dose Checkboxes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Today:
                </span>

                {med.times.map((time, idx) => {
                  const isTaken = med.takenToday[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMedicationTaken(med.id, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: `1px solid ${isTaken ? 'var(--primary)' : 'var(--border-light)'}`,
                        background: isTaken ? 'var(--primary-light)' : 'var(--bg-card)',
                        color: isTaken ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isTaken ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                      <span>{time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Add Prescription
            </h3>

            <form onSubmit={handleAddMed}>
              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Metformin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="500 mg"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-select"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={time1}
                  onChange={e => setTime1(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Take with meals"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-block">
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
