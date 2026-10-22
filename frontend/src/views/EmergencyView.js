import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  PhoneCall,
  HeartPulse,
  ShieldAlert,
  UserCheck,
  Share2,
  Check,
  Edit3,
  Save,
  X,
  Phone,
  User,
  AlertTriangle
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const EmergencyView = () => {
  const { user, setUser } = useHealth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state initialized from user profile
  const [doctorName, setDoctorName] = useState(user?.doctorName || '');
  const [doctorPhone, setDoctorPhone] = useState(user?.doctorPhone || '');
  const [ambulancePhone, setAmbulancePhone] = useState(user?.ambulancePhone || '108');
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergencyContactPhone || '');
  const [doctorHospital, setDoctorHospital] = useState(user?.doctorHospital || '');

  // Keep form in sync when user object changes
  useEffect(() => {
    if (user) {
      setDoctorName(user.doctorName || '');
      setDoctorPhone(user.doctorPhone || '');
      setAmbulancePhone(user.ambulancePhone || '108');
      setEmergencyContactName(user.emergencyContactName || '');
      setEmergencyContactPhone(user.emergencyContactPhone || '');
      setDoctorHospital(user.doctorHospital || '');
    }
  }, [user]);

  const handleSaveContacts = (e) => {
    if (e) e.preventDefault();
    const updated = {
      doctorName: doctorName.trim(),
      doctorPhone: doctorPhone.trim(),
      ambulancePhone: ambulancePhone.trim() || '108',
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      doctorHospital: doctorHospital.trim()
    };

    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      try {
        localStorage.setItem('glucocare_user', JSON.stringify(newUser));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return newUser;
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleShareMedicalId = () => {
    const text = `🚨 MEDICAL ID (Diabetes Patient)\nName: ${user?.name || 'User'}\nCondition: ${user?.diabetesType || 'Diabetes'}\nBlood Group: ${user?.bloodGroup || 'N/A'}\nAmbulance: ${user?.ambulancePhone || '108'}\nDoctor: ${user?.doctorName || 'Not Set'} (${user?.doctorPhone || 'Not Set'})\nHospital: ${user?.doctorHospital || 'N/A'}\nEmergency Contact: ${user?.emergencyContactName || 'Not Set'} (${user?.emergencyContactPhone || 'Not Set'})\nAllergies: ${user?.allergies?.join(', ') || 'None'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeAmbulance = user?.ambulancePhone || '108';
  const activeDoctorPhone = user?.doctorPhone || '';
  const activeDoctorName = user?.doctorName || 'Doctor';
  const activeEmergencyPhone = user?.emergencyContactPhone || '';
  const activeEmergencyName = user?.emergencyContactName || 'Emergency Contact';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* ── 1. URGENT SOS 1-TAP ACTION BANNER ─────────────────────────────────── */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(245, 158, 11, 0.12) 100%)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          padding: '16px',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--danger)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)'
              }}
            >
              <AlertOctagon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--danger)', margin: 0 }}>
                Emergency SOS
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Instant 1-Tap Emergency Calling
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-outline"
            style={{
              padding: '6px 10px',
              fontSize: '0.72rem',
              borderRadius: 'var(--radius-full)',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: 'var(--danger)',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isEditing ? <X size={13} /> : <Edit3 size={13} />}
            <span>{isEditing ? 'Cancel' : 'Edit Contacts'}</span>
          </button>
        </div>

        {/* 3 Quick Calling Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {/* Call Ambulance Button */}
          <a
            href={`tel:${activeAmbulance}`}
            className="btn btn-primary"
            style={{
              background: '#dc2626',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              padding: '12px 6px',
              fontSize: '0.76rem',
              flexDirection: 'column',
              gap: 4,
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 900 }}>Ambulance</span>
            <span style={{ fontSize: '0.66rem', opacity: 0.9 }}>{activeAmbulance}</span>
          </a>

          {/* Call Doctor Button */}
          <a
            href={activeDoctorPhone ? `tel:${activeDoctorPhone}` : '#'}
            onClick={(e) => {
              if (!activeDoctorPhone) {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
            className="btn btn-primary"
            style={{
              background: '#0284c7',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
              padding: '12px 6px',
              fontSize: '0.76rem',
              flexDirection: 'column',
              gap: 4,
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <HeartPulse size={18} />
            <span style={{ fontWeight: 900 }}>Doctor</span>
            <span style={{ fontSize: '0.66rem', opacity: 0.9 }}>
              {activeDoctorPhone ? activeDoctorName.split(' ')[0] : 'Add No.'}
            </span>
          </a>

          {/* Call Emergency Contact Button */}
          <a
            href={activeEmergencyPhone ? `tel:${activeEmergencyPhone}` : '#'}
            onClick={(e) => {
              if (!activeEmergencyPhone) {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
            className="btn btn-primary"
            style={{
              background: '#059669',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
              padding: '12px 6px',
              fontSize: '0.76rem',
              flexDirection: 'column',
              gap: 4,
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <PhoneCall size={18} />
            <span style={{ fontWeight: 900 }}>Contact</span>
            <span style={{ fontSize: '0.66rem', opacity: 0.9 }}>
              {activeEmergencyPhone ? activeEmergencyName.split(' ')[0] : 'Add No.'}
            </span>
          </a>
        </div>
      </div>

      {/* ── SAVED SUCCESS BANNER ────────────────────────────────────────────── */}
      {saveSuccess && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--primary)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <Check size={16} />
          <span>Emergency doctor and ambulance contacts updated successfully!</span>
        </div>
      )}

      {/* ── 2. EDIT / ADD EMERGENCY CONTACTS FORM ─────────────────────────────── */}
      {isEditing && (
        <div
          className="app-card"
          style={{
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={17} color="var(--primary)" />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>
                Configure Doctor & Ambulance Numbers
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="icon-btn"
              style={{ width: 26, height: 26 }}
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSaveContacts} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Ambulance Number */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: '0.85rem' }}>🚑</span>
                <span>Ambulance Emergency Number</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 108 or 102 or local ambulance"
                value={ambulancePhone}
                onChange={(e) => setAmbulancePhone(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                Default is 108 (National Emergency & Ambulance Service). You can change it to your city/local ambulance service.
              </span>
            </div>

            {/* Doctor Details */}
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartPulse size={15} color="#0284c7" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7' }}>
                  Doctor / Endocrinologist Details
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Doctor Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Priya Nair (Endocrinologist)"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Doctor Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hospital / Clinic Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apollo Diabetes Centre, Chennai"
                  value={doctorHospital}
                  onChange={(e) => setDoctorHospital(e.target.value)}
                />
              </div>
            </div>

            {/* Family Emergency Contact Details */}
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PhoneCall size={15} color="#059669" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669' }}>
                  Family / Primary Emergency Contact
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Name & Relation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sunita Sharma (Spouse)"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98888 12345"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary btn-block"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Save size={15} />
                <span>Save Emergency Contacts</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 3. EMERGENCY CONTACTS DIRECTORY LIST ───────────────────────────────── */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={17} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              Registered Emergency Contacts
            </h3>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ padding: '4px 9px', fontSize: '0.72rem' }}
          >
            <Edit3 size={12} />
            <span>Update</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Ambulance Tile */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}
              >
                🚑
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--danger)' }}>
                  Ambulance Emergency
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Dial: <strong style={{ color: 'var(--text-primary)' }}>{activeAmbulance}</strong>
                </div>
              </div>
            </div>

            <a
              href={`tel:${activeAmbulance}`}
              className="btn btn-primary"
              style={{
                background: 'var(--danger)',
                padding: '6px 12px',
                fontSize: '0.74rem',
                textDecoration: 'none'
              }}
            >
              <PhoneCall size={13} />
              <span>Dial {activeAmbulance}</span>
            </a>
          </div>

          {/* Doctor Tile */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(2, 132, 199, 0.06)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HeartPulse size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0284c7' }}>
                  {activeDoctorName || 'Doctor not configured'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {activeDoctorPhone ? (
                    <>
                      {activeDoctorPhone} • {user?.doctorHospital || 'Clinic'}
                    </>
                  ) : (
                    <span style={{ color: 'var(--warning)' }}>No phone number added</span>
                  )}
                </div>
              </div>
            </div>

            {activeDoctorPhone ? (
              <a
                href={`tel:${activeDoctorPhone}`}
                className="btn btn-primary"
                style={{
                  background: '#0284c7',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  textDecoration: 'none'
                }}
              >
                <PhoneCall size={13} />
                <span>Call Doctor</span>
              </a>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.72rem' }}
              >
                Add Number
              </button>
            )}
          </div>

          {/* Family Contact Tile */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--primary)' }}>
                  {activeEmergencyName || 'Emergency contact not set'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {activeEmergencyPhone || <span style={{ color: 'var(--warning)' }}>No phone number added</span>}
                </div>
              </div>
            </div>

            {activeEmergencyPhone ? (
              <a
                href={`tel:${activeEmergencyPhone}`}
                className="btn btn-primary"
                style={{
                  background: 'var(--primary)',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  textDecoration: 'none'
                }}
              >
                <PhoneCall size={13} />
                <span>Call Contact</span>
              </a>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.72rem' }}
              >
                Add Number
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. HYPOGLYCEMIA "RULE OF 15" PROTOCOL ────────────────────────────── */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <ShieldAlert size={18} color="var(--warning)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
            Hypo Emergency: "Rule of 15"
          </h3>
        </div>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
          If blood sugar drops below <strong>70 mg/dL</strong> or you feel shaky, sweaty, or dizzy:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--warning)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                flexShrink: 0
              }}
            >
              1
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Eat 15g Fast-Acting Sugar</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                1/2 cup fruit juice, 3-4 glucose tablets, or 3 tsp sugar / honey.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--warning)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                flexShrink: 0
              }}
            >
              2
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Wait 15 Minutes & Rest</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                Sit quietly and allow glucose to absorb into the bloodstream.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--warning)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                flexShrink: 0
              }}
            >
              3
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Re-Check Blood Glucose</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                If still &lt; 70 mg/dL, repeat Step 1. Once &gt; 70 mg/dL, eat a solid protein snack.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. DIGITAL MEDICAL ID CARD ────────────────────────────────────────── */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>Medical ID</h3>
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
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user?.name || 'User'}</div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>CONDITION</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{user?.diabetesType || 'Type 2 Diabetes'}</div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>BLOOD GROUP</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--danger)' }}>
              {user?.bloodGroup || 'B+'}
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>AMBULANCE</div>
            <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--danger)' }}>
              {activeAmbulance}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>DOCTOR</div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
              {activeDoctorName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {activeDoctorPhone || 'Phone not set'}
            </div>
          </div>

          <div style={{ padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>EMERGENCY CONTACT</div>
            <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
              {activeEmergencyName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {activeEmergencyPhone || 'Phone not set'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700 }}>ALLERGIES</div>
          <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {user?.allergies?.join(', ') || 'No known allergies'}
          </div>
        </div>
      </div>
    </div>
  );
};
