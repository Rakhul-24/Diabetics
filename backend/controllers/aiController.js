import { getGeminiModel, model as defaultModel } from '../config/gemini.js';
import { db } from '../config/firebase.js';
import { generateFallbackRecommendation, evaluateGlucoseStatus } from '../utils/helpers.js';

/**
 * Helper to analyze glucose readings array
 */
function analyzeGlucoseReadings(readings = [], defaultVal = 135) {
  if (!Array.isArray(readings) || readings.length === 0) {
    const fallbackStatus = evaluateGlucoseStatus(defaultVal);
    return {
      count: 1,
      latest: defaultVal,
      latestType: 'random',
      status: fallbackStatus.status,
      isDangerous: fallbackStatus.isDangerous,
      avg: defaultVal,
      min: defaultVal,
      max: defaultVal,
      fastingAvg: defaultVal,
      afterMealAvg: defaultVal,
      tirPercentage: 75,
      hypoCount: 0,
      hyperCount: 0,
      trendAssessment: 'Baseline Glucose Profile'
    };
  }

  const values = readings.map(r => Number(r.readingMg) || defaultVal);
  const latest = values[0] || defaultVal;
  const latestType = readings[0]?.type || 'random';
  const evaluation = evaluateGlucoseStatus(latest);

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round(sum / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const fastingReadings = readings.filter(r => r.type === 'fasting').map(r => Number(r.readingMg));
  const fastingAvg = fastingReadings.length > 0 
    ? Math.round(fastingReadings.reduce((a, b) => a + b, 0) / fastingReadings.length) 
    : avg;

  const afterMealReadings = readings.filter(r => r.type === 'afterMeal').map(r => Number(r.readingMg));
  const afterMealAvg = afterMealReadings.length > 0 
    ? Math.round(afterMealReadings.reduce((a, b) => a + b, 0) / afterMealReadings.length) 
    : avg;

  const inRangeCount = values.filter(v => v >= 70 && v <= 140).length;
  const tirPercentage = Math.round((inRangeCount / values.length) * 100);

  const hypoCount = values.filter(v => v < 70).length;
  const hyperCount = values.filter(v => v > 180).length;

  let trendAssessment = 'Stable Glycemic Control';
  if (hypoCount > 0) {
    trendAssessment = 'Hypoglycemia Vulnerability (Needs carb buffer)';
  } else if (afterMealAvg > 175) {
    trendAssessment = 'Postprandial Glycemic Spikes (Needs high soluble fiber & low glycemic load)';
  } else if (fastingAvg > 130) {
    trendAssessment = 'Elevated Fasting Baseline (Dawn Phenomenon / Hepatic Glucose Output)';
  } else if (avg > 160) {
    trendAssessment = 'Persistent Hyperglycemia (Requires strict low-carb & anti-inflammatory nutrition)';
  }

  return {
    count: values.length,
    latest,
    latestType,
    status: evaluation.status,
    isDangerous: evaluation.isDangerous,
    avg,
    min,
    max,
    fastingAvg,
    afterMealAvg,
    tirPercentage,
    hypoCount,
    hyperCount,
    trendAssessment
  };
}

/**
 * Generate comprehensive clinical fallback meal plan if Gemini API is unreachable.
 * Meals are authentic Indian cuisine, adjusted by glucose level AND steps walked today.
 */
function generateClinicalFoodPlanFallback(userProfile, analysis, stepsData = {}) {
  const isHigh = analysis.latest > 160 || analysis.avg > 150;
  const isLow = analysis.latest < 75;
  const stepsToday = stepsData.current || 0;
  const stepGoal = stepsData.goal || 8000;

  // Steps-based carb & calorie adjustment:
  // More active patients can handle more carbs; sedentary patients need stricter limits.
  let stepCarbBonus = 0;
  let stepCalBonus = 0;
  let stepNote = '';
  if (stepsToday >= stepGoal) {
    stepCarbBonus = 20; stepCalBonus = 150;
    stepNote = `You have already walked ${stepsToday.toLocaleString()} steps today — exceeding your goal! Carbohydrate allowance has been increased by 20 g to replenish muscle glycogen.`;
  } else if (stepsToday >= stepGoal * 0.75) {
    stepCarbBonus = 10; stepCalBonus = 80;
    stepNote = `You have walked ${stepsToday.toLocaleString()} steps today (${Math.round((stepsToday / stepGoal) * 100)}% of goal). A moderate carbohydrate increase of 10 g has been applied.`;
  } else if (stepsToday <= stepGoal * 0.25) {
    stepCarbBonus = -15; stepCalBonus = -100;
    stepNote = `Only ${stepsToday.toLocaleString()} steps logged today — below 25% of your goal. Carbohydrate allowance has been reduced by 15 g to avoid sedentary glycemic spikes.`;
  } else {
    stepNote = `You have walked ${stepsToday.toLocaleString()} steps so far. Keep moving — a post-meal walk of 15 minutes will lower your glucose by 20–30 mg/dL.`;
  }

  const dailyCalorieTarget = Math.round((isHigh ? 1650 : isLow ? 1850 : 1750) + stepCalBonus);
  const dailyCarbTarget = Math.round((isHigh ? 115 : isLow ? 160 : 135) + stepCarbBonus);
  const dailyProteinTarget = isHigh ? 95 : 85;
  const dailyFatTarget = 48;
  const dailyFiberTarget = isHigh ? 40 : 35;

  // Select meal options based on glucose level for Indian cuisine
  const breakfastOptions = isHigh ? [
    {
      id: 'fb_1',
      name: 'Methi (Fenugreek) Multigrain Roti with Low-Fat Curd',
      icon: '🫓',
      calories: 275,
      carbs: 32,
      protein: 11,
      fat: 7,
      fiber: 6,
      giIndex: 35,
      giRating: 'Low GI',
      portion: '2 rotis + 100g curd',
      ingredients: ['Fenugreek leaves', 'Besan & whole wheat flour', 'Low-fat curd', 'Roasted cumin'],
      recipe: 'Knead chopped methi with 30% besan and whole wheat flour. Cook on tawa with 1/2 tsp cold-pressed oil.',
      glycemicReason: 'Fenugreek contains 4-hydroxyisoleucine which stimulates glucose-dependent insulin secretion.'
    },
    {
      id: 'fb_2',
      name: 'Vegetable Oats Upma with Soaked Almonds',
      icon: '🥣',
      calories: 240,
      carbs: 30,
      protein: 9,
      fat: 6,
      fiber: 5,
      giIndex: 42,
      giRating: 'Low GI',
      portion: '1 bowl (180g) + 6 almonds',
      ingredients: ['Rolled oats', 'Green peas', 'Carrots', 'Mustard seeds', 'Curry leaves'],
      recipe: 'Lightly roast rolled oats, temper mustard seeds and curry leaves, sauté veggies with turmeric.',
      glycemicReason: 'Oat beta-glucan soluble fiber forms a gel in the digestive tract, slowing carb absorption.'
    }
  ] : isLow ? [
    {
      id: 'fb_low_1',
      name: 'Banana Oats Porridge with Milk & Raisins',
      icon: '🍌',
      calories: 330,
      carbs: 55,
      protein: 10,
      fat: 5,
      fiber: 4,
      giIndex: 52,
      giRating: 'Moderate GI',
      portion: '1 bowl + 1/2 banana + 10 raisins',
      ingredients: ['Rolled oats', 'Full-fat milk', 'Half banana', 'Raisins'],
      recipe: 'Cook oats in milk, top with sliced banana and raisins for quick glucose stabilization.',
      glycemicReason: 'Moderate GI carbs quickly replenish depleted blood glucose and prevent further hypoglycemia.'
    },
    {
      id: 'fb_low_2',
      name: 'Sabudana Khichdi with Peanuts & Curd',
      icon: '🍚',
      calories: 360,
      carbs: 58,
      protein: 9,
      fat: 8,
      fiber: 3,
      giIndex: 56,
      giRating: 'Moderate GI',
      portion: '1 medium bowl + 100g curd',
      ingredients: ['Soaked sabudana', 'Roasted peanuts', 'Green chilli', 'Sendha namak'],
      recipe: 'Temper cumin, add soaked sabudana and peanuts, cook on medium flame with rock salt.',
      glycemicReason: 'Sabudana provides fast-acting carbohydrates ideal for correcting low blood glucose safely.'
    }
  ] : [
    {
      id: 'fb_n_1',
      name: 'Ragi (Finger Millet) Idli with Sambar & Coconut Chutney',
      icon: '🍱',
      calories: 290,
      carbs: 38,
      protein: 10,
      fat: 6,
      fiber: 5,
      giIndex: 38,
      giRating: 'Low GI',
      portion: '3 idlis + 1 bowl sambar + 2 tbsp chutney',
      ingredients: ['Ragi flour', 'Urad dal batter', 'Toor dal sambar', 'Coconut'],
      recipe: 'Steam fermented ragi-urad batter in idli molds. Serve with hot toor dal sambar and fresh coconut chutney.',
      glycemicReason: 'Ragi is rich in calcium and dietary fiber with a lower glycemic index than white rice.'
    },
    {
      id: 'fb_n_2',
      name: 'Moong Dal Cheela with Mint Chutney',
      icon: '🥞',
      calories: 245,
      carbs: 28,
      protein: 14,
      fat: 5,
      fiber: 5,
      giIndex: 36,
      giRating: 'Low GI',
      portion: '2 cheelas + 2 tbsp green chutney',
      ingredients: ['Soaked moong dal', 'Ginger', 'Green chilli', 'Fresh coriander'],
      recipe: 'Blend soaked moong into smooth batter with ginger and green chilli. Pour thin pancakes on non-stick tawa.',
      glycemicReason: 'Moong dal provides plant protein and fiber that blunts post-breakfast glucose rise.'
    }
  ];

  const lunchOptions = [
    {
      id: 'fl_1',
      name: 'Sprouted Moong Dal & Brown Rice with Karela Sabzi',
      icon: '🍲',
      calories: isHigh ? 390 : 420,
      carbs: isHigh ? 48 : 56,
      protein: 22,
      fat: 6,
      fiber: 10,
      giIndex: 40,
      giRating: 'Low GI',
      portion: isHigh ? '1 bowl dal + 1/2 cup brown rice + 100g karela' : '1 bowl dal + 3/4 cup brown rice + 100g karela',
      ingredients: ['Sprouted moong', 'Brown rice', 'Bitter gourd (karela)', 'Mustard oil', 'Amchur'],
      recipe: 'Simmer sprouted moong with cumin, tomato and turmeric. Sauté sliced karela in mustard oil with dry mango powder.',
      glycemicReason: 'Bitter gourd contains charantin and polypeptide-p which mimic endogenous insulin action.'
    },
    {
      id: 'fl_2',
      name: 'Palak Paneer with 1 Jowar Roti & Cucumber Raita',
      icon: '🥗',
      calories: 375,
      carbs: 22,
      protein: 24,
      fat: 14,
      fiber: 7,
      giIndex: 30,
      giRating: 'Very Low GI',
      portion: '150g palak paneer + 1 roti + 100g raita',
      ingredients: ['Low-fat paneer', 'Spinach puree', 'Jowar flour', 'Low-fat curd'],
      recipe: 'Blanch and puree spinach, cook with diced paneer, minimal oil, and whole spices. Pair with jowar roti.',
      glycemicReason: 'Spinach provides magnesium and alpha-lipoic acid that improve cellular glucose metabolism.'
    }
  ];

  const dinnerOptions = [
    {
      id: 'fd_1',
      name: 'Masoor Dal Tadka with 1 Bajra Roti & Mixed Veg Sabzi',
      icon: '🍛',
      calories: 340,
      carbs: isHigh ? 36 : 44,
      protein: 18,
      fat: 7,
      fiber: 9,
      giIndex: 38,
      giRating: 'Low GI',
      portion: '1 bowl dal + 1 roti + 100g sabzi',
      ingredients: ['Red lentils (masoor)', 'Bajra flour', 'Bottle gourd', 'Garlic tadka'],
      recipe: 'Cook masoor dal with turmeric and tomato. Finish with a ghee-garlic tadka. Serve with hot bajra roti and lauki sabzi.',
      glycemicReason: 'Masoor dal is rich in soluble fiber that slows intestinal glucose absorption overnight.'
    },
    {
      id: 'fd_2',
      name: 'Vegetable Daliya (Broken Wheat) Khichdi with Curd',
      icon: '🍵',
      calories: 280,
      carbs: 35,
      protein: 12,
      fat: 5,
      fiber: 6,
      giIndex: 41,
      giRating: 'Low GI',
      portion: '1 bowl daliya khichdi + 100g low-fat curd',
      ingredients: ['Broken wheat (daliya)', 'Toor dal', 'Mixed vegetables', 'Ghee & jeera'],
      recipe: 'Pressure cook broken wheat with toor dal and diced vegetables. Season with a light jeera-ghee tadka.',
      glycemicReason: 'Broken wheat is less processed than semolina, with higher fiber content that prevents nocturnal glucose spikes.'
    }
  ];

  const snackOptions = [
    {
      id: 'fs_1',
      name: 'Dry Roasted Chana (Kala Chana) with Lemon & Cinnamon Tea',
      icon: '🫘',
      calories: 120,
      carbs: 16,
      protein: 7,
      fat: 2,
      fiber: 4,
      giIndex: 28,
      giRating: 'Very Low GI',
      portion: '35g roasted chana + 1 cup tea',
      ingredients: ['Roasted black chickpeas', 'Rock salt', 'Lemon juice', 'Ceylon cinnamon tea'],
      recipe: 'Toss roasted chana with a squeeze of lemon and black salt. Brew herbal cinnamon tea alongside.',
      glycemicReason: 'Cinnamaldehyde in cinnamon activates glucose transporters; chana fiber prevents mid-afternoon sugar dips.'
    },
    {
      id: 'fs_2',
      name: 'Makhana (Fox Nuts) Stir-fried with Desi Ghee & Rock Salt',
      icon: '🌰',
      calories: 95,
      carbs: 13,
      protein: 4,
      fat: 3,
      fiber: 3,
      giIndex: 25,
      giRating: 'Very Low GI',
      portion: '30g makhana (about 30 pieces)',
      ingredients: ['Fox nuts (makhana)', 'Desi ghee (1/3 tsp)', 'Rock salt', 'Black pepper'],
      recipe: 'Dry-roast makhana in a pan until crisp. Toss with minimal ghee, rock salt and cracked black pepper.',
      glycemicReason: 'Makhana is a low-GI, low-calorie Indian snack rich in magnesium that promotes stable blood sugar.'
    }
  ];

  return {
    analysis: {
      statusSummary: isLow
        ? `Hypoglycemic risk detected (Latest: ${analysis.latest} mg/dL, Steps walked: ${stepsToday.toLocaleString()}). Meals include moderate-GI Indian foods to safely stabilize blood glucose.`
        : isHigh
        ? `Elevated glucose (Latest: ${analysis.latest} mg/dL, 7-day Avg: ${analysis.avg} mg/dL, Steps walked: ${stepsToday.toLocaleString()}). Today's Indian diet plan prioritizes low-GI, high-fiber dishes to flatten postprandial spikes. ${stepNote}`
        : `Well-controlled glucose (Latest: ${analysis.latest} mg/dL, TIR: ${analysis.tirPercentage}%, Steps walked: ${stepsToday.toLocaleString()}). ${stepNote}`,
      trendLabel: analysis.trendAssessment,
      riskLevel: analysis.isDangerous ? 'high' : isHigh ? 'moderate' : isLow ? 'moderate' : 'low',
      keyClinicalInsight: isHigh
        ? `With ${stepsToday.toLocaleString()} steps today, combining low-GI Indian foods (karela, methi, rajma, jowar) with post-meal walks of 15–20 minutes activates GLUT-4 glucose transporters to clear blood sugar without medication.`
        : `With ${stepsToday.toLocaleString()} steps logged, Indian foods rich in soluble fiber (dal, broken wheat, ragi, oats upma) keep glucose stable throughout the day.`
    },
    targetNutrition: {
      dailyCalorieTarget,
      dailyCarbTarget,
      dailyProteinTarget,
      dailyFatTarget,
      dailyFiberTarget
    },
    meals: {
      breakfast: breakfastOptions,
      lunch: lunchOptions,
      dinner: dinnerOptions,
      snacks: snackOptions
    },
    foodsToPrioritize: [
      { name: 'Fenugreek (Methi)', reason: 'Slows carb absorption and stimulates natural insulin secretion — add to rotis, dals, and parathas', icon: '🌿' },
      { name: 'Bitter Gourd (Karela)', reason: 'Contains charantin and polypeptide-p with proven blood sugar lowering properties', icon: '🥬' },
      { name: 'Sprouted Moong & Kala Chana', reason: 'High in resistant starch and prebiotic fiber — ideal as dal, salad or chaat', icon: '🫘' },
      { name: 'Ragi, Jowar & Bajra (Millets)', reason: 'Low-GI Indian grains with high magnesium and fiber for sustained energy release', icon: '🌾' },
      { name: 'Amla (Indian Gooseberry)', reason: 'Rich in Vitamin C and chromium — improves insulin sensitivity and lowers fasting glucose', icon: '🍃' }
    ],
    foodsToAvoid: [
      { name: 'Maida-based items (Naan, Puri, Bakery biscuits)', reason: 'GI > 75; rapidly enters bloodstream causing severe glycemic spikes', icon: '🥐' },
      { name: 'Packaged Fruit Juices, Cold Drinks & Chai with Sugar', reason: 'Liquid sugar load with no fiber buffer — spikes glucose within minutes', icon: '🧃' },
      { name: 'Deep-fried Snacks (Samosas, Pakoras, Bhatura)', reason: 'High trans-fats and refined carbs induce acute insulin resistance and inflammation', icon: '🍟' },
      { name: 'White Rice in large portions', reason: 'Rapidly digested starch — always portion-control (1/2 cup) and pair with dal and sabzi', icon: '🍚' }
    ],
    hydrationAdvice: 'Drink 2.5–3 liters of water throughout the day. Start your morning with soaked methi seeds water. Opt for buttermilk (chaas) or coconut water over sugary drinks.',
    motivationalQuote: stepsToday >= stepGoal
      ? `Amazing! You have already hit your step goal today — your muscles are burning glucose like a furnace! Keep fueling with low-GI Indian foods! 🏆`
      : `Every low-GI Indian meal and every step you take is an investment in your energy, clarity, and lifelong health! 💪`,
    stepsGuidance: {
      dailyStepTarget: isHigh ? 9000 : isLow ? 6000 : 8000,
      postMealWalkMinutes: isHigh ? 20 : 15,
      clinicalRationale: isHigh
        ? `With elevated glucose (${analysis.latest} mg/dL) and ${stepsToday.toLocaleString()} steps walked so far, an active daily target of 9,000 steps with 15–20 min post-meal walks activates muscular GLUT-4 glucose transporters, dropping blood sugar by 20–35 mg/dL without medication.`
        : `Your glucose is well-controlled and you have walked ${stepsToday.toLocaleString()} steps. Maintaining 8,000 daily steps sustains peripheral insulin sensitivity and cardiovascular health.`,
      recommendedSplits: [
        { label: 'Post-Breakfast Walk', steps: 1500, timing: '15 mins within 30m of breakfast', purpose: 'Blunts morning dawn phenomenon & breakfast rise' },
        { label: 'Post-Lunch Brisk Walk', steps: 2500, timing: '20 mins brisk walk after lunch', purpose: 'Counters afternoon postprandial glycemic surge' },
        { label: 'Post-Dinner Stroll', steps: 2000, timing: '15 mins gentle walk after dinner', purpose: 'Lowers overnight glucose and improves deep sleep' },
        { label: 'Daily Baseline Movement', steps: isHigh ? 3000 : 2000, timing: 'Throughout the day', purpose: 'Sustains Non-Exercise Activity Thermogenesis (NEAT)' }
      ],
      estimatedCaloriesBurn: isHigh ? 360 : 320
    }
  };
}

/**
 * Controller: Analyze Glucose Data and Recommend Daily Food using Gemini API
 */
export async function dailyFoodRecommendation(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { readings: inputReadings, user: inputUser, records: inputRecords, apiKey: clientApiKey } = req.body || {};
    const stepsData = inputRecords?.steps || {};
    const stepHistory = Array.isArray(inputRecords?.stepHistory) ? inputRecords.stepHistory : [];
    const medications = Array.isArray(inputRecords?.medications) ? inputRecords.medications : [];
    const sleepData = inputRecords?.sleep || {};
    const waterData = inputRecords?.water || {};

    // 1. Gather User Profile
    let userProfile = inputUser || {};
    if (!userProfile.name || !userProfile.diabetesType) {
      try {
        const userSnap = await db.collection('users').doc(uid).get();
        if (userSnap.exists) {
          userProfile = { ...userSnap.data(), ...userProfile };
        }
      } catch (e) {
        // use inputUser or default
      }
    }

    // 2. Gather Glucose Readings
    let readings = Array.isArray(inputReadings) && inputReadings.length > 0 ? inputReadings : [];
    if (readings.length === 0) {
      try {
        const glucoseSnap = await db.collection('glucose_readings').where('userId', '==', uid).get();
        readings = glucoseSnap.docs.map(d => d.data());
      } catch (e) {
        // use default readings
      }
    }

    // 3. Compute Clinical Glucose Analytics
    const analysis = analyzeGlucoseReadings(readings, 135);

    // 4. Try Google Gemini API
    const geminiModel = getGeminiModel(clientApiKey) || defaultModel;

    if (geminiModel) {
      try {
        const stepsToday = stepsData.current || 0;
        const stepGoal = stepsData.goal || 8000;
        const stepProgress = Math.round((stepsToday / stepGoal) * 100);
        // Carb modulation based on activity: more steps = more carb allowance
        const stepCarbNote = stepsToday >= stepGoal
          ? `Patient has ALREADY MET their daily step goal (${stepsToday} / ${stepGoal} steps = ${stepProgress}%). INCREASE daily carbohydrate target by 20g above baseline to replenish muscle glycogen.`
          : stepsToday >= stepGoal * 0.75
          ? `Patient is 75%+ toward their step goal (${stepsToday} / ${stepGoal} steps). INCREASE carbohydrate target by 10g above baseline.`
          : stepsToday <= stepGoal * 0.25
          ? `Patient has walked very few steps today (${stepsToday} / ${stepGoal} = ${stepProgress}%). REDUCE carbohydrate target by 15g below baseline — sedentary day requires stricter glycemic control.`
          : `Patient has walked ${stepsToday} of ${stepGoal} steps (${stepProgress}% of daily goal). Use baseline macronutrient targets.`;

        const prompt = `You are an elite Clinical Endocrinologist, Exercise Physiologist, and Certified Diabetes Care & Education Specialist (CDCES) specializing in INDIAN NUTRITION.
Your mission is to evaluate this patient's comprehensive health records (glucose readings, steps walked today, step history, medications, and sleep) and prescribe an evidence-based AUTHENTIC INDIAN daily food plan AND a required daily step prescription.

🇮🇳 CRITICAL CUISINE REQUIREMENT: ALL recommended meal items MUST be authentic Indian dishes.
Examples of acceptable items: Dal (moong/masoor/toor/chana), Roti/Chapati (wheat/jowar/bajra/ragi), Idli, Dosa, Upma, Khichdi, Daliya, Sabzi (karela/palak/lauki/bhindi), Raita, Sambar, Chutney, Paneer dishes, Sprout salads, Poha, Dhokla, Makhana, Roasted chana, Chaas (buttermilk), Lassi.
Do NOT suggest non-Indian foods like broccoli salads, zucchini soup, Greek-style dishes, or pizza.

PATIENT PROFILE:
- Name: ${userProfile.name || 'Arjun Sharma'}
- Age: ${userProfile.age || 42}, Gender: ${userProfile.gender || 'Male'}
- Diabetes Diagnosis: ${userProfile.diabetesType || 'Type 2 Diabetes'}
- Weight: ${userProfile.weight || 78} kg, Height: ${userProfile.height || 175} cm
- Target Glucose Range: ${userProfile.targetGlucoseMin || 70} - ${userProfile.targetGlucoseMax || 140} mg/dL
- Dietary Preferences: ${(userProfile.foodPreferences || ['Low-Carb', 'High-Fiber', 'Indian Vegetarian']).join(', ')}
- Known Allergies: ${(userProfile.allergies || ['None']).join(', ')}

PATIENT HEALTH RECORDS & ACTIVITY METRICS:
- Latest Blood Glucose: ${analysis.latest} mg/dL (${analysis.latestType}, Status: ${analysis.status})
- 7-Day Average Glucose: ${analysis.avg} mg/dL | Fasting Mean: ${analysis.fastingAvg} mg/dL | Post-Meal Mean: ${analysis.afterMealAvg} mg/dL
- Time in Range (70-140 mg/dL): ${analysis.tirPercentage}% | Observed Trend: "${analysis.trendAssessment}"
- Recent Glucose Records: ${JSON.stringify(readings.slice(0, 6).map(r => ({ mg: r.readingMg, type: r.type, note: r.notes })))}
- Steps Walked Today: ${stepsToday} steps | Daily Step Goal: ${stepGoal} steps | Step Progress: ${stepProgress}%
- Distance: ${stepsData.distanceKm || 0} km | Calories Burned from Steps: ${stepsData.caloriesBurned || 0} kcal
- STEP-BASED CARB ADJUSTMENT RULE: ${stepCarbNote}
- Recent Step History (Last 5 Days): ${JSON.stringify(stepHistory.slice(0, 5).map(h => ({ date: h.date, steps: h.steps, goal: h.goal, met: h.achieved })))}
- Prescribed Medications & Regimen: ${medications.length > 0 ? medications.map(m => `${m.name} ${m.dosage} (${m.frequency})`).join('; ') : 'Metformin 500mg (twice daily)'}
- Sleep & Rest Records: ${sleepData.durationHours || 7} hrs (Quality: ${sleepData.quality || 'Good'})
- Hydration Intake: ${waterData.currentMl || 1500} ml / ${waterData.dailyGoalMl || 2500} ml target

REQUIREMENTS:
1. Perform deep clinical analysis of glucose trends correlated with STEPS WALKED TODAY to determine carbohydrate allowance (more steps = more carbs, fewer steps = fewer carbs).
2. Formulate a REQUIRED DAILY STEP TARGET & Post-Meal Walk Prescription tailored to their glucose readings and today's step activity.
3. Propose optimal daily macronutrient targets adjusted per the step-based carb adjustment rule above.
4. Curate a complete daily low-GI AUTHENTIC INDIAN meal plan:
   - breakfast: 2 low-GI Indian options (e.g., idli-sambar, moong dal cheela, upma, methi roti, poha, daliya, ragi idli)
   - lunch: 2 low-GI balanced Indian options (e.g., dal rice, roti sabzi, khichdi, rajma, palak paneer)
   - dinner: 2 light Indian options (e.g., daliya khichdi, moong dal soup, bajra roti dal, vegetable upma)
   - snacks: 2 Indian snacks (e.g., roasted chana, makhana, buttermilk chaas, dhokla, sprouts chaat)
   Each meal item: id, name, icon, calories, carbs, protein, fat, fiber, giIndex, giRating ("Low GI"), portion, ingredients (max 4 Indian ingredients), recipe (1-2 sentences with Indian cooking method), glycemicReason.
5. List 4 "foodsToPrioritize" (all Indian: karela, methi, ragi, amla, moong, etc.) and 4 "foodsToAvoid" (maida, jaggery, fried items, etc.).
6. Include in analysis.statusSummary how today's step count (${stepsToday} steps) affects the food recommendation.
7. Keep recipes concise (1-2 sentences). Return PURE JSON ONLY without markdown fences.

JSON Schema format:
{
  "analysis": {
    "statusSummary": "string",
    "trendLabel": "string",
    "riskLevel": "low" | "moderate" | "high" | "critical",
    "keyClinicalInsight": "string"
  },
  "stepsGuidance": {
    "dailyStepTarget": number,
    "postMealWalkMinutes": number,
    "clinicalRationale": "string",
    "recommendedSplits": [
      { "label": "string", "steps": number, "timing": "string", "purpose": "string" }
    ],
    "estimatedCaloriesBurn": number
  },
  "targetNutrition": {
    "dailyCalorieTarget": number,
    "dailyCarbTarget": number,
    "dailyProteinTarget": number,
    "dailyFatTarget": number,
    "dailyFiberTarget": number
  },
  "meals": {
    "breakfast": [ { "id": "b1", "name": "...", "icon": "...", "calories": 0, "carbs": 0, "protein": 0, "fat": 0, "fiber": 0, "giIndex": 0, "giRating": "Low GI", "portion": "...", "ingredients": ["..."], "recipe": "...", "glycemicReason": "..." } ],
    "lunch": [ ... ],
    "dinner": [ ... ],
    "snacks": [ ... ]
  },
  "foodsToPrioritize": [ { "name": "...", "reason": "...", "icon": "..." } ],
  "foodsToAvoid": [ { "name": "...", "reason": "...", "icon": "..." } ],
  "hydrationAdvice": "string",
  "motivationalQuote": "string"
}`;

        const geminiPromise = geminiModel.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini generation timeout (40s)')), 40000)
        );
        const result = await Promise.race([geminiPromise, timeoutPromise]);
        const responseText = result.response.text().trim();

        // Extract JSON string, handling possible code block wraps
        let jsonStr = responseText;
        const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
        } else {
          const firstBrace = responseText.indexOf('{');
          const lastBrace = responseText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = responseText.substring(firstBrace, lastBrace + 1);
          }
        }

        const parsed = JSON.parse(jsonStr);
        parsed.id = 'rec_' + Date.now();
        parsed.generatedAt = new Date().toISOString();
        parsed.glucoseAnalyzed = {
          latest: analysis.latest,
          avg: analysis.avg,
          tirPercentage: analysis.tirPercentage,
          trend: analysis.trendAssessment
        };

        if (!parsed.stepsGuidance) {
          const isHigh = analysis.latest > 160 || analysis.avg > 150;
          parsed.stepsGuidance = {
            dailyStepTarget: isHigh ? 9000 : 8000,
            postMealWalkMinutes: isHigh ? 20 : 15,
            clinicalRationale: `Prescribed daily step target of ${isHigh ? '9,000' : '8,000'} steps to activate muscular GLUT-4 glucose uptake and reduce postprandial glycemic excursions.`,
            recommendedSplits: [
              { label: 'Post-Breakfast Walk', steps: 1500, timing: '15m after breakfast', purpose: 'Blunts morning rise' },
              { label: 'Post-Lunch Brisk Walk', steps: 2500, timing: '20m after lunch', purpose: 'Buffers afternoon spike' },
              { label: 'Post-Dinner Stroll', steps: 2000, timing: '15m after dinner', purpose: 'Prevents dawn phenomenon' },
              { label: 'Baseline Daily Movement', steps: isHigh ? 3000 : 2000, timing: 'All day', purpose: 'Sustains NEAT' }
            ],
            estimatedCaloriesBurn: isHigh ? 360 : 320
          };
        }

        // Cache to Firestore non-blockingly
        try {
          db.collection('daily_food_recommendations').add({ ...parsed, userId: uid }).catch(() => {});
        } catch (e) {}

        return res.status(200).json({
          success: true,
          source: 'Google Gemini 2.5 Flash',
          recommendation: parsed
        });
      } catch (geminiError) {
        console.warn('⚠️ Gemini Daily Food Recommendation Error:', geminiError.message);
      }
    }

    // 5. Fallback rule-based clinical engine if Gemini is unavailable
    const fallbackPlan = generateClinicalFoodPlanFallback(userProfile, analysis, stepsData);
    fallbackPlan.id = 'rec_fallback_' + Date.now();
    fallbackPlan.generatedAt = new Date().toISOString();
    fallbackPlan.glucoseAnalyzed = {
      latest: analysis.latest,
      avg: analysis.avg,
      tirPercentage: analysis.tirPercentage,
      trend: analysis.trendAssessment
    };

    try {
      db.collection('daily_food_recommendations').add({ ...fallbackPlan, userId: uid }).catch(() => {});
    } catch (e) {}

    return res.status(200).json({
      success: true,
      source: 'Clinical AI Rule Engine (Fallback)',
      recommendation: fallbackPlan
    });
  } catch (error) {
    next(error);
  }
}

export async function generateRecommendation(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';
    const { apiKey: clientApiKey } = req.body || {};
    
    // Fetch latest user profile & vitals from Firestore
    const userSnap = await db.collection('users').doc(uid).get();
    const userProfile = userSnap.exists ? userSnap.data() : {};

    const glucoseSnap = await db.collection('glucose_readings').where('userId', '==', uid).get();
    const glucoseList = glucoseSnap.docs.map(d => d.data());
    const latestGlucose = glucoseList.length > 0 
      ? glucoseList[glucoseList.length - 1].readingMg 
      : 168;

    const evaluation = evaluateGlucoseStatus(latestGlucose);
    const geminiModel = getGeminiModel(clientApiKey) || defaultModel;

    // If Gemini model is available, use Gemini API
    if (geminiModel) {
      try {
        const systemPrompt = `
You are an AI Diabetes Lifestyle Assistant.
Analyze the following patient profile and vitals:
- Patient Name: ${userProfile.name || 'Arjun Sharma'}
- Age: ${userProfile.age || 42}, Gender: ${userProfile.gender || 'Male'}
- Diabetes Type: ${userProfile.diabetesType || 'Type 2'}
- Height: ${userProfile.height || 175}cm, Weight: ${userProfile.weight || 80}kg
- Blood Glucose: ${latestGlucose} mg/dL (Status: ${evaluation.status})
- Food Preferences: ${(userProfile.foodPreferences || ['Low-Carb']).join(', ')}
- Medical History: ${(userProfile.medicalHistory || ['Type 2 Diabetes']).join(', ')}

Provide educational guidance only. Never diagnose disease. Never prescribe medicine.
If glucose is dangerous (<70 or >250 mg/dL), recommend immediate doctor consultation.

Generate a JSON object with:
1. insight (String summary)
2. mealPlan (breakfast, lunch, dinner, snacks - each with array of food items having name, calories, protein, carbs, fat, fiber, giIndex, portion, recipe, imageEmoji)
3. exercisePlan (exercises array with name, type, duration, caloriesBurn, difficulty, description, icon)
4. hydrationAdvice (String)
5. sleepTips (List of strings)
6. lifestyleTips (List of strings)
7. motivationalQuote (String)
8. healthSummary (String)
9. weeklyReport (String)
Return valid JSON only.
`;

        const result = await geminiModel.generateContent(systemPrompt);
        const responseText = result.response.text();

        // Extract JSON string from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsed.id = 'rec_' + Date.now();
          parsed.generatedAt = new Date().toISOString();
          parsed.isDangerousAlert = evaluation.isDangerous;

          await db.collection('recommendations').add({ ...parsed, userId: uid });

          return res.status(200).json({
            success: true,
            source: 'Google Gemini API (gemini-2.5-flash)',
            recommendation: parsed
          });
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini Generation Error, using fallback:', geminiError.message);
      }
    }

    // Fallback recommendation engine
    const recommendation = generateFallbackRecommendation(userProfile, latestGlucose);
    try {
      await db.collection('recommendations').add({ ...recommendation, userId: uid });
    } catch (e) {
      // offline dev
    }

    return res.status(200).json({
      success: true,
      source: 'Clinical AI Rule Engine (Fallback)',
      recommendation
    });
  } catch (error) {
    next(error);
  }
}

export async function chatWithAiCoach(req, res, next) {
  try {
    const { message, context, apiKey: clientApiKey } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const geminiModel = getGeminiModel(clientApiKey) || defaultModel;

    if (geminiModel) {
      try {
        const prompt = `You are an expert AI Diabetes and Lifestyle Health Coach.
Patient Details: Name: ${context?.user?.name || 'Arjun'}, Type: ${context?.user?.diabetesType || 'Type 2'}, Latest Blood Glucose: ${context?.latestGlucose?.readingMg || 114} mg/dL.
User Question: "${message}"

Provide a warm, medically sound, practical answer formatted with bullet points and emojis. Explain the glycemic impact and give clear action steps. Never diagnose or prescribe prescription drugs. Keep tone encouraging.`;

        const result = await geminiModel.generateContent(prompt);
        const reply = result.response.text();
        return res.status(200).json({ success: true, reply });
      } catch (err) {
        console.warn('Gemini chat failed, fallback will be used:', err.message);
      }
    }

    return res.status(200).json({ success: false, fallback: true });
  } catch (error) {
    next(error);
  }
}
