import React from 'react';
import {
  Home,
  Droplet,
  Utensils,
  Pill,
  Activity,
  GlassWater,
  Moon,
  Bot,
  FileText,
  ShieldAlert,
  Settings,
  Plus
} from 'lucide-react';

export const Navigation = ({ currentView, onViewChange, onOpenQuickAction }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, section: 'Core' },
    { id: 'glucose', label: 'Blood Glucose', icon: Droplet, section: 'Core' },
    { id: 'food', label: 'Diet & Nutrition', icon: Utensils, section: 'Lifestyle' },
    { id: 'medications', label: 'Medications', icon: Pill, section: 'Lifestyle' },
    { id: 'exercise', label: 'Workout & Steps', icon: Activity, section: 'Lifestyle' },
    { id: 'water', label: 'Hydration', icon: GlassWater, section: 'Lifestyle' },
    { id: 'sleep', label: 'Sleep & Rest', icon: Moon, section: 'Lifestyle' },
    { id: 'ai-coach', label: 'AI Health Coach', icon: Bot, section: 'Insights' },
    { id: 'reports', label: 'Doctor Reports', icon: FileText, section: 'Insights' },
    { id: 'emergency', label: 'Emergency & SOS', icon: ShieldAlert, section: 'Support' },
    { id: 'settings', label: 'Settings & Profile', icon: Settings, section: 'Support' }
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-header">
          <div className="brand-logo-wrap">
            <Droplet size={22} />
          </div>
          <div>
            <div className="brand-title">GlucoCare AI</div>
            <div className="brand-subtitle">Diabetes Health</div>
          </div>
        </div>

        <div className="sidebar-nav">
          <button
            className="btn btn-primary btn-block"
            style={{ marginBottom: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)' }}
            onClick={onOpenQuickAction}
          >
            <Plus size={16} />
            <span>Quick Action</span>
          </button>

          {['Core', 'Lifestyle', 'Insights', 'Devices', 'Support'].map(section => {
            const sectionItems = sidebarItems.filter(item => item.section === section);
            if (!sectionItems.length) return null;
            return (
              <div key={section} style={{ marginBottom: 4 }}>
                <div className="sidebar-section-title">{section}</div>
                {sectionItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      onClick={() => onViewChange(item.id)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Modern Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <div className="nav-icon-wrap">
            <Home size={19} />
          </div>
          <span>Home</span>
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'glucose' ? 'active' : ''}`}
          onClick={() => onViewChange('glucose')}
        >
          <div className="nav-icon-wrap">
            <Droplet size={19} />
          </div>
          <span>Glucose</span>
        </button>

        {/* Center Quick Action Plus Button */}
        <button
          className="nav-center-action-btn"
          onClick={onOpenQuickAction}
          aria-label="Quick Action Log"
        >
          <Plus size={24} strokeWidth={3} />
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'food' ? 'active' : ''}`}
          onClick={() => onViewChange('food')}
        >
          <div className="nav-icon-wrap">
            <Utensils size={19} />
          </div>
          <span>Diet</span>
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => onViewChange('reports')}
        >
          <div className="nav-icon-wrap">
            <FileText size={19} />
          </div>
          <span>Reports</span>
        </button>
      </nav>
    </>
  );
};
