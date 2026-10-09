// Progressive Web App Service Worker Registration

export function register() {
  if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('🔄 New GlucoCare update is ready. Please reload.');
                } else {
                  console.log('✅ GlucoCare offline content cached for progressive mobile use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('⚠️ Error during Service Worker registration:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
