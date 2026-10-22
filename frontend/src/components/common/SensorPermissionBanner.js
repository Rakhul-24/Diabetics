import React, { useState } from 'react';
import { Smartphone, Check, X } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const SensorPermissionBanner = () => {
  const { sensorStatus, requestSensorPermission } = useHealth();
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Only display if sensor permission is needed (such as iOS Safari or when permission prompt is required)
  if (sensorStatus !== 'permission-needed' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setRequesting(true);
    try {
      await requestSensorPermission();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height, 65px) + 12px)',
        left: '12px',
        right: '12px',
        maxWidth: 500,
        margin: '0 auto',
        zIndex: 990,
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.96) 0%, rgba(5, 150, 105, 0.96) 100%)',
        backdropFilter: 'blur(12px)',
        color: '#ffffff',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md, 14px)',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        animation: 'slideUp 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Smartphone size={18} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, lineHeight: 1.2 }}>
            Enable Mobile Step Detection
          </div>
          <div style={{ fontSize: '0.72rem', opacity: 0.92, marginTop: 2 }}>
            Allow phone motion sensor to count physical steps in pocket & background
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button
          onClick={handleEnable}
          disabled={requesting}
          style={{
            padding: '7px 12px',
            borderRadius: 'var(--radius-full, 999px)',
            background: '#ffffff',
            color: '#059669',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Check size={14} />
          <span>{requesting ? 'Enabling...' : 'Allow'}</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
