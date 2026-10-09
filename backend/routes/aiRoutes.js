import express from 'express';
import {
  generateRecommendation,
  dailyFoodRecommendation,
  chatWithAiCoach
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-recommendation', generateRecommendation);
router.post('/daily-food-recommendation', dailyFoodRecommendation);
router.post('/chat', chatWithAiCoach);

export default router;

