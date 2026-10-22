import express from 'express';
import {
  generateRecommendation,
  dailyFoodRecommendation,
  chatWithAiCoach,
  preMealRecommendation
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-recommendation', generateRecommendation);
router.post('/daily-food-recommendation', dailyFoodRecommendation);
router.post('/pre-meal-recommendation', preMealRecommendation);
router.post('/chat', chatWithAiCoach);

export default router;


