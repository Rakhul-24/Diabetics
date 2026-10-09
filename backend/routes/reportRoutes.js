import express from 'express';
import { getWeeklyReport, getMonthlyReport } from '../controllers/reportController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/weekly-report', verifyToken, getWeeklyReport);
router.get('/monthly-report', verifyToken, getMonthlyReport);

export default router;
