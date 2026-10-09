import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', verifyToken, sendNotification);
router.get('/', verifyToken, getNotifications);

export default router;
