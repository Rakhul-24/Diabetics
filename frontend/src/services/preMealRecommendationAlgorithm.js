/**
 * Pre-Meal Diabetic Food Recommendation Algorithm
 * 
 * Clinical Physiology Logic:
 * 1. Meal Timing: Evaluates scheduled meal (Breakfast, Lunch, Dinner) 1 hour prior to eating.
 * 2. Walking & Calorie Burn Analysis:
 *    - High walking / high calories burned: Skeletal muscle contraction stimulates insulin-independent
 *      glucose uptake via GLUT4 translocation and depletes glycogen. High walking significantly lowers
 *      blood sugar and increases risk of exercise-induced hypoglycemia. The algorithm boosts complex
 *      carbohydrates (+15g to +30g) and healthy fats/proteins to prevent dangerous sugar drops.
 *    - Low walking / sedentary: Lack of physical activity reduces insulin sensitivity and delays glucose
 *      clearance. Ingestion of normal carbohydrates in a sedentary state causes sharp postprandial
 *      hyperglycemic spikes. The algorithm restricts carbohydrates, prescribes high soluble fiber and
 *      vegetables/lean proteins, and advises a 15-minute post-meal walk.
 * 3. Real-time Blood Glucose Integration:
 *    - Hypoglycemia (< 70 mg/dL): Immediate 15g fast carb rescue + sustained complex carb meal.
 *    - Low-Normal (70 - 99 mg/dL): Protective complex carbs, higher if walking was high.
 *    - Target In-Range (100 - 139 mg/dL): Balanced low-GI nutrition tailored to steps.
 *    - Elevated (140 - 180 mg/dL): Low glycemic load, non-starchy vegetables, bitter herbs.
 *    - Hyperglycemia (> 180 mg/dL): Strict ultra-low carb, high hydration, zero simple sugars.
 */

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

/**
 * Calculate calories burned from walking steps based on user body weight
 * Formula: steps * 0.04 * (weightKg / 70)
 */
export function calculateWalkingCalories(steps = 0, weightKg = 70) {
  const safeWeight = Number(weightKg) > 20 ? Number(weightKg) : 70;
  const safeSteps = Math.max(0, Number(steps) || 0);
  const calories = Math.round(safeSteps * 0.04 * (safeWeight / 70));
  const distanceKm = Number((safeSteps * 0.000762).toFixed(2)); // avg stride length 0.762m
  return {
    steps: safeSteps,
    caloriesBurned: calories,
    distanceKm
  };
}

/**
 * Classify walking activity level for the pre-meal window
 */
export function classifyWalkingActivity(steps = 0, caloriesBurned = 0) {
  if (steps >= 4500 || caloriesBurned >= 180) {
    return {
      level: 'high',
      label: 'High Walking Activity',
      color: '#10b981', // green
      badge: 'High Calorie Burn'
    };
  }
  if (steps >= 2000 || caloriesBurned >= 80) {
    return {
      level: 'moderate',
      label: 'Moderate Walking Activity',
      color: '#3b82f6', // blue
      badge: 'Moderate Burn'
    };
  }
  return {
    level: 'low',
    label: 'Low Walking (Sedentary)',
    color: '#f59e0b', // amber/orange
    badge: 'Low Calorie Burn'
  };
}

/**
 * Classify current blood glucose status
 */
export function classifyGlucose(glucoseMg = 110) {
  const g = Number(glucoseMg) || 110;
  if (g < 70) {
    return {
      band: 'hypo',
      label: 'Hypoglycemia (Low Sugar)',
      color: '#ef4444',
      statusText: 'Critically Low Blood Sugar',
      targetImpact: 'High risk of severe crash. Immediate fast-acting glucose required.'
    };
  }
  if (g <= 99) {
    return {
      band: 'low-normal',
      label: 'Low-Normal Glucose',
      color: '#06b6d4',
      statusText: 'Low-Normal Sugar',
      targetImpact: 'Prone to drop further if high activity or walking was performed.'
    };
  }
  if (g <= 139) {
    return {
      band: 'target',
      label: 'Optimal In-Range',
      color: '#10b981',
      statusText: 'Healthy Pre-Meal Target',
      targetImpact: 'Maintain stability with balanced low-GI macronutrients.'
    };
  }
  if (g <= 180) {
    return {
      band: 'elevated',
      label: 'Elevated Glucose',
      color: '#f59e0b',
      statusText: 'Mild-to-Moderate Elevation',
      targetImpact: 'Requires low glycemic load to avoid crossing 180+ postprandial.'
    };
  }
  return {
    band: 'high',
    label: 'Hyperglycemia (High Sugar)',
    color: '#ef4444',
    statusText: 'High Blood Sugar Alert',
    targetImpact: 'Acute spike risk. Strict carb restriction and high hydration required.'
  };
}

/**
 * Format 24h 'HH:mm' time string into friendly 12h format e.g. '1:00 PM'
 */
export function formatTime12h(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m || 0).padStart(2, '0')} ${period}`;
}

/**
 * Get detailed 1-hour pre-meal window details for a given meal:
 * - Checks if current time is at or after 1 hour before eating time (stays active throughout the day till 11:59 PM)
 * - At 11:59 PM / midnight, refreshes and resets back to showing the recommend message until the next day's 1-hour mark
 */
export function getMealWindowDetails(mealType = 'lunch', mealTimes = {}, customNow = new Date()) {
  const defaults = {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '20:00'
  };
  const mealTime = mealTimes?.[mealType] || defaults[mealType] || '13:00';
  const [h, m] = mealTime.split(':').map(Number);
  const eatingMinutes = (h || 0) * 60 + (m || 0);
  const currentMinutes = customNow.getHours() * 60 + customNow.getMinutes();

  // Recommendation is scheduled at 1 hour before eating time (e.g. 8:00 AM -> 7:00 AM):
  const triggerMinutes = (eatingMinutes - 60 + 1440) % 1440;
  const th = Math.floor(triggerMinutes / 60);
  const tm = triggerMinutes % 60;
  const recommendationTime = `${String(th).padStart(2, '0')}:${String(tm).padStart(2, '0')}`;

  // Once 1 hour prior arrives, recommended food shows throughout the day till 11:59 PM (minute 1439).
  // At 11:59 PM / midnight, it refreshes and resets back to the recommend message.
  const isRecommendedToday = currentMinutes >= triggerMinutes;

  const diffToMeal = eatingMinutes - currentMinutes;
  const isImmediatePreMeal = diffToMeal <= 60 && diffToMeal >= 0;

  let minutesUntilUnlock = 0;
  let countdownFormatted = '';

  if (isRecommendedToday) {
    const minutesLeftToday = 1439 - currentMinutes;
    const hLeft = Math.floor(minutesLeftToday / 60);
    const mLeft = minutesLeftToday % 60;
    countdownFormatted = `Active today till 11:59 PM (${hLeft}h ${mLeft}m remaining)`;
  } else {
    // Waiting for 1-hour-prior trigger today (e.g. between 00:00 and triggerMinutes)
    minutesUntilUnlock = triggerMinutes - currentMinutes;
    const hours = Math.floor(minutesUntilUnlock / 60);
    const mins = minutesUntilUnlock % 60;
    if (hours > 0 && mins > 0) {
      countdownFormatted = `${hours}h ${mins}m`;
    } else if (hours > 0) {
      countdownFormatted = `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      countdownFormatted = `${mins} min${mins !== 1 ? 's' : ''}`;
    }
  }

  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner'
  };

  return {
    mealType,
    mealLabel: mealLabels[mealType] || mealType,
    eatingTime: mealTime,
    eatingTime12h: formatTime12h(mealTime),
    recommendationTime,
    recommendationTime12h: formatTime12h(recommendationTime),
    triggerMinutes,
    isRecommendedToday,
    isImmediatePreMeal,
    diffToMeal,
    minutesUntilUnlock,
    countdownFormatted
  };
}

/**
 * Find the current or upcoming meal window:
 * - Recommended food shows throughout the day once 1 hr prior arrives till 11:59 PM
 * - Refreshes at 11:59 PM to show the recommend message
 */
export function getUpcomingMealWindow(mealTimes = {}, customNow = new Date()) {
  const defaults = {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '20:00'
  };
  const times = {
    breakfast: mealTimes?.breakfast || defaults.breakfast,
    lunch: mealTimes?.lunch || defaults.lunch,
    dinner: mealTimes?.dinner || defaults.dinner
  };

  const now = customNow;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeMin = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 480;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const mealList = [
    { type: 'breakfast', label: 'Breakfast', time: times.breakfast, minutes: parseTimeMin(times.breakfast) },
    { type: 'lunch', label: 'Lunch', time: times.lunch, minutes: parseTimeMin(times.lunch) },
    { type: 'dinner', label: 'Dinner', time: times.dinner, minutes: parseTimeMin(times.dinner) }
  ];

  // Calculate recommendation trigger time (1 hour before eating time = eating time - 60 mins)
  mealList.forEach(m => {
    m.recTriggerMinutes = (m.minutes - 60 + 1440) % 1440;
    const th = Math.floor(m.recTriggerMinutes / 60);
    const tm = m.recTriggerMinutes % 60;
    m.recommendationTime = `${String(th).padStart(2, '0')}:${String(tm).padStart(2, '0')}`;
    m.eatingTime12h = formatTime12h(m.time);
    m.recommendationTime12h = formatTime12h(m.recommendationTime);
    m.isRecommendedToday = currentMinutes >= m.recTriggerMinutes;
  });

  // Sort by time of day
  mealList.sort((a, b) => a.minutes - b.minutes);

  // Determine current active selection based on time of day:
  // - Dinner if past dinner trigger (e.g. 19:00 - 23:59)
  // - Lunch if past lunch trigger (e.g. 12:00 - 18:59)
  // - Breakfast if past breakfast trigger (e.g. 07:00 - 11:59)
  // - Breakfast (locked, waiting for 7am) if early morning (00:00 - 06:59)
  let currentSelection = mealList[0];
  if (currentMinutes >= mealList[2].recTriggerMinutes) {
    currentSelection = mealList[2];
  } else if (currentMinutes >= mealList[1].recTriggerMinutes) {
    currentSelection = mealList[1];
  } else if (currentMinutes >= mealList[0].recTriggerMinutes) {
    currentSelection = mealList[0];
  } else {
    currentSelection = mealList[0];
  }

  const activeMeal = currentSelection.isRecommendedToday ? currentSelection : null;
  const isOneHourBefore = Boolean(activeMeal);

  return {
    currentMinutes,
    activeMeal,
    currentSelection,
    allMeals: mealList,
    isOneHourBefore
  };
}

/**
 * Primary Clinical Pre-Meal Food Recommendation Engine
 * Analyzes glucose level + steps walked + calories burned before eating time.
 */
export function generatePreMealRecommendation({
  user = {},
  currentGlucose = 110,
  stepsWalked = 0,
  mealType = 'lunch',
  mealTime = '13:00',
  forceHypoScenario = false,
  forceHighScenario = false
}) {
  const weightKg = Number(user.weight) || 72;
  const age = Number(user.age) || 40;
  const diabetesType = user.diabetesType || 'Type 2';
  const name = user.name || 'User';

  const { steps, caloriesBurned, distanceKm } = calculateWalkingCalories(stepsWalked, weightKg);
  const activity = classifyWalkingActivity(steps, caloriesBurned);
  const glucoseInfo = classifyGlucose(currentGlucose);

  const mealUpper = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  // 1-hour-before recommendation time
  const [mh, mm] = (mealTime || '13:00').split(':').map(Number);
  const mealTotalMin = (mh || 13) * 60 + (mm || 0);
  const recMin = (mealTotalMin - 60 + 1440) % 1440;
  const recHour = Math.floor(recMin / 60);
  const recMinute = recMin % 60;
  const recommendationTriggerTime = `${String(recHour).padStart(2, '0')}:${String(recMinute).padStart(2, '0')}`;

  // PHYSIOLOGICAL INTERACTION MATRIX:
  // Walking + Calorie Burn + Blood Glucose interaction
  let physiologicalRationale = '';
  let walkingImpactType = 'neutral'; // 'low_sugar_risk' | 'high_sugar_spike_risk' | 'optimal_balance'
  let carbAdjustmentGram = 0;
  let carbAdjustmentReason = '';
  let alertBadge = '';
  let alertLevel = 'info'; // 'warning' | 'danger' | 'success' | 'info'
  let postMealWalkMinutes = 15;

  const isHighWalking = activity.level === 'high';
  const isLowWalking = activity.level === 'low';
  const isHypo = glucoseInfo.band === 'hypo' || forceHypoScenario;
  const isHighGlucose = glucoseInfo.band === 'high' || glucoseInfo.band === 'elevated' || forceHighScenario;

  if (isHypo) {
    walkingImpactType = 'low_sugar_risk';
    alertLevel = 'danger';
    alertBadge = '⚠️ CRITICAL: Hypoglycemia Risk';
    carbAdjustmentGram = +35;
    carbAdjustmentReason = 'Emergency rapid glycogen recovery needed. Exercise and low intake depleted your circulating glucose.';
    physiologicalRationale = `Your blood glucose is critically low (${currentGlucose} mg/dL). Having walked ${steps.toLocaleString()} steps and burned ${caloriesBurned} kcal, your muscles have drained circulating glucose via GLUT4 activity. You are at imminent risk of a severe hypoglycemic crash. Fast-acting carbs followed immediately by complex carbs are required.`;
    postMealWalkMinutes = 0; // Rest strictly
  } else if (isHighWalking && (glucoseInfo.band === 'low-normal' || currentGlucose <= 95)) {
    walkingImpactType = 'low_sugar_risk';
    alertLevel = 'warning';
    alertBadge = '⚠️ High Walking Low-Sugar Warning';
    carbAdjustmentGram = +25;
    carbAdjustmentReason = `Burned ${caloriesBurned} kcal from ${steps.toLocaleString()} steps. High muscle glucose uptake is pulling sugar down fast.`;
    physiologicalRationale = `You walked ${steps.toLocaleString()} steps before ${mealUpper}, burning ~${caloriesBurned} kcal! Because vigorous walking activates muscle GLUT4 receptors to consume blood glucose independently of insulin, your low-normal sugar (${currentGlucose} mg/dL) could plummet into hypoglycemia if you eat an ultra-low-carb meal. We have added +25g of slow-burning complex carbs, healthy protein, and wholesome fats to safeguard your levels.`;
    postMealWalkMinutes = 5; // Light stroll only
  } else if (isHighWalking && isHighGlucose) {
    walkingImpactType = 'optimal_balance';
    alertLevel = 'success';
    alertBadge = '✅ Exercise Glucose Clearance Active';
    carbAdjustmentGram = 0;
    carbAdjustmentReason = `Your ${caloriesBurned} kcal burn is actively lowering your high ${currentGlucose} mg/dL reading. Keep carbs moderate to prevent re-spiking.`;
    physiologicalRationale = `Great job walking ${steps.toLocaleString()} steps (${caloriesBurned} kcal burned) before ${mealUpper}! This exercise has primed your muscles to clear your elevated glucose (${currentGlucose} mg/dL). Maintain a moderate carb allowance with rich fiber and lean protein so your blood sugar smoothly glides back into the target zone without rebounding.`;
    postMealWalkMinutes = 10;
  } else if (isHighWalking && glucoseInfo.band === 'target') {
    walkingImpactType = 'optimal_balance';
    alertLevel = 'success';
    alertBadge = '🌟 High Calorie Burn & In-Range Glucose';
    carbAdjustmentGram = +15;
    carbAdjustmentReason = `Replenish muscle glycogen safely after burning ${caloriesBurned} kcal.`;
    physiologicalRationale = `Outstanding effort! Walking ${steps.toLocaleString()} steps (${caloriesBurned} kcal) with target glucose (${currentGlucose} mg/dL) creates optimal insulin sensitivity. We have balanced your ${mealUpper} with +15g high-fiber complex carbs to replenish depleted glycogen stores safely.`;
    postMealWalkMinutes = 10;
  } else if (isLowWalking && isHighGlucose) {
    walkingImpactType = 'high_sugar_spike_risk';
    alertLevel = 'danger';
    alertBadge = '🚨 Sedentary High-Spike Risk';
    carbAdjustmentGram = -25;
    carbAdjustmentReason = `Low activity (${steps} steps, ${caloriesBurned} kcal) reduces insulin sensitivity. Strict low-carb restriction applied to stop spikes.`;
    physiologicalRationale = `Warning: You have only walked ${steps.toLocaleString()} steps (${caloriesBurned} kcal) before ${mealUpper}, while your glucose is already high (${currentGlucose} mg/dL). Sedentary muscles have dormant GLUT4 receptors and poor glucose uptake. Eating normal carbohydrates now will trigger an aggressive postprandial glucose spike (exceeding 220+ mg/dL). We recommend strict low-carb, high-fiber Indian superfoods (karela, methi, paneer, sprouts) and consistent pre-meal walking.`;
  } else if (isLowWalking && (glucoseInfo.band === 'target' || glucoseInfo.band === 'low-normal')) {
    walkingImpactType = 'high_sugar_spike_risk';
    alertLevel = 'warning';
    alertBadge = '⚠️ Sedentary Pre-Meal Alert';
    carbAdjustmentGram = -15;
    carbAdjustmentReason = `Inactive pre-meal state (${steps} steps) requires strict portion control to avoid sudden glucose spike.`;
    physiologicalRationale = `You have walked only ${steps.toLocaleString()} steps before ${mealUpper} (${caloriesBurned} kcal burned). Lower pre-meal walking leaves insulin sensitivity unprimed. To keep your current ${currentGlucose} mg/dL sugar from spiking steeply after eating, we have curated low glycemic index (GI < 45) foods with high soluble fiber, and reduced standard carbs by 15g.`;
    postMealWalkMinutes = 15;
  } else {
    // Moderate walking
    walkingImpactType = 'optimal_balance';
    alertLevel = 'info';
    alertBadge = '📊 Balanced Pre-Meal Profile';
    carbAdjustmentGram = 0;
    carbAdjustmentReason = `Moderate physical activity (${steps} steps, ${caloriesBurned} kcal) supports standard balanced low-GI targets.`;
    physiologicalRationale = `You walked ${steps.toLocaleString()} steps (${caloriesBurned} kcal) before ${mealUpper}. With glucose at ${currentGlucose} mg/dL, standard evidence-based Indian diabetic nutrition is optimal. Eat your fiber and protein first, followed by complex carbohydrates.`;
    postMealWalkMinutes = 15;
  }

  // Curate Indian Meals tailored to Meal Type & Physiological Category
  const mealDishes = getCuratedIndianMealOptions({
    mealType,
    walkingImpactType,
    glucoseBand: glucoseInfo.band,
    isHypo,
    isHighGlucose,
    isHighWalking,
    isLowWalking
  });

  return {
    id: `prm_${mealType}_${Date.now()}`,
    mealType,
    mealLabel: mealUpper,
    scheduledEatingTime: mealTime,
    recommendationGeneratedTime: recommendationTriggerTime,
    userProfile: {
      name,
      age,
      weightKg,
      diabetesType
    },
    metrics: {
      currentGlucose,
      glucoseBand: glucoseInfo.band,
      glucoseLabel: glucoseInfo.label,
      glucoseColor: glucoseInfo.color,
      stepsWalked: steps,
      distanceKm,
      caloriesBurned,
      activityLevel: activity.level,
      activityLabel: activity.label,
      activityBadge: activity.badge
    },
    clinicalAnalysis: {
      walkingImpactType,
      alertBadge,
      alertLevel,
      carbAdjustmentGram,
      carbAdjustmentReason,
      physiologicalRationale,
      postMealWalkMinutes
    },
    recommendedMeals: mealDishes.items,
    recommendedBeverage: mealDishes.beverage,
    foodsToPrioritize: mealDishes.prioritize,
    foodsToAvoid: mealDishes.avoid,
    actionAdvice: mealDishes.actionAdvice,
    timestamp: new Date().toISOString()
  };
}

/**
 * Curated authentic Indian meal dishes based on the physiological synergy
 */
function getCuratedIndianMealOptions({
  mealType = 'lunch',
  walkingImpactType = 'neutral',
  glucoseBand = 'target',
  isHypo = false,
  isHighGlucose = false,
  isHighWalking = false,
  isLowWalking = false
}) {
  // 1. Hypoglycemia Rescue Meals
  if (isHypo) {
    return {
      items: [
        {
          name: 'Whole Wheat Paratha with Paneer Bhurji & Curd',
          icon: '🫓',
          calories: 380,
          carbs: 45,
          protein: 18,
          fat: 14,
          fiber: 6,
          giIndex: 48,
          giRating: 'Low-Medium GI',
          portion: '2 small parathas + 1 cup paneer bhurji + 1/2 cup curd',
          glycemicReason: 'CRITICAL: Rapid yet sustained glucose restoration. Provides healthy complex carbs to pull out of hypoglycemia, with protein to prevent rebound crash.',
          ingredients: ['Whole wheat flour', 'Fresh paneer', 'Onion & tomatoes', 'Cumin & turmeric'],
          recipe: 'Knead soft dough, roll lightly with ghee, serve with freshly scrambled spiced paneer and curd.'
        },
        {
          name: 'Steamed Idlis with Vegetable Sambar & Banana Slice',
          icon: '🥣',
          calories: 340,
          carbs: 52,
          protein: 12,
          fat: 5,
          fiber: 7,
          giIndex: 55,
          giRating: 'Medium GI',
          portion: '3 idlis + 1 large bowl sambar + 1 small banana',
          glycemicReason: 'Quickly elevates dangerous low blood sugar safely, while sambar lentils supply amino acids and sustained digestion.',
          ingredients: ['Fermented rice & urad dal', 'Toor dal', 'Drumstick & carrots', 'Curry leaves'],
          recipe: 'Steam fresh fluffy idlis. Simmer rich toor dal with vegetables, tamarind, and mild sambar spices.'
        }
      ],
      beverage: '1 glass Fresh Tender Coconut Water (or 1/2 glass Orange Juice if <60 mg/dL)',
      prioritize: ['Whole grains', 'Paneer', 'Curd', 'Lentils', 'Fresh fruits'],
      avoid: ['Delaying meal', 'Skipping carbs', 'Excessive insulin without carbs'],
      actionAdvice: 'Rule of 15: If sugar is below 70, drink 1/2 glass fruit juice or take 3 glucose tablets immediately. Wait 15 minutes, recheck, then consume this recommended meal.'
    };
  }

  // 2. High Walking / High Calorie Burn (Low Sugar Risk) Meals
  if (isHighWalking && (walkingImpactType === 'low_sugar_risk' || glucoseBand === 'low-normal')) {
    if (mealType === 'breakfast') {
      return {
        items: [
          {
            name: 'Moong Dal Cheela with Stuffed Paneer & Green Mint Chutney',
            icon: '🥞',
            calories: 320,
            carbs: 38,
            protein: 20,
            fat: 10,
            fiber: 8,
            giIndex: 38,
            giRating: 'Low GI',
            portion: '2 cheelas with 80g paneer filling + 2 tbsp mint chutney',
            glycemicReason: 'Prevents post-walk hypoglycemia! High protein from moong dal & paneer with adequate complex carbs buffers muscle glycogen depletion.',
            ingredients: ['Yellow moong dal', 'Grated paneer', 'Mint & coriander', 'Ginger & green chillies'],
            recipe: 'Soak and blend moong dal into smooth batter. Cook on non-stick tawa with drop of olive oil, fill with seasoned paneer.'
          },
          {
            name: 'Steel-Cut Oats Upma with Almonds & Flaxseeds',
            icon: '🥣',
            calories: 310,
            carbs: 42,
            protein: 14,
            fat: 9,
            fiber: 9,
            giIndex: 42,
            giRating: 'Low GI',
            portion: '1.5 cups cooked upma + 8 crushed almonds',
            glycemicReason: 'Beta-glucan fiber releases steady glucose into bloodstream, replacing calories burned during walking without spiking insulin.',
            ingredients: ['Steel-cut oats', 'Mustard seeds', 'Curry leaves', 'Green peas & carrots', 'Raw almonds'],
            recipe: 'Temper mustard seeds, curry leaves, and veggies in ghee. Add roasted oats and boiling water; cook until fluffy.'
          }
        ],
        beverage: 'Unsweetened Spiced Buttermilk (Chaas) with roasted jeera & rock salt',
        prioritize: ['Moong dal', 'Paneer', 'Oats', 'Nuts', 'Flaxseed'],
        avoid: ['Skipping carbohydrates', 'Black coffee on empty stomach', 'White flour toast'],
        actionAdvice: 'Your morning walk burned significant calories! Enjoy complex carbs and protein to keep your sugar smoothly stabilized above 80 mg/dL.'
      };
    }

    if (mealType === 'lunch') {
      return {
        items: [
          {
            name: 'Multigrain Phulka with Palak Paneer & Yellow Moong Dal',
            icon: '🫓',
            calories: 420,
            carbs: 46,
            protein: 22,
            fat: 14,
            fiber: 10,
            giIndex: 40,
            giRating: 'Low GI',
            portion: '2 multigrain phulkas + 1 cup palak paneer + 1 cup moong dal + cucumber salad',
            glycemicReason: 'Restores glycogen after high walking burn. Low-GI wheat/jowar flour combined with spinach and paneer prevents sugar crash.',
            ingredients: ['Multigrain flour (wheat + jowar)', 'Spinach puree', 'Low-fat paneer', 'Moong dal', 'Garlic & cumin'],
            recipe: 'Roast oil-free phulkas on flame. Simmer fresh spinach puree with garlic, spices, and paneer cubes.'
          },
          {
            name: 'Brown Rice Khichdi with Mixed Veggies & Cucumber Raita',
            icon: '🍛',
            calories: 390,
            carbs: 48,
            protein: 16,
            fat: 9,
            fiber: 9,
            giIndex: 45,
            giRating: 'Low GI',
            portion: '1.5 cups khichdi + 1 cup cucumber jeera raita',
            glycemicReason: 'Whole brown rice and split green moong provide slow-release glucose to nourish glycogen-depleted leg muscles.',
            ingredients: ['Brown basmati rice', 'Split green moong dal', 'Carrots & beans', 'Ghee (1 tsp)', 'Curd'],
            recipe: 'Pressure cook brown rice and dal with turmeric, ginger, and diced vegetables. Temper with cumin in half-teaspoon ghee.'
          }
        ],
        beverage: 'Refreshing Mint & Coriander Chaas with roasted cumin',
        prioritize: ['Jowar/Multigrain roti', 'Green moong dal', 'Palak paneer', 'Cucumber raita'],
        avoid: ['Deep fried pakoras', 'Refined white rice', 'Sweet beverages'],
        actionAdvice: 'High calorie expenditure detected! Eat the vegetable salad first, followed by dal and multigrain roti.'
      };
    }

    // Dinner
    return {
      items: [
        {
          name: 'Bajra Roti with Methi Dal & Grilled Paneer Salad',
          icon: '🫓',
          calories: 370,
          carbs: 42,
          protein: 20,
          fat: 12,
          fiber: 11,
          giIndex: 38,
          giRating: 'Low GI',
          portion: '1 thick bajra roti + 1 cup methi dal + 80g spiced grilled paneer',
          glycemicReason: 'Bajra (pearl millet) is rich in magnesium and slow-digesting carbs. Prevents nocturnal hypoglycemia after evening steps.',
          ingredients: ['Bajra flour', 'Fresh fenugreek leaves (methi)', 'Toor or masoor dal', 'Paneer cubes'],
          recipe: 'Hand-pat bajra roti and cook with minimal ghee. Simmer chopped methi with dal, garlic, and hing.'
        },
        {
          name: 'Vegetable Daliya Khichdi with Sprouted Moong & Curd',
          icon: '🥣',
          calories: 340,
          carbs: 44,
          protein: 17,
          fat: 8,
          fiber: 10,
          giIndex: 40,
          giRating: 'Low GI',
          portion: '1.5 cups broken wheat daliya khichdi + 1/2 cup curd',
          glycemicReason: 'Broken wheat daliya has a very low glycemic load. Ensures overnight glucose stability and muscle repair after walking.',
          ingredients: ['Broken wheat (daliya)', 'Sprouted green moong', 'Tomato, beans, carrots', 'Jeera & mustard'],
          recipe: 'Roast daliya lightly. Cook with sprouted moong, diced vegetables, turmeric, and cumin until tender.'
        }
      ],
      beverage: 'Warm Cinnamon & Methi seed infused water',
      prioritize: ['Bajra roti', 'Methi (fenugreek)', 'Daliya', 'Grilled paneer'],
      avoid: ['Late heavy carbs', 'Sugar sweets', 'Starchy potatoes'],
      actionAdvice: 'Eating complex carbs at dinner protects you from midnight low-sugar episodes after an active day.'
    };
  }

  // 3. Low Walking / Sedentary (High Sugar Spike Risk) Meals
  if (isLowWalking || isHighGlucose) {
    if (mealType === 'breakfast') {
      return {
        items: [
          {
            name: 'Sprouted Methi & Moong Chaat with Roasted Makhana',
            icon: '🥗',
            calories: 220,
            carbs: 22,
            protein: 15,
            fat: 4,
            fiber: 11,
            giIndex: 28,
            giRating: 'Very Low GI',
            portion: '1.5 cups steamed sprout chaat + 1 small bowl roasted makhana',
            glycemicReason: 'URGENT: Sedentary muscles have low glucose uptake! This meal has only 22g net carbs with 11g fiber, preventing morning glucose spikes.',
            ingredients: ['Sprouted green moong', 'Fresh methi leaves', 'Fox nuts (makhana)', 'Lemon juice & rock salt', 'Cucumber'],
            recipe: 'Steam sprouts for 3 mins. Toss with finely chopped cucumber, tomato, methi, roasted makhana, lemon juice, and chaat masala.'
          },
          {
            name: 'Besan Methi Cheela with Mint Chutney (No Oil)',
            icon: '🥞',
            calories: 230,
            carbs: 24,
            protein: 14,
            fat: 6,
            fiber: 8,
            giIndex: 32,
            giRating: 'Low GI',
            portion: '2 thin cheelas + 2 tbsp fresh coriander mint chutney',
            glycemicReason: 'Chickpea flour (besan) is low-GI and protein-dense. Fenugreek (methi) contains trigonelline which boosts cellular insulin sensitivity.',
            ingredients: ['Gram flour (besan)', 'Fresh fenugreek leaves', 'Ajwain (carom seeds)', 'Turmeric & green chilli'],
            recipe: 'Mix besan with chopped methi, ajwain, turmeric, and water. Cook on non-stick pan without extra oil until crisp.'
          }
        ],
        beverage: 'Warm Methi Seed Water (Soaked fenugreek water) or Green Tea',
        prioritize: ['Sprouts', 'Besan', 'Methi', 'Karela', 'Makhana'],
        avoid: ['White bread', 'Sweet poha with sugar', 'Idli without sambar veggies', 'Fruit juices'],
        actionAdvice: '🚨 Low walking activity detected before this meal! A brisk walk before eating stimulates muscle GLUT4 to absorb mealtime glucose.'
      };
    }

    if (mealType === 'lunch') {
      return {
        items: [
          {
            name: 'Karela Bhindi Sabzi with 1 Jowar Roti & Sprout Salad',
            icon: '🥗',
            calories: 280,
            carbs: 28,
            protein: 14,
            fat: 8,
            fiber: 12,
            giIndex: 30,
            giRating: 'Very Low GI',
            portion: '1 thin jowar roti + 1 large cup bitter gourd/okra sabzi + 1 cup sprout salad',
            glycemicReason: 'Low walking causes high post-meal sugar! Karela contains charantin and polypeptide-p which mimic insulin. Restricts carbs to under 30g.',
            ingredients: ['Bitter gourd (karela)', 'Okra (bhindi)', 'Jowar (sorghum) flour', 'Sprouted moong', 'Mustard oil (1/2 tsp)'],
            recipe: 'Sauté sliced karela and bhindi with minimal oil, onion, and spices. Serve with 1 freshly pressed jowar roti.'
          },
          {
            name: 'Palak Paneer Clear Broth with Grilled Vegetable Bowl',
            icon: '🍲',
            calories: 260,
            carbs: 18,
            protein: 18,
            fat: 11,
            fiber: 9,
            giIndex: 25,
            giRating: 'Very Low GI',
            portion: '1 large bowl spinach-paneer soup + 1 bowl grilled broccoli, capsicum, and zucchini',
            glycemicReason: 'Ultra-low glycemic load. Protein and insoluble fiber stabilize insulin receptors without adding circulating glucose.',
            ingredients: ['Spinach puree', 'Low fat paneer', 'Capsicum & zucchini', 'Garlic & black pepper'],
            recipe: 'Simmer spinach puree with garlic, black pepper, and cubed paneer. Pair with seasoned grilled bell peppers.'
          }
        ],
        beverage: 'Cumin & Black Pepper Infused Warm Lemon Water',
        prioritize: ['Karela (bitter gourd)', 'Jowar', 'Spinach', 'Okra', 'Cucumber'],
        avoid: ['White rice', 'Naan / refined maida', 'Potato curry', 'Sweet lassi'],
        actionAdvice: 'Sedentary state before meal: Walking before eating primes muscle GLUT4 transporters to clear mealtime glucose.'
      };
    }

    // Dinner
    return {
      items: [
        {
          name: 'Lauki (Bottle Gourd) Moong Dal Soup with Cucumber Slices',
          icon: '🥣',
          calories: 210,
          carbs: 22,
          protein: 13,
          fat: 4,
          fiber: 8,
          giIndex: 26,
          giRating: 'Very Low GI',
          portion: '1.5 large bowls lauki-moong soup + 1 plate cucumber & radish with lemon',
          glycemicReason: 'Lightest possible dinner for low-activity days. Prevents midnight hyperglycemia and dawn phenomenon glucose rises.',
          ingredients: ['Bottle gourd (lauki)', 'Yellow moong dal', 'Jeera & ginger', 'Fresh coriander'],
          recipe: 'Pressure cook chopped lauki with moong dal, ginger, and turmeric. Puree lightly and temper with roasted jeera.'
        },
        {
          name: 'Methi Paneer Salad with Roasted Flaxseeds',
          icon: '🥗',
          calories: 240,
          carbs: 16,
          protein: 18,
          fat: 10,
          fiber: 7,
          giIndex: 22,
          giRating: 'Very Low GI',
          portion: '1 large salad bowl with 100g grilled paneer and 1 tbsp ground flaxseeds',
          glycemicReason: 'Nearly zero carb impact. Omega-3 from flaxseeds improves insulin sensitivity, keeping nocturnal sugar flat and steady.',
          ingredients: ['Fresh fenugreek leaves', 'Low-fat paneer cubes', 'Roasted flaxseed powder', 'Lemon juice & rock salt'],
          recipe: 'Toss fresh washed methi leaves with warm grilled paneer cubes, roasted flaxseeds, lemon juice, and black pepper.'
        }
      ],
      beverage: 'Warm Chamomile or Cinnamon Bark Water',
      prioritize: ['Lauki', 'Moong dal soup', 'Methi', 'Flaxseed', 'Radish'],
      avoid: ['Roti at late dinner', 'Rice / Biryani', 'Ice creams', 'Fried snacks'],
      actionAdvice: 'Ensure your Before Dinner walk is completed to keep nocturnal blood glucose flat and prevent overnight spikes.'
    };
  }

  // 4. Default Balanced Target Options
  return {
    items: [
      {
        name: mealType === 'breakfast' ? 'Vegetable Oats Upma with Peanuts' : mealType === 'lunch' ? '2 Multigrain Rotis with Dal Tadka & Bhindi' : 'Daliya Khichdi with Mixed Vegetables',
        icon: '🍲',
        calories: 340,
        carbs: 38,
        protein: 15,
        fat: 9,
        fiber: 9,
        giIndex: 38,
        giRating: 'Low GI',
        portion: 'Standard diabetic portion with salad',
        glycemicReason: 'Standard balanced diabetic meal. High fiber slows carbohydrate absorption to keep post-meal glucose below 140 mg/dL.',
        ingredients: ['Whole grains', 'Lentils', 'Seasonal vegetables', 'Traditional Indian spices'],
        recipe: 'Cooked fresh with minimal cold-pressed oil and aromatic spices.'
      },
      {
        name: mealType === 'breakfast' ? 'Ragi Idli with Sambar & Coconut Chutney' : mealType === 'lunch' ? 'Brown Basmati Rice with Rajma & Cucumber Salad' : 'Moong Dal Cheela with Grilled Veggies',
        icon: '🍛',
        calories: 330,
        carbs: 40,
        protein: 16,
        fat: 8,
        fiber: 8,
        giIndex: 40,
        giRating: 'Low GI',
        portion: 'Standard portion',
        glycemicReason: 'Excellent complex carbohydrate profile paired with plant-based protein.',
        ingredients: ['Finger millet / Pulses', 'Vegetables', 'Herbs & spices'],
        recipe: 'Steamed or slow-simmered with nutrient-dense authentic ingredients.'
      }
    ],
    beverage: 'Fresh Jeera Buttermilk (Chaas)',
    prioritize: ['Whole grains', 'Lentils', 'Green leafy vegetables', 'Curd'],
    avoid: ['Refined flours', 'Packaged snacks', 'Sugary condiments'],
    actionAdvice: 'Optimal glycemic zone! Maintain consistency with your 3 daily pre-meal walks.'
  };
}
