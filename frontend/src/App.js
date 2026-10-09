import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { HealthProvider } from './context/HealthContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { GlucoseLogModal } from './components/common/GlucoseLogModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Views
import { DashboardView } from './views/DashboardView';
import { GlucoseView } from './views/GlucoseView';
import { FoodView } from './views/FoodView';
import { MedicationView } from './views/MedicationView';
import { ExerciseView } from './views/ExerciseView';
import { WaterView } from './views/WaterView';
import { SleepView } from './views/SleepView';
import { AiCoachView } from './views/AiCoachView';
import { ReportsView } from './views/ReportsView';
import { EmergencyView } from './views/EmergencyView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';
import { useHealth } from './context/HealthContext';

function AppContent() {
  const { isAuthenticated } = useHealth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isGlucoseModalOpen, setIsGlucoseModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onViewChange={setCurrentView}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
          />
        );
      case 'glucose':
        return (
          <GlucoseView
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
          />
        );
      case 'food':
        return <FoodView />;
      case 'medications':
        return <MedicationView />;
      case 'exercise':
        return <ExerciseView onViewChange={setCurrentView} />;
      case 'water':
        return <WaterView />;
      case 'sleep':
        return <SleepView />;
      case 'ai-coach':
        return <AiCoachView />;
      case 'reports':
        return <ReportsView />;
      case 'step-tracker':
      case 'google-fit':
      case 'bluetooth':
        return <ExerciseView onViewChange={setCurrentView} />;
      case 'emergency':
        return <EmergencyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onViewChange={setCurrentView}
            onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      {/* Responsive Navigation: Desktop Sidebar + Mobile Bottom Bar */}
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        <main style={{ minHeight: 'calc(100vh - var(--header-height) - var(--bottom-nav-height))' }}>
          {renderView()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenGlucoseModal={() => setIsGlucoseModalOpen(true)}
        onViewChange={setCurrentView}
      />

      <GlucoseLogModal
        isOpen={isGlucoseModalOpen}
        onClose={() => setIsGlucoseModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onViewChange={setCurrentView}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HealthProvider>
        <AppContent />
      </HealthProvider>
    </ThemeProvider>
  );
}
