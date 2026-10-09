import React, { useState } from 'react';
import {
  AlertOctagon,
  PhoneCall,
  HeartPulse,
  ShieldAlert,
  UserCheck,
  Share2,
  Check
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const EmergencyView = () => {
  const { user } = useHealth();
  const [copied, setCopied] = useState(false);

  const handleShareMedicalId = () => {
    const text = `MEDICAL ID (Diabetes Patient)\nName: ${user.name}\nCondition: ${user.diabetesType}\nBlood Group: ${user.bloodGroup}\nEmergency Contact: ${user.emergencyContactName} (${user.emergencyContactPhone})\nDoctor: ${user.doctorName} (${user.doctorPhone})\nAllergies: ${user.allergies.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Urgent Emergency Actions Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          padding: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-xs)',
              background: 'var(--danger)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertOctagon size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--danger)' }}>Emergency SOS</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              1-Tap emergency contacts
            </p>
          </div>
        </div>

        <div className="grid-cols-2" style={{ marginTop: 10, gap: 8 }}>
          <a
            href={`tel:${user.emergencyContactPhone}`}
            className="btn btn-primary btn-block"
            style={{ background: 'var(--danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)', padding: '12px 10px', fontSize: '0.82rem' }}
          >
            <PhoneCall size={16} />
            <span>Call {user.emergencyContactName?.split(' ')[0] || 'Contact'}</span>
          </a>

          <a
            href={`tel:${user.doctorPhone}`}
            className="btn btn-secondary btn-block"
            style={{ padding: '12px 10px', fontSize: '0.82rem' }}
          >
            <HeartPulse size={16} color="var(--primary)" />
            <span>Call Doctor</span>
          </a>
        </div>
      </div>

      {/* 2. Hypoglycemia Rule of 15 Protocol */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <ShieldAlert size={18} color="var(--warning)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Hypo Emergency: "Rule of 15"</h3>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
          If blood sugar is <strong>&lt; 70 mg/dL</strong> or you feel shaky / sweating:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
              1
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Eat 15g Fast-Acting Sugar</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                1/2 cup fruit juice, 3-4 glucose tablets, or 3 tsp sugar/honey.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
              2
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Wait 15 Minutes & Rest</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                Sit quietly and allow glucose to absorb into bloodstream.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card-subtle)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
              3
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Re-Check Blood Glucose</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                If still &lt; 70 mg/dL, repeat Step 1. Once &gt; 70 mg/dL, eat a snack.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Digital Medical ID Card */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Medical ID</h3>
          </div>

          <button
            onClick={handleShareMedicalId}
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            {copied ? <Check size={13} color="var(--primary)" /> : <Share2 size={13} />}
            <span>{copied ? 'Copied' : 'Share ID'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>PATIENT</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.name}</div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONDITION</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.diabetesType}</div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>BLOOD GROUP</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--danger)' }}>{user.bloodGroup}</div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>ALLERGIES</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user.allergies.join(', ') || 'None'}</div>
          </div>
        </div>

        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMERGENCY CONTACT</div>
          <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>
            {user.emergencyContactName} ({user.emergencyContactPhone})
          </div>
        </div>
      </div>
    </div>
  );
};
