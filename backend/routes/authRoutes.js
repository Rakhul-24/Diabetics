import express from 'express';
import { register, login, googleLogin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', verifyToken, register);
router.post('/login', verifyToken, login);
router.post('/google-login', verifyToken, googleLogin);

export default router;
