import React, { createContext, useContext, useState, useEffect } from 'react';
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


  // 5. Exercises State
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

  // 0. Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('glucocare_auth');
    return savedAuth !== 'false';
  });

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('glucocare_auth', 'false');
    setNotifications(prev => [
      {
        id: 'n_out_' + Date.now(),
        title: '🔒 Signed Out',
        body: 'You have been safely logged out. Your local records remain secure.',
        type: 'info',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const login = (customProfile = null) => {
    if (customProfile) {
      setUser(customProfile);
      localStorage.setItem('glucocare_user', JSON.stringify(customProfile));
    }
    setIsAuthenticated(true);
    localStorage.setItem('glucocare_auth', 'true');
    setNotifications(prev => [
      {
        id: 'n_in_' + Date.now(),
        title: '👋 Welcome Back!',
        body: `Signed in successfully. All diabetes tracking records are ready.`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
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

  // 9. Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('glucocare_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // 10. AI Chat Messages
  const [aiChatMessages, setAiChatMessages] = useState(() => {
    const saved = localStorage.getItem('glucocare_ai_chat');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'm-init',
            sender: 'ai',
            text: `Hello ${user.name || 'there'}! 👋 I am your dedicated AI Diabetes Care Coach. How are you feeling today? You can ask me about your glucose levels, low-GI recipe recommendations, post-meal workouts, or medication routines!`,
            timestamp: new Date().toISOString()
          }
        ];
  });
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isPedometerActive, setIsPedometerActive] = useState(false);

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
  }, [glucoseReadings]);

  useEffect(() => {
    localStorage.setItem('glucocare_meds', JSON.stringify(medications));
  }, [medications]);

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
    localStorage.setItem('glucocare_ai_chat', JSON.stringify(aiChatMessages));
  }, [aiChatMessages]);

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
            readings: glucoseReadings.slice(0, 5)
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
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        aiChatMessages,
        sendAiMessage,
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
