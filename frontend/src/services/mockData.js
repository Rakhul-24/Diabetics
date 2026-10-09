// Rich realistic dataset for diabetes management & lifestyle health

const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d, h = 0) => new Date(now.getTime() - (d * 24 + h) * 3600 * 1000).toISOString();

export const initialUser = {
  id: 'u1',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  phone: '+91 98765 43210',
  age: 42,
  gender: 'Male',
  height: 175, // cm
  weight: 78.5, // kg
  diabetesType: 'Type 2',
  bloodGroup: 'B+',
  targetGlucoseMin: 70,
  targetGlucoseMax: 140,
  unitPreference: 'mg/dL', // 'mg/dL' or 'mmol/L'
  medicalHistory: [
    'Type 2 Diabetes (diagnosed 2019)',
    'Mild Hypertension',
    'Elevated LDL Cholesterol'
  ],
  allergies: ['Penicillin'],
  foodPreferences: ['Vegetarian Friendly', 'Low-Carb', 'High-Fiber'],
  activityLevel: 'Moderate (3-4 days/week)',
  emergencyContactName: 'Sunita Sharma (Spouse)',
  emergencyContactPhone: '+91 98888 12345',
  doctorName: 'Dr. Priya Nair (Endocrinologist)',
  doctorPhone: '+91 44 2829 6000',
  doctorHospital: 'Apollo Diabetes Centre, Chennai'
};

export const initialGlucoseReadings = [
  // Day -6
  { id: 'g1', readingMg: 110, type: 'fasting', timestamp: daysAgo(6, 20), notes: 'Good morning fasting' },
  { id: 'g2', readingMg: 145, type: 'afterMeal', timestamp: daysAgo(6, 14), notes: 'Post lunch walk done' },
  { id: 'g3', readingMg: 130, type: 'beforeMeal', timestamp: daysAgo(6, 6), notes: 'Before dinner' },
  // Day -5
  { id: 'g4', readingMg: 115, type: 'fasting', timestamp: daysAgo(5, 21), notes: '' },
  { id: 'g5', readingMg: 160, type: 'afterMeal', timestamp: daysAgo(5, 13), notes: 'After dinner' },
  { id: 'g6', readingMg: 125, type: 'beforeMeal', timestamp: daysAgo(5, 5), notes: '' },
  // Day -4
  { id: 'g7', readingMg: 108, type: 'fasting', timestamp: daysAgo(4, 22), notes: 'Felt well rested' },
  { id: 'g8', readingMg: 182, type: 'afterMeal', timestamp: daysAgo(4, 12), notes: 'Birthday celebration treats' },
  { id: 'g9', readingMg: 140, type: 'beforeMeal', timestamp: daysAgo(4, 4), notes: '' },
  // Day -3
  { id: 'g10', readingMg: 118, type: 'fasting', timestamp: daysAgo(3, 21), notes: '' },
  { id: 'g11', readingMg: 155, type: 'afterMeal', timestamp: daysAgo(3, 14), notes: 'Salad + Paneer lunch' },
  { id: 'g12', readingMg: 135, type: 'beforeMeal', timestamp: daysAgo(3, 6), notes: '' },
  // Day -2
  { id: 'g13', readingMg: 112, type: 'fasting', timestamp: daysAgo(2, 22), notes: 'Morning fasting' },
  { id: 'g14', readingMg: 190, type: 'afterMeal', timestamp: daysAgo(2, 11), notes: 'Ate biryani' },
  { id: 'g15', readingMg: 150, type: 'beforeMeal', timestamp: daysAgo(2, 5), notes: '' },
  // Day -1
  { id: 'g16', readingMg: 105, type: 'fasting', timestamp: daysAgo(1, 20), notes: 'Target fasting level' },
  { id: 'g17', readingMg: 165, type: 'afterMeal', timestamp: daysAgo(1, 13), notes: 'Roti with veggies' },
  { id: 'g18', readingMg: 128, type: 'beforeMeal', timestamp: daysAgo(1, 4), notes: '' },
  // Today
  { id: 'g19', readingMg: 114, type: 'fasting', timestamp: hoursAgo(10), notes: 'Morning fasting' },
  { id: 'g20', readingMg: 152, type: 'afterMeal', timestamp: hoursAgo(3), notes: '1.5 hrs after lunch' },
  { id: 'g21', readingMg: 122, type: 'random', timestamp: hoursAgo(1), notes: 'Afternoon check' }
];

export const initialMedications = [
  {
    id: 'm1',
    name: 'Metformin HCl',
    dosage: '500 mg',
    form: 'Tablet',
    frequency: 'Twice daily (Morning & Night)',
    times: ['08:00', '20:00'],
    instructions: 'Take immediately with meals to reduce GI irritation',
    color: '#10B981',
    takenToday: [true, false],
    adherenceRate: 96
  },
  {
    id: 'm2',
    name: 'Glipizide',
    dosage: '5 mg',
    form: 'Tablet',
    frequency: 'Once daily (Morning)',
    times: ['07:30'],
    instructions: 'Take 30 minutes before breakfast',
    color: '#3B82F6',
    takenToday: [true],
    adherenceRate: 92
  },
  {
    id: 'm3',
    name: 'Atorvastatin',
    dosage: '10 mg',
    form: 'Tablet',
    frequency: 'Once daily (Bedtime)',
    times: ['22:00'],
    instructions: 'Take at night before sleep for cholesterol management',
    color: '#8B5CF6',
    takenToday: [false],
    adherenceRate: 100
  }
];

export const initialMealPlan = {
  dailyCalorieTarget: 1750,
  dailyCarbTarget: 140, // grams
  dailyProteinTarget: 85, // grams
  dailyFatTarget: 50, // grams
  meals: {
    breakfast: [
      {
        id: 'f1',
        name: 'Methi Paratha with Fresh Curd',
        calories: 280,
        carbs: 34,
        protein: 10,
        fat: 8,
        fiber: 6,
        giIndex: 38,
        giRating: 'Low GI',
        portion: '2 rotis + 100g low-fat curd',
        icon: '🫓',
        eaten: false,
        ingredients: ['Fenugreek leaves (Methi)', 'Whole wheat flour', 'Low-fat homemade curd', 'Carom seeds (Ajwain)'],
        recipe: 'Knead fresh fenugreek with flour and roasted cumin. Cook on non-stick pan with minimal cold-pressed oil. Serve with cool curd.'
      },
      {
        id: 'f2',
        name: 'Boiled Egg Whites & Multigrain Toast',
        calories: 210,
        carbs: 20,
        protein: 16,
        fat: 5,
        fiber: 4,
        giIndex: 42,
        giRating: 'Low GI',
        portion: '3 egg whites + 1 slice multigrain',
        icon: '🥚',
        eaten: false,
        ingredients: ['Egg whites', 'Multigrain bread slice', 'Cracked black pepper', 'Cherry tomatoes'],
        recipe: 'Boil eggs for 9 mins. Toast multigrain bread. Season with black pepper and herbs.'
      }
    ],
    lunch: [
      {
        id: 'f3',
        name: 'Moong Dal, Brown Rice & Cucumber Raita',
        calories: 420,
        carbs: 56,
        protein: 19,
        fat: 6,
        fiber: 9,
        giIndex: 45,
        giRating: 'Low GI',
        portion: '1 bowl dal + 3/4 cup brown rice + 100g raita',
        icon: '🍲',
        eaten: false,
        ingredients: ['Yellow moong dal', 'Steamed brown rice', 'Cucumber', 'Low fat curd', 'Cumin & curry leaves'],
        recipe: 'Simmer moong dal with turmeric, ginger, and garlic. Pair with brown rice and cooling cucumber raita.'
      },
      {
        id: 'f4',
        name: 'Karela (Bitter Gourd) Garlic Stir-fry',
        calories: 95,
        carbs: 11,
        protein: 3,
        fat: 4,
        fiber: 5,
        giIndex: 25,
        giRating: 'Very Low GI',
        portion: '1 medium bowl (150g)',
        icon: '🥬',
        eaten: false,
        ingredients: ['Thinly sliced bitter gourd', 'Mustard oil (1 tsp)', 'Garlic cloves', 'Dry mango powder (Amchur)'],
        recipe: 'Sauté bitter gourd slices in hot pan with crushed garlic until crisp and golden.'
      }
    ],
    dinner: [
      {
        id: 'f5',
        name: 'Grilled Herb Fish / Tofu & Steamed Broccoli',
        calories: 360,
        carbs: 22,
        protein: 34,
        fat: 10,
        fiber: 7,
        giIndex: 32,
        giRating: 'Low GI',
        portion: '150g fillet or tofu + 1 cup veggies',
        icon: '🐟',
        eaten: false,
        ingredients: ['White fish fillet or Organic Tofu', 'Broccoli florets', 'Lemon juice', 'Oregano & Olive oil'],
        recipe: 'Marinate with lemon, garlic, and fresh herbs. Pan-grill 4 mins each side. Serve with steamed broccoli.'
      }
    ],
    snacks: [
      {
        id: 'f6',
        name: 'Roasted Chana (Chickpeas) & Green Tea',
        calories: 125,
        carbs: 18,
        protein: 7,
        fat: 2,
        fiber: 5,
        giIndex: 30,
        giRating: 'Low GI',
        portion: '35g roasted chana + 1 mug green tea',
        icon: '🥜',
        eaten: false,
        ingredients: ['Roasted whole bengal gram', 'Chaat masala', 'Organic Green Tea bag'],
        recipe: 'Light snack rich in resistant starch that prevents glycemic spikes.'
      },
      {
        id: 'f7',
        name: 'Raw Walnuts & Almonds Handful',
        calories: 90,
        carbs: 4,
        protein: 3,
        fat: 8,
        fiber: 2,
        giIndex: 15,
        giRating: 'Very Low GI',
        portion: '6 almonds + 2 walnut halves',
        icon: '🌰',
        eaten: false,
        ingredients: ['Raw unsalted almonds', 'Raw walnuts'],
        recipe: 'Excellent source of healthy omega-3 fatty acids.'
      }
    ]
  }
};

export const initialExercises = [
  {
    id: 'e1',
    name: 'Post-Meal Brisk Walk',
    type: 'Cardio',
    durationMinutes: 20,
    caloriesBurn: 110,
    intensity: 'Moderate',
    icon: '🚶‍♂️',
    targetBenefit: 'Blunts postprandial glucose spike by 25-35%',
    completed: false,
    scheduledTime: '13:30'
  },
  {
    id: 'e2',
    name: 'Diabetic Yoga (Vajrasana & Pranayama)',
    type: 'Flexibility & Breathing',
    durationMinutes: 25,
    caloriesBurn: 85,
    intensity: 'Gentle',
    icon: '🧘‍♂️',
    targetBenefit: 'Stimulates pancreas and promotes insulin sensitivity',
    completed: false,
    scheduledTime: '06:30'
  },
  {
    id: 'e3',
    name: 'Resistance Band Upper Body Workout',
    type: 'Strength',
    durationMinutes: 20,
    caloriesBurn: 95,
    intensity: 'Moderate',
    icon: '💪',
    targetBenefit: 'Increases muscular GLUT4 glucose uptake',
    completed: false,
    scheduledTime: '18:30'
  }
];

export const initialNotifications = [
  {
    id: 'n1',
    title: 'Medication Reminder 💊',
    body: 'Time to take Metformin 500mg with dinner.',
    type: 'medication',
    timestamp: hoursAgo(0.5),
    isRead: false,
    view: 'medications'
  },
  {
    id: 'n2',
    title: 'Hydration Check 💧',
    body: "Track your water today to hit your 2.5L goal!",
    type: 'water',
    timestamp: hoursAgo(2),
    isRead: false,
    view: 'water'
  },
  {
    id: 'n3',
    title: 'AI Health Insight 🤖',
    body: 'Great job! Your fasting glucose this morning (114 mg/dL) is in the optimal target zone.',
    type: 'ai',
    timestamp: hoursAgo(8),
    isRead: true,
    view: 'ai-coach'
  },
  {
    id: 'n4',
    title: 'Weekly Summary Ready 📊',
    body: 'Your 7-day Time-in-Range (TIR) reached 76%. Tap to view the doctor report.',
    type: 'report',
    timestamp: daysAgo(1),
    isRead: true,
    view: 'reports'
  }
];

export const initialSleepData = {
  lastNightDurationHours: 0,
  bedTime: '--:--',
  wakeTime: '--:--',
  qualityScore: 0,
  qualityLabel: 'Not recorded yet',
  deepSleepHours: 0,
  remSleepHours: 0,
  lightSleepHours: 0,
  history: [
    { day: 'Mon', hours: 6.8, quality: 78 },
    { day: 'Tue', hours: 7.5, quality: 88 },
    { day: 'Wed', hours: 6.2, quality: 65 },
    { day: 'Thu', hours: 7.0, quality: 82 },
    { day: 'Fri', hours: 8.1, quality: 91 },
    { day: 'Sat', hours: 7.4, quality: 85 },
    { day: 'Sun', hours: 7.2, quality: 84 }
  ]
};

export const initialWaterData = {
  dailyGoalMl: 2500,
  currentMl: 0,
  logs: []
};

export const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDaysAgoDateString = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDaysAgoDayLabel = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
};

export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' && dateInput.includes('-')
    ? new Date(dateInput + 'T00:00:00')
    : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatLongDate = (dateInput = new Date()) => {
  const d = typeof dateInput === 'string' && dateInput.includes('-')
    ? new Date(dateInput + 'T00:00:00')
    : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const initialStepHistory = [
  { date: getDaysAgoDateString(6), day: getDaysAgoDayLabel(6), steps: 7420, goal: 8000, distanceKm: 5.56, caloriesBurned: 296, achieved: false },
  { date: getDaysAgoDateString(5), day: getDaysAgoDayLabel(5), steps: 8350, goal: 8000, distanceKm: 6.26, caloriesBurned: 334, achieved: true },
  { date: getDaysAgoDateString(4), day: getDaysAgoDayLabel(4), steps: 8120, goal: 8000, distanceKm: 6.09, caloriesBurned: 324, achieved: true },
  { date: getDaysAgoDateString(3), day: getDaysAgoDayLabel(3), steps: 7100, goal: 8000, distanceKm: 5.32, caloriesBurned: 284, achieved: false },
  { date: getDaysAgoDateString(2), day: getDaysAgoDayLabel(2), steps: 8450, goal: 8000, distanceKm: 6.33, caloriesBurned: 338, achieved: true },
  { date: getDaysAgoDateString(1), day: getDaysAgoDayLabel(1), steps: 8890, goal: 8000, distanceKm: 6.66, caloriesBurned: 355, achieved: true }
];

export const initialStepsData = {
  date: getTodayDateString(),
  goal: 8000,
  current: 0,
  caloriesBurned: 0,
  distanceKm: 0,
  weeklyAvg: 7850,
  streakDays: 4
};
