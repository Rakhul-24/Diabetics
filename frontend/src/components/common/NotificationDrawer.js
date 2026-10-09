import React from 'react';
import { X, CheckCheck, Bell, Pill, Droplet, Bot, FileText } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const NotificationDrawer = ({ isOpen, onClose, onViewChange }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useHealth();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'medication': return <Pill size={18} color="#8B5CF6" />;
      case 'water': return <Droplet size={18} color="#0EA5E9" />;
      case 'ai': return <Bot size={18} color="#10B981" />;
      case 'report': return <FileText size={18} color="#F59E0B" />;
      default: return <Bell size={18} color="var(--primary)" />;
    }
  };

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.view) {
      onViewChange(notif.view);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={markAllNotificationsRead}
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              No notifications right now
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: n.isRead ? 'var(--bg-card-subtle)' : 'var(--primary-light)',
                  border: `1px solid ${n.isRead ? 'var(--border-light)' : 'rgba(16, 185, 129, 0.3)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: '0.9rem' }}>
                      {n.title}
                    </div>
                    {!n.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {n.body}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
