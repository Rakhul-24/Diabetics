import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40
      }
    });
    console.log(`🤖 Google Gemini API Client initialized successfully (${GEMINI_MODEL_NAME}).`);
  } catch (err) {
    console.warn('⚠️ Gemini API Init Warning:', err.message);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured — using Intelligent Fallback Rule Engine for AI recommendations.');
}

export function getGeminiModel(customApiKey, config = {}) {
  const key = (customApiKey && customApiKey.trim() && customApiKey !== 'your_gemini_api_key_here')
    ? customApiKey.trim()
    : apiKey;

  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const client = new GoogleGenerativeAI(key);
    return client.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        ...config
      }
    });
  } catch (err) {
    console.warn('⚠️ Gemini Client Instantiation Warning:', err.message);
    return null;
  }
}

export { genAI, model };

