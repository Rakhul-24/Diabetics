import React, { useState } from 'react';
import {
  Bluetooth,
  RefreshCw,
  CheckCircle2,
  Wifi,
  Radio,
  Watch,
  Activity
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const BluetoothView = () => {
  const { addGlucoseReading } = useHealth();
  const [isScanning, setIsScanning] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncStatusMsg, setSyncStatusMsg] = useState('Synced 12 mins ago');
  const [deviceList, setDeviceList] = useState([
    { id: 'd1', name: 'Accu-Chek Instant #8491', type: 'Glucometer', status: 'connected', battery: 92, icon: Activity },
    { id: 'd2', name: 'Dexcom G7 CGM #3019', type: 'Continuous CGM', status: 'available', battery: 85, icon: Radio },
    { id: 'd3', name: 'FreeStyle Libre 3 Sensor', type: 'NFC/BLE Sensor', status: 'available', battery: 78, icon: Wifi },
    { id: 'd4', name: 'Galaxy Watch 6 Health', type: 'Wearable HR/Steps', status: 'connected', battery: 64, icon: Watch }
  ]);

  const handleConnect = (devId) => {
    setDeviceList(prev =>
      prev.map(d => (d.id === devId ? { ...d, status: 'connected' } : d))
    );
    setSyncStatusMsg(`Connected successfully`);
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSyncStatusMsg('Live sync complete');
      addGlucoseReading({
        readingMg: 118,
        type: 'random',
        notes: 'Auto-synced via Bluetooth'
      });
    }, 2000);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Sync Status Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1.5px solid rgba(14, 165, 233, 0.3)',
          padding: '14px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--secondary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bluetooth size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>CGM & Bluetooth</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {syncStatusMsg}
              </p>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={isScanning}
            style={{ background: 'var(--secondary)', boxShadow: '0 3px 10px rgba(14, 165, 233, 0.35)', padding: '6px 12px', fontSize: '0.78rem', flexShrink: 0 }}
          >
            <RefreshCw size={14} className={isScanning ? 'spin-anim' : ''} />
            <span>{isScanning ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* 2. Device List */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 10 }}>Discovered Devices</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deviceList.map(dev => {
            const Icon = dev.icon;
            const isConnected = dev.status === 'connected';
            return (
              <div
                key={dev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-subtle)',
                  border: `1px solid ${isConnected ? 'rgba(14, 165, 233, 0.4)' : 'var(--border-light)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-xs)',
                      background: isConnected ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-card)',
                      color: isConnected ? 'var(--secondary)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {dev.type} • 🔋 {dev.battery}%
                    </div>
                  </div>
                </div>

                <div>
                  {isConnected ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--secondary)',
                        background: 'var(--secondary-light)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(dev.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Automatic Continuous Sync Setting */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Background Auto-Sync</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Auto-sync glucose from CGM device every 5 mins
            </div>
          </div>

          <button
            onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: autoSyncEnabled ? 'var(--primary)' : 'var(--border-light)',
              position: 'relative',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: autoSyncEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s ease',
                boxShadow: 'var(--shadow-xs)'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
