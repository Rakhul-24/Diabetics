// API Service to communicate with Express Backend
const BASE_URL = process.env.REACT_APP_API_URL || 'https://diabetics-sfa9.onrender.com/api';

export const apiService = {
  // AI Recommendation & Chat
  async generateAiRecommendation(userProfile, recentGlucose) {
    try {
      const response = await fetch(`${BASE_URL}/ai/generate-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userProfile, readings: recentGlucose })
      });
      if (!response.ok) throw new Error('API failed');
      return await response.json();
    } catch (err) {
      console.warn('Using local AI engine:', err.message);
      return null;
    }
  },

  // Daily AI Glucose Analysis, Food & Steps Recommendation with Gemini API Key
  async getDailyFoodRecommendation(userProfile, glucoseReadings, apiKey, healthRecords = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(`${BASE_URL}/ai/daily-food-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userProfile,
          readings: glucoseReadings,
          records: healthRecords,
          apiKey
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn('Backend daily food recommendation unavailable:', err.message);
      return null;
    }
  },


  // Interactive AI Chat
  async generateChat(message, context) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      const data = await response.json();
      return data.reply || data.response || null;
    } catch (err) {
      return null;
    }
  },

  // Sync health metrics
  async syncGlucose(reading) {
    try {
      const response = await fetch(`${BASE_URL}/health/glucose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reading)
      });
      return await response.json();
    } catch (err) {
      return { success: true, localOnly: true };
    }
  },

  // Health check
  async checkHealth() {
    try {
      const healthUrl = BASE_URL.replace(/\/api$/, '') + '/health';
      const res = await fetch(healthUrl);
      return await res.json();
    } catch (e) {
      return { status: 'offline' };
    }
  }
};
