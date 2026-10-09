import React, { useState, useEffect } from 'react';
import { Download, X, Share2, WifiOff, Smartphone, CheckCircle2 } from 'lucide-react';

export const InstallPwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if already running as standalone PWA or native webview
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(checkStandalone);

    // Check dismissed timestamp
    const dismissedTime = localStorage.getItem('glucocare_pwa_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000) {
      setIsDismissed(true);
    }

    // Android/Desktop Chrome install event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect app installed event
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice && !checkStandalone);

    // Online / Offline monitor
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSTip(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 4000);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIOSTip(false);
    localStorage.setItem('glucocare_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Offline Status Pill for Mobile */}
      {!isOnline && (
        <div className="mobile-offline-banner">
          <WifiOff size={14} />
          <span>Offline Mode &bull; Logging works offline & syncs automatically</span>
        </div>
      )}

      {/* Installed Success Toast */}
      {installedSuccess && (
        <div className="mobile-pwa-toast success">
          <CheckCircle2 size={18} />
          <span>GlucoCare App Installed! Launch it anytime from your home screen.</span>
        </div>
      )}

      {/* Progressive Web App Install Banner (only shown if not standalone & not dismissed) */}
      {!isStandalone && !isDismissed && (isInstallable || isIOS) && (
        <aside className="mobile-pwa-install-bar" aria-label="Install App Prompt">
          <div className="pwa-install-left">
            <div className="pwa-icon-thumb">
              <Smartphone size={18} />
            </div>
            <div className="pwa-text">
              <div className="pwa-title">Install GlucoCare App</div>
              <div className="pwa-subtitle">
                {isIOS 
                  ? 'Add to iPhone Home Screen for instant offline access' 
                  : 'Fast progressive mobile app & offline tracker'}
              </div>
            </div>
          </div>

          <div className="pwa-install-actions">
            <button 
              className="pwa-install-btn"
              onClick={isIOS ? () => setShowIOSTip(!showIOSTip) : handleInstallClick}
            >
              {isIOS ? <Share2 size={13} /> : <Download size={13} />}
              <span>{isIOS ? 'How to Install' : 'Install'}</span>
            </button>
            <button 
              className="pwa-close-btn"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X size={15} />
            </button>
          </div>

          {/* iOS Add to Home Screen Instructions Tooltip */}
          {showIOSTip && (
            <div className="ios-install-tooltip">
              <div className="ios-step">
                <span className="step-num">1</span>
                <span>Tap the <strong>Share</strong> button <Share2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> in Safari's bottom bar.</span>
              </div>
              <div className="ios-step">
                <span className="step-num">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="ios-step">
                <span className="step-num">3</span>
                <span>Tap <strong>Add</strong> in the top right corner. Done!</span>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%', marginTop: 6 }}
                onClick={() => setShowIOSTip(false)}
              >
                Got It
              </button>
            </div>
          )}
        </aside>
      )}
    </>
  );
};
