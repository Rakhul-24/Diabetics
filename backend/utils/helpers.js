/**
  Glucose status classification
  < 70: low (Danger)
  70-140: normal
  140-200: elevated
  200-250: high
  > 250: danger
 */
export function evaluateGlucoseStatus(readingMg) {
  if (readingMg < 70) return { status: 'low', isDangerous: true };
  if (readingMg <= 140) return { status: 'normal', isDangerous: false };
  if (readingMg <= 200) return { status: 'elevated', isDangerous: false };
  if (readingMg <= 250) return { status: 'high', isDangerous: false };
  return { status: 'danger', isDangerous: true };
}

export function calculateBMI(weightKg, heightCm) {
  if (!heightCm || heightCm === 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function generateFallbackRecommendation(userProfile, latestGlucoseMg) {
  const isDangerous = latestGlucoseMg < 70 || latestGlucoseMg > 250;
  
  return {
    id: 'rec_' + Date.now(),
    generatedAt: new Date().toISOString(),
    isDangerousAlert: isDangerous,
    insight: isDangerous 
      ? `🚨 ALERT: Your blood glucose reading of ${latestGlucoseMg} mg/dL is outside the safe range (70–250 mg/dL). Please consult your doctor or call emergency services immediately.`
      : `Based on your recent glucose (${latestGlucoseMg || 135} mg/dL) and Type 2 diabetes profile, keep your meals low in glycemic index and aim for 30 minutes of post-meal brisk walking today.`,
    mealPlan: {
      breakfast: [
        {
          name: 'Methi Roti with Low-Fat Curd',
          calories: 280,
          protein: 9.0,
          carbs: 38.0,
          fat: 8.0,
          fiber: 5.0,
          giIndex: 38,
          portion: '2 rotis + 100g curd',
          recipe: '1. Mix whole wheat flour with fenugreek leaves.\n2. Cook with minimal oil.\n3. Serve with low-fat curd.',
          imageEmoji: '🫓'
        },
        {
          name: 'Boiled Egg with Multigrain Toast',
          calories: 220,
          protein: 14.0,
          carbs: 22.0,
          fat: 7.0,
          fiber: 3.0,
          giIndex: 45,
          portion: '2 eggs + 1 slice toast',
          recipe: '1. Hard boil 2 eggs.\n2. Toast multigrain bread.',
          imageEmoji: '🥚'
        }
      ],
      lunch: [
        {
          name: 'Moong Dal + Brown Rice + Cucumber Raita',
          calories: 420,
          protein: 18.0,
          carbs: 58.0,
          fat: 6.0,
          fiber: 8.0,
          giIndex: 48,
          portion: '1 cup dal + 3/4 cup rice + 100g raita',
          recipe: '1. Cook yellow moong dal with cumin & turmeric.\n2. Serve with brown rice and cucumber raita.',
          imageEmoji: '🍲'
        },
        {
          name: 'Bitter Gourd (Karela) Sabzi',
          calories: 80,
          protein: 3.0,
          carbs: 10.0,
          fat: 3.0,
          fiber: 4.0,
          giIndex: 30,
          portion: '1 bowl',
          recipe: 'Stir fry thinly sliced karela with onions, turmeric, and sour amchur powder.',
          imageEmoji: '🥬'
        }
      ],
      dinner: [
        {
          name: 'Grilled Fish / Paneer Tikka + Stir-fried Vegetables',
          calories: 380,
          protein: 32.0,
          carbs: 28.0,
          fat: 10.0,
          fiber: 5.0,
          giIndex: 35,
          portion: '150g protein + 1 cup veggies',
          recipe: 'Marinate with lemon & spices, grill until cooked. Serve with sautéed broccoli and capsicum.',
          imageEmoji: '🐟'
        }
      ],
      snacks: [
        {
          name: 'Roasted Chana + Green Tea',
          calories: 120,
          protein: 6.0,
          carbs: 18.0,
          fat: 2.0,
          fiber: 5.0,
          giIndex: 32,
          portion: '30g chana + 1 cup tea',
          recipe: 'Dry roast chickpeas with chaat masala. Enjoy with unsweetened green tea.',
          imageEmoji: '🥜'
        }
      ],
      totalCalories: 1500
    },
    exercisePlan: {
      exercises: [
        {
          name: 'Brisk Walking',
          type: 'cardio',
          duration: 30,
          caloriesBurn: 150,
          difficulty: 'easy',
          description: 'Brisk walking after meals lowers post-prandial glucose spikes by 15-20%.',
          icon: '🚶'
        },
        {
          name: 'Yoga (Vajrasana & Paschimottanasana)',
          type: 'flexibility',
          duration: 20,
          caloriesBurn: 80,
          difficulty: 'easy',
          description: 'Vajrasana directly after meals enhances digestion and insulin sensitivity.',
          icon: '🧘'
        },
        {
          name: 'Resistance Training',
          type: 'strength',
          duration: 15,
          caloriesBurn: 60,
          difficulty: 'moderate',
          description: 'Build muscle glucose storage capacity with resistance bands.',
          icon: '💪'
        }
      ]
    },
    hydrationAdvice: 'Target 2,500ml of water daily. Drink a glass 30 minutes before each meal.',
    sleepTips: [
      'Aim for 7-8 hours of sleep. Consistent sleep improves morning fasting insulin sensitivity.',
      'Avoid blue light screens 45 minutes before bedtime.',
      'Keep your bedroom cool (22-24°C) for deeper REM sleep cycles.'
    ],
    lifestyleTips: [
      'Take a 10-15 minute walk after lunch and dinner.',
      'Monitor glucose at consistent times each day to build reliable trend data.',
      'Manage stress via deep breathing — elevated cortisol raises blood sugar.'
    ],
    motivationalQuote: '"Every small healthy choice you make today compounds into long-term wellness. You\'ve got this! 💪"',
    healthSummary: `Your glucose status is ${evaluateGlucoseStatus(latestGlucoseMg || 135).status.toUpperCase()}. Continue following your meal plan and staying active.`,
    weeklyReport: 'Weekly Summary: Average Glucose 142 mg/dL | In-range 85% | Total Steps 36,500 | Sleep 6.7h avg.'
  };
}
