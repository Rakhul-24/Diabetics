/**
 * ============================================================================
 * GlucoCare AI - Mobile Background Step Tracker Service
 * ============================================================================
 * Provides automatic, continuous step detection on mobile devices (Android & iOS).
 * 
 * Key Features:
 * 1. Adaptive Dynamic Baseline: Automatically detects whether device returns
 *    linear acceleration (0g) or gravity-inclusive acceleration (~9.8m/s²).
 *    Works in hand, pocket, purse, or upside-down.
 * 2. Background Audio Keep-Alive: Synthesizes a silent audio loop via standard
 *    Web Audio API / WAV Blob so mobile browsers (Android Chrome, iOS Safari)
 *    keep the JavaScript thread and motion sensors active when the phone screen
 *    is turned off or placed in a pocket.
 * 3. Hysteresis Peak-Valley Detection: Prevents double-counting and eliminates
 *    false positives from accidental phone bumps or vibrations.
 * 4. Screen WakeLock API: Keeps the screen awake during active walk sessions.
 * 5. iOS Safari Permission Management: Handles DeviceMotionEvent.requestPermission
 *    transparently with friendly one-tap prompts.
 * ============================================================================
 */

// Generate a valid 1-second inaudible WAV audio Blob URL for background keepalive
function createSilentAudioUrl() {
  try {
    const sampleRate = 8000;
    const numSamples = 8000; // 1 second of silence
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeAscii(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples, true);
    writeAscii(view, 8, 'WAVE');

    // "fmt " sub-chunk
    writeAscii(view, 12, 'fmt ');
    view.setUint32(16, 16, true);      // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);       // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);       // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 1, true);       // BlockAlign
    view.setUint16(34, 8, true);       // BitsPerSample (8-bit)

    // "data" sub-chunk
    writeAscii(view, 36, 'data');
    view.setUint32(40, numSamples, true);

    // 8-bit PCM silence is value 128 (0x80)
    for (let i = 0; i < numSamples; i++) {
      view.setUint8(44 + i, 128);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to synthesize silent audio WAV:', err);
    return null;
  }
}

function writeAscii(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

class StepTrackerService {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.backgroundKeepAliveEnabled = true;

    // Sensitivity presets (threshold in m/s² above dynamic baseline)
    this.sensitivity = 'normal'; // 'low', 'normal', 'high'
    this.thresholds = {
      high: 1.3,   // Light walking / loose pocket / handbag
      normal: 1.8, // Standard pocket or in-hand walking
      low: 2.5     // Brisk walking / jogging / avoids bumps
    };

    // Adaptive Baseline & Signal Filtering
    this.baseline = null;          // Adaptive gravity/orientation baseline
    this.lastMagnitude = null;
    this.smoothDelta = 0;
    this.isRising = false;
    this.lastStepTime = 0;
    this.minStepIntervalMs = 260;  // Debounce (~max 230 steps/min sprint)

    // Walking status & Cadence
    this.isWalking = false;
    this.cadence = 0;              // Steps per minute
    this.stepTimestamps = [];
    this.walkingTimeout = null;

    // Sensor raw & derived values
    this.sensorValues = {
      x: 0,
      y: 0,
      z: 0,
      magnitude: 0,
      dynamicDelta: 0
    };
    this.motionIntensity = 0;     // 0 to 100%

    // Sensor status: 'active', 'waiting-motion', 'permission-needed', 'unsupported', 'paused'
    this.sensorStatus = 'waiting-motion';

    // Background Audio Element
    this.audioElement = null;
    this.silentAudioUrl = null;
    this.audioKeepAliveStarted = false;

    // Screen Wake Lock
    this.wakeLock = null;

    // Event Subscribers
    this.listeners = {
      step: new Set(),
      metrics: new Set(),
      status: new Set()
    };

    // Bind methods
    this.handleDeviceMotion = this.handleDeviceMotion.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFirstUserGesture = this.handleFirstUserGesture.bind(this);
  }

  /**
   * Initialize Step Tracking Service
   */
  init() {
    if (typeof window === 'undefined') return;

    // Load persisted settings
    const savedActive = localStorage.getItem('glucocare_step_tracking_active');
    this.isActive = savedActive !== null ? savedActive === 'true' : true;

    const savedKeepAlive = localStorage.getItem('glucocare_background_audio');
    this.backgroundKeepAliveEnabled = savedKeepAlive !== null ? savedKeepAlive === 'true' : true;

    const savedSensitivity = localStorage.getItem('glucocare_step_sensitivity');
    if (savedSensitivity && this.thresholds[savedSensitivity]) {
      this.sensitivity = savedSensitivity;
    }

    // Prepare silent audio buffer
    this.silentAudioUrl = createSilentAudioUrl();
    if (this.silentAudioUrl) {
      try {
        this.audioElement = new Audio(this.silentAudioUrl);
        this.audioElement.loop = true;
        this.audioElement.volume = 0.01; // Inaudible tiny volume
      } catch (e) {
        console.warn('Audio element init error:', e);
      }
    }

    // Attach visibility change listener to keep alive when minimized
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Register user interaction listener for audio keepalive & iOS permissions
    window.addEventListener('click', this.handleFirstUserGesture, { once: true });
    window.addEventListener('touchstart', this.handleFirstUserGesture, { once: true });

    // Start tracking if active
    if (this.isActive) {
      this.start();
    } else {
      this.setSensorStatus('paused');
    }
  }

  /**
   * Triggered on the first user interaction on the screen
   * Used to unlock HTML5 audio keep-alive and quietly check iOS sensor permission
   */
  handleFirstUserGesture() {
    // Attempt starting background audio keep-alive
    if (this.backgroundKeepAliveEnabled && !this.audioKeepAliveStarted) {
      this.startAudioKeepAlive();
    }

    // On iOS Safari, check if permission is required
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function' &&
      this.sensorStatus === 'permission-needed'
    ) {
      this.requestPermission();
    }
  }

  /**
   * Start or resume background audio keep-alive
   */
  startAudioKeepAlive() {
    if (!this.audioElement || !this.backgroundKeepAliveEnabled) return;
    try {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.audioKeepAliveStarted = true;
          })
          .catch(() => {
            // Browser autoplay restrictions may require explicit button tap
            this.audioKeepAliveStarted = false;
          });
      }
    } catch (e) {}
  }

  /**
   * Stop background audio keep-alive
   */
  stopAudioKeepAlive() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioKeepAliveStarted = false;
      } catch (e) {}
    }
  }

  /**
   * Handle document visibility state change (e.g. app sent to background / screen locked)
   */
  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // App went to background (phone in pocket / locked)
      if (this.isActive && this.backgroundKeepAliveEnabled) {
        this.startAudioKeepAlive();
      }
    } else if (document.visibilityState === 'visible') {
      // App came back to foreground: ensure sensor listener is attached
      if (this.isActive && !this.isListening) {
        this.attachMotionListener();
      }
      this.emitMetrics();
    }
  }

  /**
   * Request Motion Permission (required for iOS Safari 13+)
   */
  async requestPermission() {
    if (typeof window === 'undefined') return false;

    // Check iOS Safari permission API
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          this.setSensorStatus('active');
          this.startAudioKeepAlive();
          this.attachMotionListener();
          return true;
        } else {
          this.setSensorStatus('permission-needed');
          return false;
        }
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        this.setSensorStatus('permission-needed');
        return false;
      }
    }

    // Android & standard browsers (granted by default in secure context)
    this.startAudioKeepAlive();
    this.attachMotionListener();
    return true;
  }

  /**
   * Start Step Tracking
   */
  start() {
    this.isActive = true;
    localStorage.setItem('glucocare_step_tracking_active', 'true');

    this.attachMotionListener();

    if (this.backgroundKeepAliveEnabled) {
      this.startAudioKeepAlive();
    }
  }

  /**
   * Pause Step Tracking
   */
  pause() {
    this.isActive = false;
    localStorage.setItem('glucocare_step_tracking_active', 'false');
    this.detachMotionListener();
    this.stopAudioKeepAlive();
    this.releaseWakeLock();
    this.isWalking = false;
    this.cadence = 0;
    this.setSensorStatus('paused');
    this.emitMetrics();
  }

  /**
   * Toggle Step Tracking
   */
  toggle() {
    if (this.isActive) {
      this.pause();
    } else {
      this.start();
    }
    return this.isActive;
  }

  /**
   * Attach devicemotion window listener
   */
  attachMotionListener() {
    if (typeof window === 'undefined') return;

    if (!window.DeviceMotionEvent) {
      this.setSensorStatus('unsupported');
      return;
    }

    // Check iOS Safari permission requirement
    if (
      typeof DeviceMotionEvent.requestPermission === 'function' &&
      this.sensorStatus !== 'active'
    ) {
      this.setSensorStatus('permission-needed');
    }

    if (this.isListening) return;

    try {
      window.addEventListener('devicemotion', this.handleDeviceMotion, { passive: true });
      this.isListening = true;
      if (this.sensorStatus !== 'permission-needed') {
        this.setSensorStatus('active');
      }
    } catch (e) {
      console.warn('Error attaching devicemotion listener:', e);
      this.setSensorStatus('unsupported');
    }
  }

  /**
   * Detach devicemotion listener
   */
  detachMotionListener() {
    if (typeof window === 'undefined') return;
    try {
      window.removeEventListener('devicemotion', this.handleDeviceMotion);
      this.isListening = false;
    } catch (e) {}
  }

  /**
   * Core Motion & Step Detection Algorithm
   * Uses Adaptive Dynamic Baseline + Hysteresis Peak-Valley
   */
  handleDeviceMotion(event) {
    if (!this.isActive) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // 3D vector magnitude: sqrt(x^2 + y^2 + z^2)
    const rawMag = Math.sqrt(x * x + y * y + z * z);
    if (isNaN(rawMag) || rawMag === 0) return;

    // ── 1. ADAPTIVE DYNAMIC BASELINE FILTER ──────────────────────────────────
    // Automatically adapts to linear acceleration (0g) or gravity-inclusive (9.8g),
    // and adapts smoothly to any phone tilt/orientation in hand or pocket.
    if (this.baseline === null) {
      this.baseline = rawMag;
    } else {
      // Slow exponential moving average for orientation/gravity baseline
      this.baseline = (this.baseline * 0.96) + (rawMag * 0.04);
    }

    // Dynamic delta represents user motion above stationary baseline
    const dynamicDelta = Math.abs(rawMag - this.baseline);

    // Low-pass filter for smooth signal
    this.smoothDelta = (this.smoothDelta * 0.3) + (dynamicDelta * 0.7);

    // Compute live motion intensity (0 - 100%)
    const intensity = Math.min(100, Math.round(this.smoothDelta * 28));
    this.motionIntensity = intensity;

    this.sensorValues = {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      magnitude: Number(rawMag.toFixed(2)),
      dynamicDelta: Number(this.smoothDelta.toFixed(2))
    };

    const now = Date.now();
    const threshold = this.thresholds[this.sensitivity] || 1.8;
    const valleyThreshold = threshold * 0.38; // Hysteresis valley to reset
    const timeSinceLastStep = now - this.lastStepTime;

    // ── 2. HYSTERESIS PEAK-VALLEY STEP DETECTOR ─────────────────────────────
    // Step peak: signal rises past threshold with minimum interval debounce
    if (this.smoothDelta > threshold && !this.isRising && timeSinceLastStep > this.minStepIntervalMs) {
      this.isRising = true;
    } else if (this.smoothDelta < valleyThreshold && this.isRising) {
      // Valley reached: confirm completed step
      this.isRising = false;
      this.lastStepTime = now;
      this.triggerStepDetected(1);
    }

    this.lastMagnitude = rawMag;
    this.emitMetrics();
  }

  /**
   * Internal Step Detected handler
   */
  triggerStepDetected(count = 1) {
    const now = Date.now();

    // Notify all step listeners (e.g. HealthContext)
    this.listeners.step.forEach((callback) => {
      try {
        callback(count);
      } catch (e) {
        console.error('Error in step listener:', e);
      }
    });

    // Mark walking active
    this.isWalking = true;
    if (this.walkingTimeout) clearTimeout(this.walkingTimeout);
    this.walkingTimeout = setTimeout(() => {
      this.isWalking = false;
      this.cadence = 0;
      this.emitMetrics();
    }, 2800);

    // Calculate live cadence (steps/min based on last 8 seconds)
    this.stepTimestamps.push(now);
    const windowStart = now - 8000;
    this.stepTimestamps = this.stepTimestamps.filter((t) => t >= windowStart);
    const recentCount = this.stepTimestamps.length;
    this.cadence = Math.round((recentCount / 8) * 60);

    this.emitMetrics();
  }

  /**
   * Screen WakeLock API
   */
  async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
        return true;
      } catch (err) {
        console.warn('Screen WakeLock error:', err);
        return false;
      }
    }
    return false;
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
        this.wakeLock = null;
      } catch (e) {}
    }
  }

  /**
   * Set Sensitivity ('low', 'normal', 'high')
   */
  setSensitivity(level) {
    if (this.thresholds[level]) {
      this.sensitivity = level;
      localStorage.setItem('glucocare_step_sensitivity', level);
      this.emitMetrics();
    }
  }

  /**
   * Toggle Background Audio Keep-Alive
   */
  setBackgroundKeepAlive(enabled) {
    this.backgroundKeepAliveEnabled = !!enabled;
    localStorage.setItem('glucocare_background_audio', String(this.backgroundKeepAliveEnabled));
    if (this.backgroundKeepAliveEnabled && this.isActive) {
      this.startAudioKeepAlive();
    } else {
      this.stopAudioKeepAlive();
    }
    this.emitMetrics();
  }

  setSensorStatus(status) {
    this.sensorStatus = status;
    this.listeners.status.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {}
    });
  }

  /**
   * Subscription methods
   */
  onStep(callback) {
    this.listeners.step.add(callback);
    return () => this.listeners.step.delete(callback);
  }

  onMetrics(callback) {
    this.listeners.metrics.add(callback);
    return () => this.listeners.metrics.delete(callback);
  }

  onStatus(callback) {
    this.listeners.status.add(callback);
    return () => this.listeners.status.delete(callback);
  }

  emitMetrics() {
    const payload = {
      isActive: this.isActive,
      isWalking: this.isWalking,
      cadence: this.cadence,
      motionIntensity: this.motionIntensity,
      sensorValues: this.sensorValues,
      sensorStatus: this.sensorStatus,
      sensitivity: this.sensitivity,
      backgroundKeepAlive: this.backgroundKeepAliveEnabled,
      hasKeepAliveAudio: this.audioKeepAliveStarted
    };

    this.listeners.metrics.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {}
    });
  }
}

// Export singleton instance
export const stepTrackerService = new StepTrackerService();
