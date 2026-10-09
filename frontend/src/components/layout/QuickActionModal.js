import React from 'react';
import {
  X,
  Droplet,
  GlassWater,
  Utensils,
  Activity,
  Pill,
  Bot
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const QuickActionModal = ({ isOpen, onClose, onOpenGlucoseModal, onViewChange }) => {
  const { addWater } = useHealth();

  if (!isOpen) return null;

  const handleWaterQuickAdd = () => {
    addWater(250, 'Quick +250ml');
    onClose();
  };

  const actions = [
    {
      id: 'glucose',
      title: 'Blood Glucose',
      subtitle: 'Log sugar reading',
      icon: Droplet,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      onClick: () => {
        onClose();
        onOpenGlucoseModal();
      }
    },
    {
      id: 'water',
      title: '+250ml Water',
      subtitle: '1-Tap hydration',
      icon: GlassWater,
      color: '#0EA5E9',
      bgColor: 'rgba(14, 165, 233, 0.12)',
      onClick: handleWaterQuickAdd
    },
    {
      id: 'food',
      title: 'Log Meal',
      subtitle: 'Carbs & GI index',
      icon: Utensils,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      onClick: () => {
        onClose();
        onViewChange('food');
      }
    },
    {
      id: 'exercise',
      title: 'Log Workout',
      subtitle: 'Steps & exercise',
      icon: Activity,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.12)',
      onClick: () => {
        onClose();
        onViewChange('exercise');
      }
    },
    {
      id: 'medication',
      title: 'Medications',
      subtitle: 'Mark pills taken',
      icon: Pill,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.12)',
      onClick: () => {
        onClose();
        onViewChange('medications');
      }
    },
    {
      id: 'ai-coach',
      title: 'Ask AI Coach',
      subtitle: '24/7 Smart tips',
      icon: Bot,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.12)',
      onClick: () => {
        onClose();
        onViewChange('ai-coach');
      }
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>⚡ Quick Actions</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Choose an activity to record instantly
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {actions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: action.bgColor,
                  border: `1px solid ${action.color}30`,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-xs)',
                    background: action.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8
                  }}
                >
                  <Icon size={17} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 1 }}>
                  {action.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {action.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
