import React, { useState } from 'react';
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
  Plus,
  LayoutGrid,
  X,
  ChevronRight
} from 'lucide-react';

export const Navigation = ({ currentView, onViewChange, onOpenQuickAction }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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

  // Secondary views shown inside mobile More drawer
  const moreItems = [
    { id: 'ai-coach', label: 'AI Health Coach', icon: Bot, desc: 'Smart continuous guidance', color: '#8b5cf6' },
    { id: 'medications', label: 'Medications', icon: Pill, desc: 'Insulin & pill reminders', color: '#0ea5e9' },
    { id: 'exercise', label: 'Workout & Steps', icon: Activity, desc: 'Pedometer & activities', color: '#10b981' },
    { id: 'water', label: 'Hydration', icon: GlassWater, desc: 'Daily water target: 2.5L', color: '#06b6d4' },
    { id: 'sleep', label: 'Sleep & Rest', icon: Moon, desc: 'Sleep debt & recovery', color: '#6366f1' },
    { id: 'reports', label: 'Doctor Reports', icon: FileText, desc: 'Clinical metrics summary', color: '#3b82f6' },
    { id: 'emergency', label: 'Emergency & SOS', icon: ShieldAlert, desc: 'Rule of 15 & Medical ID', color: '#ef4444' },
    { id: 'settings', label: 'Settings & Units', icon: Settings, desc: 'Target thresholds & profile', color: '#64748b' }
  ];

  const handleSelectMoreItem = (id) => {
    setIsMoreMenuOpen(false);
    onViewChange(id);
  };

  const isMoreActive = moreItems.some(item => item.id === currentView);

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

          {['Core', 'Lifestyle', 'Insights', 'Support'].map(section => {
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

      {/* Modern Progressive Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className={`nav-tab-btn ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
          aria-label="Home Dashboard"
        >
          <div className="nav-icon-wrap">
            <Home size={19} />
          </div>
          <span>Home</span>
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'glucose' ? 'active' : ''}`}
          onClick={() => onViewChange('glucose')}
          aria-label="Blood Glucose"
        >
          <div className="nav-icon-wrap">
            <Droplet size={19} />
          </div>
          <span>Glucose</span>
        </button>

        {/* Center Quick Action Floating Button */}
        <button
          className="nav-center-action-btn"
          onClick={onOpenQuickAction}
          aria-label="Quick Action Log"
        >
          <Plus size={24} strokeWidth={2.8} />
        </button>

        <button
          className={`nav-tab-btn ${currentView === 'food' ? 'active' : ''}`}
          onClick={() => onViewChange('food')}
          aria-label="Diet & Nutrition"
        >
          <div className="nav-icon-wrap">
            <Utensils size={19} />
          </div>
          <span>Diet</span>
        </button>

        <button
          className={`nav-tab-btn ${isMoreActive || isMoreMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMoreMenuOpen(true)}
          aria-label="More Features"
        >
          <div className="nav-icon-wrap">
            <LayoutGrid size={19} />
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* Progressive Mobile "More" Bottom Sheet Drawer */}
      {isMoreMenuOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setIsMoreMenuOpen(false)}>
          <div className="mobile-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle" />
            
            <div className="sheet-header">
              <div>
                <h3 className="sheet-title">All Health Modules</h3>
                <p className="sheet-subtitle">Progressive health tools at your fingertips</p>
              </div>
              <button 
                className="icon-btn" 
                onClick={() => setIsMoreMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-sheet-grid">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sheet-item-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectMoreItem(item.id)}
                  >
                    <div 
                      className="sheet-icon-wrap"
                      style={{ backgroundColor: `${item.color}18`, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="sheet-item-info">
                      <div className="sheet-item-name">{item.label}</div>
                      <div className="sheet-item-desc">{item.desc}</div>
                    </div>
                    <ChevronRight size={16} className="sheet-item-arrow" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
