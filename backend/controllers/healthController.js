import { db } from '../config/firebase.js';
import { evaluateGlucoseStatus } from '../utils/helpers.js';

// ── Blood Glucose ──────────────────────────────────────────────────────────
export async function logGlucose(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { readingMg, type, notes, timestamp } = req.body;

    const valMg = parseFloat(readingMg);
    const valMmol = parseFloat((valMg / 18.018).toFixed(1));
    const evaluation = evaluateGlucoseStatus(valMg);

    const docData = {
      userId: uid,
      readingMg: valMg,
      readingMmol: valMmol,
      type: type || 'random',
      status: evaluation.status,
      isDangerous: evaluation.isDangerous,
      notes: notes || '',
      timestamp: timestamp || new Date().toISOString()
    };

    const docRef = await db.collection('glucose_readings').add(docData);
    docData.id = docRef.id;

    // If glucose is in dangerous range (<70 or >250), log an emergency notification automatically
    if (evaluation.isDangerous) {
      await db.collection('notifications').add({
        userId: uid,
        title: '🚨 DANGER: Blood Glucose Warning',
        body: `Your glucose level (${valMg} mg/dL) is outside the safe range (70–250 mg/dL). Please consult your doctor immediately!`,
        type: 'dangerAlert',
        isRead: false,
        actionRoute: '/emergency',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(201).json({
      success: true,
      message: evaluation.isDangerous
        ? '🚨 WARNING: Blood glucose is in dangerous range! Emergency notification logged.'
        : 'Blood glucose reading saved successfully.',
      reading: docData
    });
  } catch (error) {
    next(error);
  }
}

export async function getGlucoseHistory(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const snapshot = await db.collection('glucose_readings').where('userId', '==', uid).get();

    const readings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({
      success: true,
      count: readings.length,
      readings
    });
  } catch (error) {
    next(error);
  }
}

// ── Heart Rate ─────────────────────────────────────────────────────────────
export async function logHeartRate(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { bpm, source, timestamp } = req.body;

    const data = {
      userId: uid,
      bpm: parseInt(bpm, 10),
      source: source || 'healthConnect',
      timestamp: timestamp || new Date().toISOString()
    };

    const docRef = await db.collection('heart_rate').add(data);
    data.id = docRef.id;

    return res.status(201).json({ success: true, heartRate: data });
  } catch (error) {
    next(error);
  }
}

export async function getHeartRateHistory(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const snapshot = await db.collection('heart_rate').where('userId', '==', uid).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
}

// ── Steps ──────────────────────────────────────────────────────────────────
export async function logSteps(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { steps, distanceKm, caloriesBurned, date } = req.body;

    const data = {
      userId: uid,
      steps: parseInt(steps, 10),
      distanceKm: parseFloat(distanceKm || 0),
      caloriesBurned: parseInt(caloriesBurned || 0, 10),
      date: date || new Date().toISOString()
    };

    const docRef = await db.collection('steps').add(data);
    data.id = docRef.id;

    return res.status(201).json({ success: true, steps: data });
  } catch (error) {
    next(error);
  }
}

export async function getStepsHistory(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const snapshot = await db.collection('steps').where('userId', '==', uid).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
}

// ── Sleep ──────────────────────────────────────────────────────────────────
export async function logSleep(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { bedTime, wakeTime, quality, deepSleep, remSleep, lightSleep } = req.body;

    const data = {
      userId: uid,
      bedTime,
      wakeTime,
      quality: quality || 'fair',
      deepSleep: parseFloat(deepSleep || 1.5),
      remSleep: parseFloat(remSleep || 1.8),
      lightSleep: parseFloat(lightSleep || 3.7),
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('sleep').add(data);
    data.id = docRef.id;

    return res.status(201).json({ success: true, sleep: data });
  } catch (error) {
    next(error);
  }
}

export async function getSleepHistory(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const snapshot = await db.collection('sleep').where('userId', '==', uid).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
}

// ── Smartwatch Health Connect Batch Sync ────────────────────────────────────
export async function syncHealthConnect(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';

    // Simulated smartwatch sync payload
    const syncResult = {
      syncedAt: new Date().toISOString(),
      heartRateCount: 14,
      stepsToday: 5200,
      sleepHours: 6.75,
      caloriesBurned: 208,
      device: 'Google Pixel Watch / Health Connect'
    };

    return res.status(200).json({
      success: true,
      message: 'Health Connect data successfully synchronized with backend.',
      syncResult
    });
  } catch (error) {
    next(error);
  }
}
