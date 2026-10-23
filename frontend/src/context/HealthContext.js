import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  initialUser,
  initialGlucoseReadings,
  initialMedications,
  initialMealPlan,
  initialExercises,
  initialNotifications,
  initialSleepData,
  initialWaterData,
  initialStepsData,
  initialStepHistory,
  getTodayDateString
} from '../services/mockData';
import { apiService } from '../services/api';
import { DiabetesAiEngine } from '../services/aiService';
import { stepTrackerService } from '../services/stepTrackerService';
import {
  generatePreMealRecommendation,
  getUpcomingMealWindow,
  calculateWalkingCalories
} from '../services/preMealRecommendationAlgorithm';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  // 1. User Profile State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('glucocare_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  // 2. Glucose Readings State
  const [glucoseReadings, setGlucoseReadings] = useState(() => {
    const saved = localStorage.getItem('glucocare_glucose');
    return saved ? JSON.parse(saved) : initialGlucoseReadings;
  });

  // 3. Medications State
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('glucocare_meds');
    return saved ? JSON.parse(saved) : initialMedications;
  });

  // 4. Meal Plan State (Daily reset: clears yesterday's custom items & marks all meals un-eaten)
  const [mealPlan, setMealPlan] = useState(() => {
    const saved = localStorage.getItem('glucocare_meals');
    const today = getTodayDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.date || parsed.date !== today) {
        // New day: reset all meals' eaten status to false, reset to baseline plan with date
        const resetMeals = {};
        const baseline = initialMealPlan.meals || {};
        ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(cat => {
          resetMeals[cat] = (baseline[cat] || []).map(m => ({ ...m, eaten: false }));
        });
        const fresh = { ...initialMealPlan, date: today, meals: resetMeals };
        localStorage.setItem('glucocare_meals', JSON.stringify(fresh));
        return fresh;
      }
      return parsed;
    }
    const resetMeals = {};
    const baseline = initialMealPlan.meals || {};
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(cat => {
      resetMeals[cat] = (baseline[cat] || []).map(m => ({ ...m, eaten: false }));
    });
    return { ...initialMealPlan, date: today, meals: resetMeals };
  });

  // 4b. Daily AI Food Recommendation State (resets daily)
  const [dailyFoodPlan, setDailyFoodPlan] = useState(() => {
    const saved = localStorage.getItem('glucocare_daily_food_plan');
    const today = getTodayDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date && parsed.date !== today) {
        localStorage.removeItem('glucocare_daily_food_plan');
        return null;
      }
      return parsed;
    }
    return null;
  });
  const [isAnalyzingFoodPlan, setIsAnalyzingFoodPlan] = useState(false);
  const [foodPlanSource, setFoodPlanSource] = useState('Google Gemini 2.5 Flash');

  // 4c. Pre-Meal (1-Hour Before) Food Recommendation State
  const [preMealPlan, setPreMealPlan] = useState(() => {
    const saved = localStorage.getItem('glucocare_pre_meal_plan');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [isGeneratingPreMealPlan, setIsGeneratingPreMealPlan] = useState(false);
  const [upcomingMealInfo, setUpcomingMealInfo] = useState(() => getUpcomingMealWindow(initialUser?.mealTimes));

  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem('glucocare_exercises');
    const today = getTodayDateString();
    const lastReset = localStorage.getItem('glucocare_last_reset_date');
    if (saved && lastReset === today) {
      return JSON.parse(saved);
    }
    const fresh = (saved ? JSON.parse(saved) : initialExercises).map(ex => ({ ...ex, completed: false }));
    return fresh;
  });

  // 6. Water State (Daily reset: starts at 0 ml on each new day)
  const [waterData, setWaterData] = useState(() => {
    const saved = localStorage.getItem('glucocare_water');
    const today = getTodayDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.date || parsed.date !== today) {
        const fresh = { ...initialWaterData, currentMl: 0, logs: [], date: today };
        localStorage.setItem('glucocare_water', JSON.stringify(fresh));
        return fresh;
      }
      return parsed;
    }
    return { ...initialWaterData, currentMl: 0, logs: [], date: today };
  });

  // 7. Sleep State (Daily reset: starts at 0 hrs / unrecorded for today, archives yesterday)
  const [sleepData, setSleepData] = useState(() => {
    const saved = localStorage.getItem('glucocare_sleep');
    const today = getTodayDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.date || parsed.date !== today) {
        const prevHours = parsed.lastNightDurationHours || 0;
        let hist = parsed.history || initialSleepData.history || [];
        if (parsed.date && prevHours > 0) {
          const prevDateObj = new Date(parsed.date);
          const dayLabel = isNaN(prevDateObj.getTime())
            ? 'Day'
            : prevDateObj.toLocaleDateString('en-US', { weekday: 'short' });
          hist = [...hist.slice(-6), { day: dayLabel, hours: prevHours, quality: parsed.qualityScore || 80 }];
        }
        const freshSleep = {
          ...initialSleepData,
          lastNightDurationHours: 0,
          qualityScore: 0,
          qualityLabel: 'Not recorded yet',
          bedTime: '--:--',
          wakeTime: '--:--',
          deepSleepHours: 0,
          remSleepHours: 0,
          lightSleepHours: 0,
          history: hist,
          date: today
        };
        localStorage.setItem('glucocare_sleep', JSON.stringify(freshSleep));
        return freshSleep;
      }
      return parsed;
    }
    return { ...initialSleepData, date: today };
  });

  // 0. Auth & Session State (Default to false for every new visitor)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('glucocare_auth');
    return savedAuth === 'true';
  });

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('glucocare_auth', 'false');
    setNotifications(prev => [
      {
        id: 'n_out_' + Date.now(),
        title: '🔒 Signed Out',
        body: 'You have been safely signed out. Your records remain secure on this device.',
        type: 'info',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const login = (customProfile = null, options = {}) => {
    if (customProfile) {
      setUser(customProfile);
      localStorage.setItem('glucocare_user', JSON.stringify(customProfile));

      // Brand-new registered user: initialize clean baseline records for them
      if (options.isNewUser) {
        const starterGlucose = [
          {
            id: 'g_' + Date.now(),
            value: customProfile.targetGlucoseMin ? Math.round((Number(customProfile.targetGlucoseMin) + Number(customProfile.targetGlucoseMax || 140)) / 2) : 100,
            type: 'fasting',
            notes: 'Initial baseline record on account creation',
            timestamp: new Date().toISOString(),
            status: 'normal'
          }
        ];
        setGlucoseReadings(starterGlucose);
        localStorage.setItem('glucocare_glucose', JSON.stringify(starterGlucose));

        setMedications([]);
        localStorage.setItem('glucocare_meds', JSON.stringify([]));

        const welcomeNotification = [
          {
            id: 'n_wel_' + Date.now(),
            title: `🎉 Welcome to GlucoCare, ${customProfile.name?.split(' ')[0] || 'User'}!`,
            body: `Your personalized diabetes profile for ${customProfile.diabetesType || 'Diabetes Management'} has been created. Start logging your glucose and meals!`,
            type: 'success',
            isRead: false,
            timestamp: new Date().toISOString()
          }
        ];
        setNotifications(welcomeNotification);
        localStorage.setItem('glucocare_notifications', JSON.stringify(welcomeNotification));

        // Create fresh personalized chat for new user
        const newChatKey = getUserChatKey(customProfile);
        const starterChat = getInitialAiMessages(customProfile, starterGlucose[0]?.value || 100);
        setAiChatMessages(starterChat);
        localStorage.setItem(newChatKey, JSON.stringify(starterChat));
      } else {
        // Existing user: load their own records & chat history
        const userEmailKey = (customProfile?.email || customProfile?.id || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

        const userGlucoseKey = `glucocare_glucose_${userEmailKey}`;
        const savedGlucose = localStorage.getItem(userGlucoseKey);
        if (savedGlucose) {
          try {
            setGlucoseReadings(JSON.parse(savedGlucose));
          } catch {}
        }

        const userMedsKey = `glucocare_meds_${userEmailKey}`;
        const savedMeds = localStorage.getItem(userMedsKey);
        if (savedMeds) {
          try {
            setMedications(JSON.parse(savedMeds));
          } catch {}
        }

        const userChatKey = getUserChatKey(customProfile);
        const savedChat = localStorage.getItem(userChatKey);
        if (savedChat) {
          try {
            setAiChatMessages(JSON.parse(savedChat));
          } catch {}
        } else {
          const starterChat = getInitialAiMessages(customProfile, 110);
          setAiChatMessages(starterChat);
          localStorage.setItem(userChatKey, JSON.stringify(starterChat));
        }
      }
    }
    setIsAuthenticated(true);
    localStorage.setItem('glucocare_auth', 'true');
  };

  // 8. Steps & Step History State
  const [stepsData, setStepsData] = useState(() => {
    const saved = localStorage.getItem('glucocare_steps');
    const today = getTodayDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        return parsed;
      } else if (parsed.date) {
        // Saved data is from a past day! Archive it immediately
        try {
          const prevDateObj = new Date(parsed.date);
          const dayLabel = isNaN(prevDateObj.getTime())
            ? 'Day'
            : prevDateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const histSaved = localStorage.getItem('glucocare_step_history');
          const hist = histSaved ? JSON.parse(histSaved) : initialStepHistory;
          const filtered = hist.filter(h => h.date !== parsed.date);
          const record = {
            date: parsed.date,
            day: dayLabel,
            steps: parsed.current || 0,
            goal: parsed.goal || 8000,
            distanceKm: parsed.distanceKm || 0,
            caloriesBurned: parsed.caloriesBurned || 0,
            achieved: (parsed.current || 0) >= (parsed.goal || 8000)
          };
          localStorage.setItem('glucocare_step_history', JSON.stringify([...filtered, record]));
        } catch (e) {}

        // Reset steps for today
        const fresh = {
          date: today,
          goal: parsed.goal || 8000,
          current: 0,
          distanceKm: 0,
          caloriesBurned: 0,
          weeklyAvg: parsed.weeklyAvg || 7850,
          streakDays: parsed.streakDays || 0
        };
        localStorage.setItem('glucocare_steps', JSON.stringify(fresh));
        return fresh;
      }
    }
    return { ...initialStepsData, date: today };
  });

  const [stepHistory, setStepHistory] = useState(() => {
    const saved = localStorage.getItem('glucocare_step_history');
    return saved ? JSON.parse(saved) : initialStepHistory;
  });

  // 8b. Pre-Meal Walking Activity State (Before Breakfast, Before Lunch, Before Dinner)
  const [preMealWalks, setPreMealWalks] = useState(() => {
    const saved = localStorage.getItem('glucocare_pre_meal_walks');
    const today = getTodayDateString();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) return parsed;
      } catch {}
    }
    const curSteps = (stepsData?.current) || 0;
    const bSteps = Math.min(curSteps, 1200);
    const lSteps = Math.max(0, Math.min(curSteps - bSteps, 1500));
    const dSteps = Math.max(0, curSteps - bSteps - lSteps);
    const userW = Number(user?.weight) || 72;
    const calcCals = (s) => Math.round(s * 0.04 * (userW / 70));

    const initialWalks = {
      date: today,
      breakfast: {
        steps: bSteps,
        targetSteps: 2500,
        caloriesBurned: calcCals(bSteps),
        distanceKm: Number((bSteps * 0.00075).toFixed(2)),
        durationMins: Math.round(bSteps / 100),
        isCompleted: bSteps >= 2500
      },
      lunch: {
        steps: lSteps,
        targetSteps: 3000,
        caloriesBurned: calcCals(lSteps),
        distanceKm: Number((lSteps * 0.00075).toFixed(2)),
        durationMins: Math.round(lSteps / 100),
        isCompleted: lSteps >= 3000
      },
      dinner: {
        steps: dSteps,
        targetSteps: 2500,
        caloriesBurned: calcCals(dSteps),
        distanceKm: Number((dSteps * 0.00075).toFixed(2)),
        durationMins: Math.round(dSteps / 100),
        isCompleted: dSteps >= 2500
      }
    };
    return initialWalks;
  });

  // 9. Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('glucocare_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Helper: get unique storage key for each user's AI chat
  const getUserChatKey = (u) => {
    const id = (u?.email || u?.id || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `glucocare_ai_chat_${id}`;
  };

  // Helper: create distinct, personalized initial message for each user
  const getInitialAiMessages = (u, latestG = 114) => {
    const name = u?.name?.split(' ')[0] || u?.name || 'there';
    const type = u?.diabetesType || 'Type 2 Diabetes';
    const targetMin = u?.targetGlucoseMin || 70;
    const targetMax = u?.targetGlucoseMax || 140;

    return [
      {
        id: 'm-init-' + Date.now(),
        sender: 'ai',
        text: `Hello ${name}! 👋 I am your dedicated AI Diabetes Care Coach, personalized for your **${type}** management.\n\n` +
          `• **Target Range**: **${targetMin} – ${targetMax} mg/dL**\n` +
          `• **Current Blood Sugar**: **${latestG} mg/dL**\n\n` +
          `Ask me anything about your glucose trends, authentic low-GI Indian meals, post-meal workouts, or medication routines!`,
        timestamp: new Date().toISOString()
      }
    ];
  };

  // 10. AI Chat Messages (Per-User Storage)
  const [aiChatMessages, setAiChatMessages] = useState(() => {
    const key = getUserChatKey(user);
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    const legacy = localStorage.getItem('glucocare_ai_chat');
    if (legacy && (!user?.email || user?.email === 'arjun.mehta@example.com')) {
      try { return JSON.parse(legacy); } catch {}
    }
    return getInitialAiMessages(user, initialGlucoseReadings[0]?.readingMg || 114);
  });
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Synchronize AI chat when active user changes
  useEffect(() => {
    if (!user) return;
    const key = getUserChatKey(user);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setAiChatMessages(JSON.parse(saved));
        return;
      } catch {}
    }
    const fresh = getInitialAiMessages(user, glucoseReadings[0]?.readingMg || 114);
    setAiChatMessages(fresh);
    localStorage.setItem(key, JSON.stringify(fresh));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email]);

  const clearAiChat = () => {
    const key = getUserChatKey(user);
    const fresh = getInitialAiMessages(user, glucoseReadings[0]?.readingMg || 114);
    setAiChatMessages(fresh);
    localStorage.setItem(key, JSON.stringify(fresh));
  };

  // 11. Real-time Mobile Step Sensor & Background Keep-Alive State
  const [isPedometerActive, setPedometerActiveState] = useState(() => {
    const saved = localStorage.getItem('glucocare_step_tracking_active');
    return saved !== null ? saved === 'true' : true;
  });
  const [backgroundKeepAlive, setBackgroundKeepAlive] = useState(() => {
    const saved = localStorage.getItem('glucocare_background_audio');
    return saved !== null ? saved === 'true' : true;
  });
  const [stepSensitivity, setStepSensitivityState] = useState(() => {
    return localStorage.getItem('glucocare_step_sensitivity') || 'normal';
  });
  const [isWalking, setIsWalking] = useState(false);
  const [cadence, setCadence] = useState(0);
  const [motionIntensity, setMotionIntensity] = useState(0);
  const [sensorStatus, setSensorStatus] = useState('waiting-motion');
  const [sensorValues, setSensorValues] = useState({ x: 0, y: 0, z: 0, magnitude: 0, dynamicDelta: 0 });

  // ── Unified daily reset: steps, calories, hydration, sleep, food plan, exercises, meds ──
  const checkAndResetDailyData = (force = false) => {
    const today = getTodayDateString();
    const lastReset = localStorage.getItem('glucocare_last_reset_date');
    if (!force && lastReset === today) return; // Already reset today

    // 1. STEPS & CALORIES BURNED: archive yesterday if needed, then reset
    setStepsData(prev => {
      if (prev.date && prev.date !== today) {
        const prevDateObj = new Date(prev.date);
        const dayLabel = isNaN(prevDateObj.getTime())
          ? 'Day'
          : prevDateObj.toLocaleDateString('en-US', { weekday: 'short' });

        const historyRecord = {
          date: prev.date,
          day: dayLabel,
          steps: prev.current || 0,
          goal: prev.goal || 8000,
          distanceKm: prev.distanceKm || 0,
          caloriesBurned: prev.caloriesBurned || 0,
          achieved: (prev.current || 0) >= (prev.goal || 8000)
        };

        setStepHistory(hist => {
          const filtered = hist.filter(h => h.date !== prev.date);
          const updatedHist = [...filtered, historyRecord];
          localStorage.setItem('glucocare_step_history', JSON.stringify(updatedHist));
          return updatedHist;
        });
      }

      const freshSteps = {
        date: today,
        goal: prev.goal || 8000,
        current: 0,
        distanceKm: 0,
        caloriesBurned: 0,
        weeklyAvg: prev.weeklyAvg || 7500,
        streakDays: prev.streakDays || 0
      };
      localStorage.setItem('glucocare_steps', JSON.stringify(freshSteps));
      return freshSteps;
    });

    // 2. WATER (HYDRATION): reset to 0 ml & empty logs
    setWaterData(() => {
      const fresh = { ...initialWaterData, currentMl: 0, logs: [], date: today };
      localStorage.setItem('glucocare_water', JSON.stringify(fresh));
      return fresh;
    });

    // 3. SLEEP: reset to "not recorded yet" for today & archive yesterday
    setSleepData(prev => {
      const prevHours = prev?.lastNightDurationHours || 0;
      let hist = prev?.history || initialSleepData.history || [];
      if (prev?.date && prev.date !== today && prevHours > 0) {
        const prevDateObj = new Date(prev.date);
        const dayLabel = isNaN(prevDateObj.getTime())
          ? 'Day'
          : prevDateObj.toLocaleDateString('en-US', { weekday: 'short' });
        hist = [...hist.slice(-6), { day: dayLabel, hours: prevHours, quality: prev.qualityScore || 80 }];
      }

      const fresh = {
        ...initialSleepData,
        lastNightDurationHours: 0,
        qualityScore: 0,
        qualityLabel: 'Not recorded yet',
        bedTime: '--:--',
        wakeTime: '--:--',
        deepSleepHours: 0,
        remSleepHours: 0,
        lightSleepHours: 0,
        history: hist,
        date: today
      };
      localStorage.setItem('glucocare_sleep', JSON.stringify(fresh));
      return fresh;
    });

    // 4. FOOD & CALORIES EATEN (mealPlan): reset all meals to eaten: false, clear yesterday's custom items
    setMealPlan(() => {
      const resetMeals = {};
      const baseline = initialMealPlan.meals || {};
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(cat => {
        resetMeals[cat] = (baseline[cat] || []).map(m => ({ ...m, eaten: false }));
      });
      const freshMealPlan = {
        ...initialMealPlan,
        date: today,
        meals: resetMeals
      };
      localStorage.setItem('glucocare_meals', JSON.stringify(freshMealPlan));
      return freshMealPlan;
    });

    // 5. DAILY AI FOOD PLAN: clear cache so fresh Indian plan is generated based on today's metrics
    localStorage.removeItem('glucocare_daily_food_plan');
    setDailyFoodPlan(null);

    // 6. EXERCISES: reset all completed flags
    setExercises(prev => {
      const reset = prev.map(ex => ({ ...ex, completed: false }));
      localStorage.setItem('glucocare_exercises', JSON.stringify(reset));
      return reset;
    });

    // 7. MEDICATIONS: reset takenToday flags
    setMedications(prev => {
      const reset = prev.map(med => ({
        ...med,
        takenToday: med.takenToday.map(() => false)
      }));
      localStorage.setItem('glucocare_meds', JSON.stringify(reset));
      return reset;
    });

    // Mark today as reset
    localStorage.setItem('glucocare_last_reset_date', today);

    // 8. Notification
    setNotifications(prev => [
      {
        id: 'n_reset_' + Date.now(),
        title: '🌅 Daily Tracker Reset',
        body: `Good morning! Steps, calories, hydration, sleep log, and food plan have all been reset for ${today}.`,
        type: 'info',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 19)
    ]);
  };

  const checkAndRollOverDailySteps = () => {
    checkAndResetDailyData();
  };

  const resetAllDailyDataForToday = () => {
    checkAndResetDailyData(true);
  };

  useEffect(() => {
    checkAndResetDailyData();
    const interval = setInterval(() => {
      checkAndResetDailyData();
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndResetDailyData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial Food Plan auto-generation if not cached yet (runs after daily reset clears stale plan)
  useEffect(() => {
    const saved = localStorage.getItem('glucocare_daily_food_plan');
    if (!saved) {
      generateDailyFoodPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyFoodPlan === null ? null : 'present']);


  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('glucocare_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('glucocare_glucose', JSON.stringify(glucoseReadings));
    if (user?.email || user?.id) {
      const userKey = (user.email || user.id).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      localStorage.setItem(`glucocare_glucose_${userKey}`, JSON.stringify(glucoseReadings));
    }
  }, [glucoseReadings, user?.email, user?.id]);

  useEffect(() => {
    localStorage.setItem('glucocare_meds', JSON.stringify(medications));
    if (user?.email || user?.id) {
      const userKey = (user.email || user.id).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      localStorage.setItem(`glucocare_meds_${userKey}`, JSON.stringify(medications));
    }
  }, [medications, user?.email, user?.id]);

  useEffect(() => {
    localStorage.setItem('glucocare_meals', JSON.stringify(mealPlan));
  }, [mealPlan]);

  useEffect(() => {
    localStorage.setItem('glucocare_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('glucocare_water', JSON.stringify(waterData));
  }, [waterData]);

  useEffect(() => {
    localStorage.setItem('glucocare_sleep', JSON.stringify(sleepData));
  }, [sleepData]);

  useEffect(() => {
    localStorage.setItem('glucocare_steps', JSON.stringify(stepsData));
  }, [stepsData]);

  useEffect(() => {
    localStorage.setItem('glucocare_step_history', JSON.stringify(stepHistory));
  }, [stepHistory]);

  useEffect(() => {
    localStorage.setItem('glucocare_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    const key = getUserChatKey(user);
    localStorage.setItem(key, JSON.stringify(aiChatMessages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiChatMessages, user?.id, user?.email]);

  // Unit conversion helpers
  // 1 mmol/L = 18.0182 mg/dL
  const formatGlucose = (readingMg) => {
    if (user.unitPreference === 'mmol/L') {
      return (readingMg / 18.0182).toFixed(1);
    }
    return Math.round(readingMg);
  };

  const getGlucoseUnit = () => user.unitPreference || 'mg/dL';

  // Range classification
  const getGlucoseStatus = (readingMg) => {
    if (readingMg < 70) return { label: 'Low (Hypo)', class: 'hypo', color: 'var(--hypo-color)' };
    if (readingMg <= 140) return { label: 'In Range', class: 'in-range', color: 'var(--in-range-color)' };
    if (readingMg <= 180) return { label: 'Elevated', class: 'elevated', color: 'var(--elevated-color)' };
    return { label: 'High (Hyper)', class: 'high', color: 'var(--high-color)' };
  };

  // Actions
  const addGlucoseReading = (newReading) => {
    const reading = {
      id: 'g_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...newReading
    };
    setGlucoseReadings(prev => [reading, ...prev]);
    apiService.syncGlucose(reading);
  };

  const deleteGlucoseReading = (id) => {
    setGlucoseReadings(prev => prev.filter(r => r.id !== id));
  };

  const addWater = (amountMl = 250, label = 'Quick Glass') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setWaterData(prev => ({
      ...prev,
      currentMl: prev.currentMl + amountMl,
      logs: [
        { id: 'w_' + Date.now(), amountMl, time: nowTime, label },
        ...prev.logs
      ]
    }));
  };

  const toggleMedicationTaken = (medId, doseIndex) => {
    setMedications(prev =>
      prev.map(med => {
        if (med.id === medId) {
          const updatedTaken = [...med.takenToday];
          updatedTaken[doseIndex] = !updatedTaken[doseIndex];
          return { ...med, takenToday: updatedTaken };
        }
        return med;
      })
    );
  };

  const addMedication = (newMed) => {
    const med = {
      id: 'm_' + Date.now(),
      takenToday: [false],
      adherenceRate: 100,
      color: '#10B981',
      ...newMed
    };
    setMedications(prev => [...prev, med]);
  };

  const deleteMedication = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const toggleExerciseComplete = (id) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id === id) {
          const nextState = !ex.completed;
          if (nextState) {
            // Add steps & burned calories
            setStepsData(s => ({
              ...s,
              caloriesBurned: s.caloriesBurned + (ex.caloriesBurn || 100),
              current: s.current + (ex.durationMinutes * 80)
            }));
          }
          return { ...ex, completed: nextState };
        }
        return ex;
      })
    );
  };

  const addExercise = (newEx) => {
    const ex = {
      id: 'e_' + Date.now(),
      completed: false,
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...newEx
    };
    setExercises(prev => [...prev, ex]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const sendAiMessage = async (userText) => {
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };
    setAiChatMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    // Instantiate clinical intelligence engine with rich current context
    const engine = new DiabetesAiEngine({
      user,
      latestGlucose,
      glucoseReadings,
      medications,
      waterData,
      sleepData,
      stepsData,
      avgGlucoseMg,
      tirPercentage,
      estimatedA1c,
      formatGlucose,
      getGlucoseUnit,
      getGlucoseStatus
    });

    try {
      let reply = null;

      // 1. Try direct Gemini API
      const apiKey = user?.geminiApiKey || localStorage.getItem('gemini_api_key');
      if (apiKey) {
        reply = await engine.fetchLiveGeminiResponse(userText, apiKey);
      }

      // 2. Try backend AI endpoint
      if (!reply) {
        try {
          reply = await apiService.generateChat(userText, {
            user,
            latestGlucose,
            glucoseReadings: glucoseReadings.slice(0, 5),
            medications,
            stepsData,
            waterData,
            avgGlucoseMg,
            tirPercentage,
            estimatedA1c
          });
        } catch (e) {
          // fallback
        }
      }

      // 3. Comprehensive Clinical Diabetes Engine (Instant & Offline)
      if (!reply) {
        reply = engine.generateResponse(userText);
      }

      const aiMsg = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toISOString()
      };
      setAiChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error generating AI response:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Daily AI Glucose Analysis & Food Recommendation Engine
  const generateDailyFoodPlan = async ({ force = false } = {}) => {
    if (isAnalyzingFoodPlan) return null;
    setIsAnalyzingFoodPlan(true);

    try {
      const apiKey = user?.geminiApiKey || localStorage.getItem('gemini_api_key') || '';

      const healthRecords = {
        steps: stepsData,
        stepHistory: stepHistory || [],
        medications: medications || [],
        sleep: sleepData || {},
        water: waterData || {},
        metrics: {
          avgGlucoseMg,
          tirPercentage,
          estimatedA1c
        }
      };

      // 1. Try Express Backend Gemini AI Endpoint
      const backendRes = await apiService.getDailyFoodRecommendation(user, glucoseReadings, apiKey, healthRecords);
      if (backendRes && backendRes.success && backendRes.recommendation) {
        setDailyFoodPlan(backendRes.recommendation);
        setFoodPlanSource(backendRes.source || 'Google Gemini 2.5 Flash');
        localStorage.setItem('glucocare_daily_food_plan', JSON.stringify(backendRes.recommendation));
        return backendRes.recommendation;
      }

      // 2. Direct browser Gemini API if custom key present
      const engine = new DiabetesAiEngine({
        user,
        latestGlucose,
        medications,
        waterData,
        sleepData,
        stepsData,
        avgGlucoseMg,
        tirPercentage,
        estimatedA1c,
        formatGlucose,
        getGlucoseUnit,
        getGlucoseStatus
      });

      if (apiKey) {
        const directRes = await engine.generateDirectFoodPlan(apiKey);
        if (directRes && directRes.meals) {
          directRes.id = 'rec_' + Date.now();
          directRes.generatedAt = new Date().toISOString();
          setDailyFoodPlan(directRes);
          setFoodPlanSource('Google Gemini 2.5 Flash (Direct)');
          localStorage.setItem('glucocare_daily_food_plan', JSON.stringify(directRes));
          return directRes;
        }
      }

      // 3. Clinical Rule-Based Fallback Engine
      const offlinePlan = engine.generateOfflineFoodPlan();
      offlinePlan.id = 'rec_offline_' + Date.now();
      offlinePlan.generatedAt = new Date().toISOString();
      setDailyFoodPlan(offlinePlan);
      setFoodPlanSource('Clinical AI Rule Engine');
      localStorage.setItem('glucocare_daily_food_plan', JSON.stringify(offlinePlan));
      return offlinePlan;
    } catch (err) {
      console.error('Failed to generate daily food plan:', err);
      return null;
    } finally {
      setIsAnalyzingFoodPlan(false);
    }
  };

  // Pre-Meal (1-Hour Before) Clinical Recommendation Engine
  // Correlates Glucose + Steps Walked + Calories Burned (high walking -> low sugar risk; low walking -> high blood sugar risk)
  const generatePreMealPlan = async ({ mealType, forceSteps, forceGlucose, force = false } = {}) => {
    if (isGeneratingPreMealPlan) return null;
    setIsGeneratingPreMealPlan(true);

    try {
      const windowInfo = getUpcomingMealWindow(user?.mealTimes);
      setUpcomingMealInfo(windowInfo);

      const targetMealType = mealType || windowInfo.currentSelection?.type || 'lunch';
      const targetMealTime = (user?.mealTimes && user.mealTimes[targetMealType]) || windowInfo.currentSelection?.time || '13:00';
      const stepsCount = forceSteps !== undefined ? forceSteps : (stepsData?.current || 0);
      const currentGlucoseReading = glucoseReadings[0] || { readingMg: 110 };
      const glucoseVal = forceGlucose !== undefined ? forceGlucose : (currentGlucoseReading.readingMg || 110);
      const apiKey = user?.geminiApiKey || localStorage.getItem('gemini_api_key') || '';

      // 1. Try Backend Gemini / AI Endpoint
      try {
        const backendRes = await apiService.getPreMealRecommendation({
          user,
          latestGlucose: glucoseVal,
          stepsBeforeMeal: stepsCount,
          mealType: targetMealType,
          mealTime: targetMealTime,
          apiKey
        });
        if (backendRes && backendRes.success && backendRes.recommendation) {
          setPreMealPlan(backendRes.recommendation);
          localStorage.setItem('glucocare_pre_meal_plan', JSON.stringify(backendRes.recommendation));
          return backendRes.recommendation;
        }
      } catch (beErr) {
        console.warn('Backend pre-meal endpoint skipped:', beErr);
      }

      // 2. Clinical Algorithmic Fallback Engine
      const localPlan = generatePreMealRecommendation({
        user,
        currentGlucose: glucoseVal,
        stepsWalked: stepsCount,
        mealType: targetMealType,
        mealTime: targetMealTime
      });

      setPreMealPlan(localPlan);
      localStorage.setItem('glucocare_pre_meal_plan', JSON.stringify(localPlan));
      return localPlan;
    } catch (err) {
      console.error('Error generating pre-meal plan:', err);
      return null;
    } finally {
      setIsGeneratingPreMealPlan(false);
    }
  };

  // 1-Hour Pre-Meal Clock Watcher & Auto-Scheduler
  useEffect(() => {
    const checkMealTime = () => {
      const windowInfo = getUpcomingMealWindow(user?.mealTimes);
      setUpcomingMealInfo(windowInfo);

      // Automatically generate initial pre-meal plan if none exists so user immediately has live data
      if (!preMealPlan && !isGeneratingPreMealPlan) {
        generatePreMealPlan({ mealType: windowInfo.currentSelection?.type || 'lunch' });
      }

      // If we are currently in the 1-hour pre-meal window
      if (windowInfo.isOneHourBefore && windowInfo.activeMeal) {
        const today = getTodayDateString();
        const notificationKey = `premeal_notif_${today}_${windowInfo.activeMeal.type}`;
        const hasNotified = localStorage.getItem(notificationKey);

        if (!hasNotified) {
          localStorage.setItem(notificationKey, 'true');
          // Automatically trigger the pre-meal recommendation
          generatePreMealPlan({ mealType: windowInfo.activeMeal.type }).then(plan => {
            if (plan) {
              const currentG = glucoseReadings[0]?.readingMg || 110;
              setNotifications(prev => [
                {
                  id: 'n_premeal_' + Date.now(),
                  title: `🍽️ 1-Hour Pre-Meal Alert: ${windowInfo.activeMeal.label}`,
                  body: `${plan.clinicalAnalysis?.alertBadge || 'Pre-meal recommendation ready'} • Steps: ${(stepsData?.current || 0).toLocaleString()} • Glucose: ${currentG} mg/dL. Tap to see tailored foods!`,
                  type: plan.clinicalAnalysis?.alertLevel === 'danger' ? 'danger' : 'info',
                  isRead: false,
                  timestamp: new Date().toISOString()
                },
                ...prev
              ]);

              // If browser notifications enabled
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`🍽️ ${windowInfo.activeMeal.label} in 1 Hour`, {
                    body: `Steps: ${(stepsData?.current || 0).toLocaleString()} | Glucose: ${currentG} mg/dL. ${plan.clinicalAnalysis?.alertBadge || ''}`,
                    icon: '/favicon.ico'
                  });
                } catch {}
              }
            }
          });
        }
      }
    };

    checkMealTime();
    const interval = setInterval(checkMealTime, 30000); // check every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.mealTimes, stepsData?.current, glucoseReadings]);

  // Apply recommended AI meal plan to active daily meal tracker
  const applyRecommendedMealPlan = () => {
    if (!dailyFoodPlan?.meals) return false;
    const today = getTodayDateString();

    const resetMeals = {};
    Object.keys(dailyFoodPlan.meals).forEach(cat => {
      resetMeals[cat] = (dailyFoodPlan.meals[cat] || []).map(m => ({
        ...m,
        eaten: false
      }));
    });

    const updated = {
      date: today,
      dailyCalorieTarget: dailyFoodPlan.targetNutrition?.dailyCalorieTarget || mealPlan.dailyCalorieTarget,
      dailyCarbTarget: dailyFoodPlan.targetNutrition?.dailyCarbTarget || mealPlan.dailyCarbTarget,
      dailyProteinTarget: dailyFoodPlan.targetNutrition?.dailyProteinTarget || mealPlan.dailyProteinTarget,
      dailyFatTarget: dailyFoodPlan.targetNutrition?.dailyFatTarget || mealPlan.dailyFatTarget,
      dailyFiberTarget: dailyFoodPlan.targetNutrition?.dailyFiberTarget || 35,
      meals: resetMeals
    };

    setMealPlan(updated);
    localStorage.setItem('glucocare_meals', JSON.stringify(updated));

    // Also notify user
    setNotifications(prev => [
      {
        id: 'n_' + Date.now(),
        title: '🥗 AI Meal Plan Applied',
        body: `Applied personalized low-GI meal plan (${updated.dailyCalorieTarget} kcal, ${updated.dailyCarbTarget}g carbs) tailored to your glucose levels.`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);

    return true;
  };

  const toggleMealEaten = (mealId) => {
    const today = getTodayDateString();
    setMealPlan(prev => {
      if (!prev?.meals) return prev;
      const updatedMeals = {};
      Object.keys(prev.meals).forEach(cat => {
        updatedMeals[cat] = prev.meals[cat].map(m => {
          if (m.id === mealId) {
            return { ...m, eaten: !m.eaten };
          }
          return m;
        });
      });
      const updated = { ...prev, date: today, meals: updatedMeals };
      localStorage.setItem('glucocare_meals', JSON.stringify(updated));
      return updated;
    });
  };

  const removeMeal = (mealId) => {
    const today = getTodayDateString();
    setMealPlan(prev => {
      if (!prev?.meals) return prev;
      const updatedMeals = {};
      Object.keys(prev.meals).forEach(cat => {
        updatedMeals[cat] = prev.meals[cat].filter(m => m.id !== mealId);
      });
      const updated = { ...prev, date: today, meals: updatedMeals };
      localStorage.setItem('glucocare_meals', JSON.stringify(updated));
      return updated;
    });
  };

  const logSleep = ({ hours, qualityLabel = 'Good Quality', qualityScore = 80, bedTime = '23:00', wakeTime = '07:00' }) => {
    const today = getTodayDateString();
    const h = Number(hours) || 7;
    const deep = +(h * 0.25).toFixed(1);
    const rem = +(h * 0.25).toFixed(1);
    const light = +(h - deep - rem).toFixed(1);

    const updated = {
      ...sleepData,
      date: today,
      lastNightDurationHours: h,
      qualityLabel,
      qualityScore: Number(qualityScore),
      bedTime,
      wakeTime,
      deepSleepHours: deep,
      remSleepHours: rem,
      lightSleepHours: light
    };
    setSleepData(updated);
    localStorage.setItem('glucocare_sleep', JSON.stringify(updated));
  };

  const applySuggestedStepsGoal = (newGoal) => {
    const goalVal = parseInt(newGoal, 10);
    if (isNaN(goalVal) || goalVal <= 0) return false;
    setStepsData(prev => {
      const updated = { ...prev, goal: goalVal };
      localStorage.setItem('glucocare_steps', JSON.stringify(updated));
      return updated;
    });

    setNotifications(prev => [
      {
        id: 'n_step_' + Date.now(),
        title: '👟 AI Step Goal Applied',
        body: `Your daily step target has been updated to ${goalVal.toLocaleString()} steps/day as recommended by Gemini AI!`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
    return true;
  };

  const addSteps = (amount = 1) => {
    const today = getTodayDateString();
    setStepsData(prev => {
      let baseCurrent = prev.current || 0;
      let baseGoal = prev.goal || 8000;

      // If date changed before rollover, archive previous day now
      if (prev.date && prev.date !== today) {
        const prevDateObj = new Date(prev.date);
        const dayLabel = isNaN(prevDateObj.getTime())
          ? 'Day'
          : prevDateObj.toLocaleDateString('en-US', { weekday: 'short' });

        const historyRecord = {
          date: prev.date,
          day: dayLabel,
          steps: prev.current || 0,
          goal: prev.goal || 8000,
          distanceKm: prev.distanceKm || 0,
          caloriesBurned: prev.caloriesBurned || 0,
          achieved: (prev.current || 0) >= (prev.goal || 8000)
        };

        setStepHistory(hist => {
          const filtered = hist.filter(h => h.date !== prev.date);
          const updatedHist = [...filtered, historyRecord];
          localStorage.setItem('glucocare_step_history', JSON.stringify(updatedHist));
          return updatedHist;
        });

        baseCurrent = 0;
      }

      const newCurrent = baseCurrent + amount;
      const strideKm = user?.height ? (user.height * 0.415) / 100000 : 0.00075;
      const distanceKm = Number((newCurrent * strideKm).toFixed(2));
      const caloriesBurned = Math.round(newCurrent * 0.04);

      const updated = {
        ...prev,
        date: today,
        goal: baseGoal,
        current: newCurrent,
        distanceKm,
        caloriesBurned
      };
      localStorage.setItem('glucocare_steps', JSON.stringify(updated));

      // Also increment the appropriate pre-meal walk slot
      setPreMealWalks(walks => {
        const curDate = getTodayDateString();
        const b = walks?.date === curDate ? { ...walks } : {
          date: curDate,
          breakfast: { steps: 0, targetSteps: 2500, caloriesBurned: 0, distanceKm: 0, durationMins: 0, isCompleted: false },
          lunch: { steps: 0, targetSteps: 3000, caloriesBurned: 0, distanceKm: 0, durationMins: 0, isCompleted: false },
          dinner: { steps: 0, targetSteps: 2500, caloriesBurned: 0, distanceKm: 0, durationMins: 0, isCompleted: false }
        };

        const now = new Date();
        const minsNow = now.getHours() * 60 + now.getMinutes();
        const parseMins = (tStr, def) => {
          if (!tStr) return def;
          const [h, m] = tStr.split(':').map(Number);
          return (h || 0) * 60 + (m || 0);
        };
        const bMins = parseMins(user?.mealTimes?.breakfast, 480);
        const lMins = parseMins(user?.mealTimes?.lunch, 780);

        let slot = 'breakfast';
        if (minsNow > bMins && minsNow <= lMins) {
          slot = 'lunch';
        } else if (minsNow > lMins) {
          slot = 'dinner';
        }

        const userWeight = Number(user?.weight) || 72;
        const curSlot = b[slot] || { steps: 0, targetSteps: 2500 };
        const updatedSteps = (curSlot.steps || 0) + amount;
        const calBurned = Math.round(updatedSteps * 0.04 * (userWeight / 70));
        const dist = Number((updatedSteps * 0.00075).toFixed(2));
        const dur = Math.round(updatedSteps / 100);

        b[slot] = {
          ...curSlot,
          steps: updatedSteps,
          caloriesBurned: calBurned,
          distanceKm: dist,
          durationMins: dur,
          isCompleted: updatedSteps >= (curSlot.targetSteps || 2500)
        };

        localStorage.setItem('glucocare_pre_meal_walks', JSON.stringify(b));
        return b;
      });

      return updated;
    });
  };

  const resetTodaySteps = () => {
    const today = getTodayDateString();
    const updated = {
      ...stepsData,
      date: today,
      current: 0,
      distanceKm: 0,
      caloriesBurned: 0
    };
    setStepsData(updated);
    localStorage.setItem('glucocare_steps', JSON.stringify(updated));
  };

  // ── Global Step Tracker Service Integration (Runs throughout entire app) ──
  const addStepsRef = useRef(addSteps);
  useEffect(() => {
    addStepsRef.current = addSteps;
  });

  useEffect(() => {
    stepTrackerService.init();

    const unsubStep = stepTrackerService.onStep((amount) => {
      if (addStepsRef.current) {
        addStepsRef.current(amount);
      }
    });

    const unsubMetrics = stepTrackerService.onMetrics((metrics) => {
      setIsWalking(metrics.isWalking);
      setCadence(metrics.cadence);
      setMotionIntensity(metrics.motionIntensity);
      setSensorValues(metrics.sensorValues);
      setSensorStatus(metrics.sensorStatus);
      setPedometerActiveState(metrics.isActive);
      setBackgroundKeepAlive(metrics.backgroundKeepAlive);
    });

    const unsubStatus = stepTrackerService.onStatus((status) => {
      setSensorStatus(status);
    });

    return () => {
      unsubStep();
      unsubMetrics();
      unsubStatus();
    };
  }, []);

  const toggleStepTracking = useCallback(() => {
    const newState = stepTrackerService.toggle();
    setPedometerActiveState(newState);
    return newState;
  }, []);

  const setIsPedometerActive = useCallback((active) => {
    if (active) {
      stepTrackerService.start();
      setPedometerActiveState(true);
    } else {
      stepTrackerService.pause();
      setPedometerActiveState(false);
    }
  }, []);

  const toggleBackgroundKeepAlive = useCallback(() => {
    const nextVal = !backgroundKeepAlive;
    stepTrackerService.setBackgroundKeepAlive(nextVal);
    setBackgroundKeepAlive(nextVal);
  }, [backgroundKeepAlive]);

  const setStepSensitivity = useCallback((level) => {
    stepTrackerService.setSensitivity(level);
    setStepSensitivityState(level);
  }, []);

  const requestSensorPermission = useCallback(async () => {
    return await stepTrackerService.requestPermission();
  }, []);

  const requestWakeLock = useCallback(async () => {
    return await stepTrackerService.requestWakeLock();
  }, []);

  const releaseWakeLock = useCallback(() => {
    stepTrackerService.releaseWakeLock();
  }, []);

  // Calculated Stats
  const latestGlucose = glucoseReadings[0] || { readingMg: 110, type: 'fasting', timestamp: new Date().toISOString() };
  
  // Time in range percentage (70 - 140 mg/dL)
  const inRangeCount = glucoseReadings.filter(r => r.readingMg >= 70 && r.readingMg <= 140).length;
  const tirPercentage = glucoseReadings.length > 0
    ? Math.round((inRangeCount / glucoseReadings.length) * 100)
    : 75;

  // Average glucose
  const avgGlucoseMg = glucoseReadings.length > 0
    ? Math.round(glucoseReadings.reduce((sum, r) => sum + r.readingMg, 0) / glucoseReadings.length)
    : 120;

  // Estimated HbA1c formula: (avgGlucoseMg + 46.7) / 28.7
  const estimatedA1c = ((avgGlucoseMg + 46.7) / 28.7).toFixed(1);

  return (
    <HealthContext.Provider
      value={{
        user,
        setUser,
        glucoseReadings,
        latestGlucose,
        tirPercentage,
        avgGlucoseMg,
        estimatedA1c,
        formatGlucose,
        getGlucoseUnit,
        getGlucoseStatus,
        addGlucoseReading,
        deleteGlucoseReading,
        medications,
        toggleMedicationTaken,
        addMedication,
        deleteMedication,
        mealPlan,
        setMealPlan,
        toggleMealEaten,
        removeMeal,
        dailyFoodPlan,
        isAnalyzingFoodPlan,
        foodPlanSource,
        generateDailyFoodPlan,
        applyRecommendedMealPlan,
        preMealPlan,
        isGeneratingPreMealPlan,
        upcomingMealInfo,
        generatePreMealPlan,
        calculateWalkingCalories,
        applySuggestedStepsGoal,
        exercises,
        toggleExerciseComplete,
        addExercise,
        waterData,
        addWater,
        sleepData,
        setSleepData,
        logSleep,
        stepsData,
        setStepsData,
        preMealWalks,
        setPreMealWalks,
        stepHistory,
        setStepHistory,
        addSteps,
        resetTodaySteps,
        checkAndRollOverDailySteps,
        checkAndResetDailyData,
        resetAllDailyDataForToday,
        getTodayDateString,
        isPedometerActive,
        setIsPedometerActive,
        toggleStepTracking,
        backgroundKeepAlive,
        toggleBackgroundKeepAlive,
        stepSensitivity,
        setStepSensitivity,
        isWalking,
        cadence,
        motionIntensity,
        sensorStatus,
        sensorValues,
        requestSensorPermission,
        requestWakeLock,
        releaseWakeLock,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        aiChatMessages,
        sendAiMessage,
        clearAiChat,
        isAiTyping,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
