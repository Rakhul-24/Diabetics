import express from 'express';
import {
  logGlucose, getGlucoseHistory,
  logHeartRate, getHeartRateHistory,
  logSteps, getStepsHistory,
  logSleep, getSleepHistory,
  syncHealthConnect
} from '../controllers/healthController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Glucose
router.post('/glucose', verifyToken, logGlucose);
router.get('/glucose', verifyToken, getGlucoseHistory);

// Heart Rate
router.post('/heart-rate', verifyToken, logHeartRate);
router.get('/heart-rate', verifyToken, getHeartRateHistory);

// Steps
router.post('/steps', verifyToken, logSteps);
router.get('/steps', verifyToken, getStepsHistory);

// Sleep
router.post('/sleep', verifyToken, logSleep);
router.get('/sleep', verifyToken, getSleepHistory);

// Smartwatch Health Connect Batch Sync
router.get('/sync-health-connect', verifyToken, syncHealthConnect);

export default router;
