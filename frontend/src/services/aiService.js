// Comprehensive Clinical Diabetes Knowledge & Live AI Intelligence Engine

export class DiabetesAiEngine {
  constructor(context) {
    this.context = context; // { user, latestGlucose, waterData, stepsData, avgGlucoseMg, tirPercentage, estimatedA1c, formatGlucose, getGlucoseUnit }
  }

  // 1. Live Google Gemini API Integration
  async fetchLiveGeminiResponse(query, apiKey) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;

    try {
      const { user, latestGlucose, avgGlucoseMg, estimatedA1c, formatGlucose, getGlucoseUnit } = this.context;
      const currentReading = `${formatGlucose(latestGlucose?.readingMg || 114)} ${getGlucoseUnit()}`;

      const systemInstruction = `You are GlucoCare AI, an empathetic and highly knowledgeable Clinical Diabetes Lifestyle and Nutrition Expert.
Patient Profile:
- Name: ${user?.name || 'Arjun'}
- Condition: ${user?.diabetesType || 'Type 2 Diabetes'}
- Latest Blood Glucose: ${currentReading}
- 7-Day Average Glucose: ${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()} (Estimated HbA1c: ${estimatedA1c}%)
- Weight: ${user?.weight || 75}kg, Height: ${user?.height || 175}cm

Instructions:
1. Answer the user's exact question with precision and medical rationale.
2. For any food (e.g. chicken liver, fruits, grains), break down its Glycemic Index, carbs, protein, micronutrients, vitamin B12 / iron benefits, and portion recommendations.
3. If they ask about symptoms, numbers, or medications, provide clear, safe action steps.
4. Format with emojis, bold headers, and bullet points. Never diagnose disease or prescribe prescription medications.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemInstruction}\n\nUser Question: "${query}"` }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return generatedText || null;
    } catch (err) {
      console.warn('Gemini Direct API Call failed, switching to clinical engine:', err.message);
      return null;
    }
  }

  // 2. Comprehensive Clinical Natural Language Engine (Offline & Instant)
  generateResponse(query) {
    const rawQ = query.trim();
    const q = rawQ.toLowerCase();
    const {
      user,
      latestGlucose,
      waterData,
      avgGlucoseMg,
      tirPercentage,
      estimatedA1c,
      formatGlucose,
      getGlucoseUnit
    } = this.context;

    const currentGlucoseMg = latestGlucose?.readingMg || 114;
    const currentGlucoseFmt = `${formatGlucose(currentGlucoseMg)} ${getGlucoseUnit()}`;
    const patientName = user?.name || 'there';
    const diabetesType = user?.diabetesType || 'Type 2 Diabetes';

    // ── GREETINGS & INTRO ──────────────────────────────────────────────────
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|who are you|help|namaste)\b/.test(q)) {
      return `👋 **Hello ${patientName}!** I am your dedicated AI Diabetes Care & Lifestyle Coach.\n\n` +
        `I can help you with:\n` +
        `• 🍗 **Foods & Diets**: Ask about ANY specific food, poultry, meat, fruit, or snack (e.g., *"Can I eat chicken liver?"*, *"Is jaggery safe?"*).\n` +
        `• ⚡ **Sugar Levels & Triage**: Get immediate advice for high or low readings (e.g., *"My sugar is 210, what to do?"*).\n` +
        `• 💊 **Medications**: Understand how Metformin, Glipizide, or Insulin work.\n` +
        `• 🏃 **Workouts & Routines**: Post-meal walks, timing, and carb-lowering exercises.\n` +
        `• 📊 **Your Vitals**: Your latest reading is **${currentGlucoseFmt}** (7-day Average: **${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()}** | TIR: **${tirPercentage}%**).\n\n` +
        `What would you like to know today?`;
    }

    // ── MEATS, POULTRY, ORGAN MEATS & SEAFOOD ─────────────────────────────
    // Chicken Liver & Organ Meats
    if (q.includes('liver') || q.includes('chicken liver') || q.includes('mutton liver') || q.includes('organ')) {
      return `🍗 **Can Diabetics Eat Chicken Liver?**\n\n` +
        `**Yes! Chicken liver is safe and highly beneficial for diabetics, with a few portion guidelines:**\n\n` +
        `**1. Glycemic Impact (Zero Sugar Spikes)**:\n` +
        `• **Carbohydrates**: Less than **1g of carbs** per 100g (Glycemic Index = **0**).\n` +
        `• **Protein**: Packed with ~**24-26g of high-quality lean protein** per 100g, promoting satiety and stabilizing blood glucose.\n\n` +
        `**2. Special Benefits for Diabetes (Vitamin B12 & Iron)**:\n` +
        `• **Vitamin B12 Powerhouse**: 100g of chicken liver provides over **300% of your daily B12**. This is crucial if you take **Metformin**, which frequently causes B12 depletion and peripheral nerve tingling.\n` +
        `• **Bioavailable Heme Iron & Folate**: Combats anemia and supports cellular energy.\n` +
        `• **Chromium & Zinc**: Naturally present minerals that enhance insulin receptor sensitivity.\n\n` +
        `**3. Healthy Cooking & Consumption Tips**:\n` +
        `• **Portion**: **75g to 100g once or twice a week**.\n` +
        `• **Cooking**: Sauté with onions, garlic, turmeric, and black pepper in a teaspoon of olive oil or mustard oil. **Avoid deep-frying or thick cream gravies**.\n` +
        `• **Precaution**: High in dietary cholesterol and purines (uric acid). If you have elevated uric acid/gout, consume in moderation.`;
    }

    // Chicken & Poultry
    if (q.includes('chicken') || q.includes('turkey') || q.includes('poultry')) {
      return `🍗 **Chicken & Diabetes:**\n\n` +
        `**Excellent protein choice for diabetic meal plans!**\n` +
        `• **Zero Carbohydrates (GI: 0)**: Skinless chicken breast or thigh has 0g carbs and does not raise blood sugar.\n` +
        `• **High Satiety**: 100g provides ~31g protein, preventing hunger spikes.\n` +
        `• **Best Cooking Methods**: Grilled, tandoori, roasted, or boiled in soup. Avoid deep-fried crispy chicken with refined flour batter.`;
    }

    // Fish & Seafood
    if (q.includes('fish') || q.includes('salmon') || q.includes('tuna') || q.includes('prawn') || q.includes('shrimp') || q.includes('seafood') || q.includes('crab')) {
      return `🐟 **Fish & Seafood for Diabetes:**\n\n` +
        `**Top-tier superfood for diabetic cardiovascular health!**\n` +
        `• **Zero Glycemic Index (GI: 0)**: Fish has no carbohydrates.\n` +
        `• **Omega-3 Fatty Acids (EPA & DHA)**: Fatty fish (Salmon, Mackerel, Sardines, Rohu/Hilsa) lowers systemic inflammation, reduces blood triglycerides, and protects heart arteries.\n` +
        `• **Portion**: 150g grilled, baked, or steamed fish 2-3 times per week is ideal.`;
    }

    // Mutton, Beef, Pork & Red Meat
    if (q.includes('mutton') || q.includes('beef') || q.includes('pork') || q.includes('red meat') || q.includes('lamb')) {
      return `🥩 **Red Meat (Mutton / Lamb / Beef) & Diabetes:**\n\n` +
        `• **Carbohydrates (0g, GI: 0)**: Does not raise acute blood glucose.\n` +
        `• **Saturated Fat Consideration**: Higher in saturated fatty acids, which can increase LDL cholesterol and worsen long-term insulin resistance if consumed in excess.\n` +
        `• **Recommendation**: Limit red meat to **1-2 times per month**; choose lean cuts, trim visible fat, and prefer fish or skinless poultry for daily protein.`;
    }

    // ── DIRECT GLUCOSE NUMBER TRIAGE (e.g., "sugar is 240", "level 65") ───
    const numberMatch = q.match(/\b(\d{2,3})\b/);
    if (numberMatch && (q.includes('sugar') || q.includes('glucose') || q.includes('reading') || q.includes('level') || q.includes('is'))) {
      const val = parseInt(numberMatch[1], 10);
      if (val >= 40 && val <= 500) {
        if (val < 70) {
          return `🚨 **EMERGENCY: Hypoglycemia Alert (${val} mg/dL)**\n\n` +
            `Your blood sugar is dangerously low! Follow the **Rule of 15** immediately:\n\n` +
            `1. **Consume 15g of fast-acting sugar right now**:\n` +
            `   • 1/2 cup (120ml) fruit juice or regular soda\n` +
            `   • 3-4 glucose tablets or 3 tsp sugar/honey in water\n` +
            `2. **Sit and rest for 15 minutes**.\n` +
            `3. **Re-test your sugar**.\n` +
            `   • If still <70: Repeat step 1.\n` +
            `   • If >70: Eat a small protein snack (toast with peanut butter or 1 roti).\n\n` +
            `*If you feel dizzy or confused, notify someone nearby or use the SOS button!*`;
        } else if (val <= 140) {
          return `✅ **Optimal Reading (${val} mg/dL)**\n\n` +
            `Your blood glucose of **${val} mg/dL** is in the ideal target range (70-140 mg/dL)!\n` +
            `• **Why it's great**: Staying in this range protects your blood vessels and nerves from oxidative stress.\n` +
            `• **Next Steps**: Keep up your balanced meal routine, stay hydrated (logged **${waterData.currentMl}ml** today), and maintain your daily schedule.`;
        } else if (val <= 180) {
          return `🟠 **Elevated Reading (${val} mg/dL)**\n\n` +
            `Your reading of **${val} mg/dL** is slightly elevated (above normal fasting target, but within acceptable post-meal limits under 180 mg/dL).\n` +
            `• **Action Steps**:\n` +
            `  1. Drink a tall glass (300ml) of water.\n` +
            `  2. Take a 15-minute brisk walk to activate muscle glucose uptake.\n` +
            `  3. Check if your previous meal was heavy on carbohydrates.`;
        } else {
          return `⚠️ **High Blood Sugar Alert (${val} mg/dL)**\n\n` +
            `A reading of **${val} mg/dL** indicates significant hyperglycemia.\n\n` +
            `**Immediate Action Plan**:\n` +
            `1. **Hydrate**: Drink 500ml of plain water immediately to help your kidneys excrete excess glucose.\n` +
            `2. **Gentle Movement**: If you feel okay and have no ketones, do a 15-20 min light walk. (Avoid intense exercise if >250 mg/dL).\n` +
            `3. **Check Medication**: Ensure you haven't missed your scheduled dose of Metformin or insulin.\n` +
            `4. **Doctor Consultation**: If blood sugar remains over 250 mg/dL or you experience nausea, vomiting, or deep breathing, contact **${user?.doctorName || 'your doctor'}** promptly.`;
        }
      }
    }

    // ── SWEETENERS (Jaggery, Honey, Stevia, Sugar) ────────────────────────
    if (q.includes('jaggery') || q.includes('gur') || q.includes('gud')) {
      return `🍯 **Is Jaggery (Gur) safe for Diabetics?**\n\n` +
        `**No — Jaggery is NOT safe as a regular sugar substitute:**\n` +
        `• **High Glycemic Index**: Jaggery has a very high GI of **~84** (higher than refined white sugar at ~65!).\n` +
        `• **Sugar Content**: Composed of 70-85% sucrose and spikes blood glucose almost instantaneously.\n` +
        `• **Myth Buster**: While it has trace minerals, the sugar absorbed far outweighs any micronutrient benefit.\n` +
        `• **Better Alternative**: Use plant-based **Pure Stevia** or **Monk Fruit extract** (Zero calories, Zero GI).`;
    }

    if (q.includes('honey')) {
      return `🍯 **Honey & Diabetes:**\n\n` +
        `**Use with extreme caution:**\n` +
        `• Honey has a GI of **~58-65** and is ~80% fast carbohydrates.\n` +
        `• **1 tablespoon contains 17g of sugar**, creating a rapid blood sugar spike.\n` +
        `• If using, limit strictly to **1/2 teaspoon** on rare occasions, and pair with protein.`;
    }

    if (q.includes('stevia') || q.includes('sugar free') || q.includes('sweetener') || q.includes('artificial sweetener')) {
      return `🌿 **Diabetic-Safe Sweeteners Guide:**\n\n` +
        `• **Best Choice: 100% Pure Stevia Leaf Extract**: Natural herb with zero calories, zero carbohydrates, and **0 Glycemic Index**.\n` +
        `• **Monk Fruit (Luo Han Guo)**: Zero glycemic impact natural fruit extract.\n` +
        `• **Erythritol**: Sugar alcohol that passes through without raising insulin.\n` +
        `• **Caution with Sucralose / Aspartame**: Safe in moderation, but whole-leaf Stevia is preferred.`;
    }

    // ── SPECIFIC FRUITS ───────────────────────────────────────────────────
    if (q.includes('banana') || q.includes('bananas')) {
      return `🍌 **Can diabetics eat Bananas?**\n\n` +
        `**Yes, with portion control and ripeness awareness:**\n` +
        `• **Unripe / Greenish Bananas**: Lower Glycemic Index (GI: ~42) and high in resistant starch that digests slowly.\n` +
        `• **Overripe Bananas**: High GI (~55-60) causing faster spikes.\n` +
        `• **Best Way**: Eat **half a firm banana** paired with 5-6 almonds or peanut butter before a walk.`;
    }

    if (q.includes('mango') || q.includes('mangoes')) {
      return `🥭 **Can diabetics eat Mangoes?**\n\n` +
        `**Yes, in strictly measured small portions:**\n` +
        `• Moderate GI (~51-56) with 15g carbs per 100g slice.\n` +
        `• **Safe limit**: **2-3 small slices (50-75g)** as a mid-morning snack.\n` +
        `• **Rules**: Never drink mango juice. Eat whole slices with fiber, and test sugar 2 hours later.`;
    }

    if (q.includes('watermelon') || q.includes('tarbooz')) {
      return `🍉 **Watermelon & Diabetes:**\n\n` +
        `• **High GI (72), but Low Glycemic Load (GL ~5)** because it is 92% water.\n` +
        `• **Safe Portion**: Limit to **1 small cup (100g)** of diced watermelon.\n` +
        `• **Tip**: Never drink watermelon juice (removes pulp). Pair with soaked almonds.`;
    }

    if (q.includes('papaya')) {
      return `🍈 **Papaya & Diabetes:**\n\n` +
        `**Good Choice in moderation:**\n` +
        `• **Moderate GI (~60)**: Rich in vitamin C, folate, and **papain** enzyme.\n` +
        `• **Portion**: 1 small bowl (100g) mid-morning. Provides soluble fiber that aids bowel motility.`;
    }

    if (q.includes('berry') || q.includes('berries') || q.includes('jamun')) {
      return `🫐 **Berries & Jamun (Indian Blackberry) — Superfoods!**\n\n` +
        `• **Jamun**: Famous for **jamboline**, which slows the conversion of starch into glucose.\n` +
        `• **Strawberries / Blueberries**: Lowest GI among all fruits (**GI: ~25-32**) and packed with **anthocyanins** that boost insulin sensitivity.\n` +
        `• **Portion**: 1 cup fresh berries daily is safe and nutritious.`;
    }

    // ── GRAINS, FLOUR & BREAD ─────────────────────────────────────────────
    if (q.includes('roti') || q.includes('chapati') || q.includes('atta') || q.includes('flour') || q.includes('wheat') || q.includes('maida')) {
      return `🫓 **Best Flour & Roti for Diabetes:**\n\n` +
        `• **Refined Wheat (Maida)**: ❌ Avoid — GI >75, strips fiber and causes spikes.\n` +
        `• **Multigrain / Missi Roti**: ✅ Mix whole wheat with **25% Besan (Chickpea flour)**, **Methi leaves**, and **flaxseed powder**. Drops GI by 30% and adds protein!\n` +
        `• **Millets (Jowar, Bajra, Ragi)**: Great complex carbs rich in magnesium. Note: Blend Ragi with besan or oats for lower GI.`;
    }

    if (q.includes('rice')) {
      return `🍚 **Rice Guide for Diabetes:**\n\n` +
        `• **White Rice (High GI: ~73)**: Limit portion to **1/2 small cup** and pair with double portion of vegetables/dal.\n` +
        `• **Brown / Red Rice (GI: ~50-55)**: Contains the bran with fiber, magnesium, and B vitamins.\n` +
        `• **Best Trick**: Refrigerator-cooled cooked rice develops **resistant starch**, lowering glycemic impact by up to 20%!`;
    }

    // ── CAN DIABETES BE CURED OR REVERSED? ─────────────────────────────────
    if (q.includes('cure') || q.includes('reverse') || q.includes('reversal')) {
      return `🩺 **Can Diabetes Be Cured or Reversed?**\n\n` +
        `• **Clinical Term: "Diabetes Remission"**: Type 2 Diabetes cannot be permanently deleted genetically, but it can be put into **long-term remission** (normal HbA1c <6.5% without medications).\n` +
        `• **How Remission is Achieved (DIRECT Trial Science)**:\n` +
        `  1. **Visceral Weight Loss**: Losing 10-15% of body weight clears accumulated ectopic fat from the **liver and pancreas**, allowing beta-cells to recover.\n` +
        `  2. **Low-Carb, High-Fiber Nutrition**: Removes chronic glycemic stress on insulin receptors.\n` +
        `  3. **Daily Muscle Activation**: 150 mins cardio + 2 days resistance training.\n` +
        `• **Your Profile**: At **${user?.weight || 75}kg** with an estimated HbA1c of **${estimatedA1c}%**, you have strong momentum!`;
    }

    // ── UNIVERSAL DYNAMIC FOOD EVALUATOR (Catches ANY arbitrary food/query) ───
    return `🍽️ **Dietary Assessment for "${rawQ}":**\n\n` +
      `When evaluating foods for **${diabetesType}**, consider these 3 clinical factors:\n` +
      `• **1. Carbohydrate & Fiber Content**: Foods low in net carbs (proteins like eggs, poultry, fish, tofu, or green leafy veggies) produce virtually **zero glycemic spikes**.\n` +
      `• **2. Glycemic Index & Preparation**: Steam, grill, or sauté in healthy fats (olive/mustard oil) instead of deep-frying in refined flour batters.\n` +
      `• **3. Pairing Strategy**: Always combine carbohydrate sources with dietary fiber and protein to slow down gastric emptying.\n\n` +
      `*Your current glucose is **${currentGlucoseFmt}** (7-day Average: **${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()}** | TIR: **${tirPercentage}%**).* Feel free to ask about any specific ingredient, cooking method, or medicine!`;
  }

  // 3. Direct Gemini Food & Step Recommendation Generator (Browser-side)
  async generateDirectFoodPlan(apiKey) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
    try {
      const { user, latestGlucose, avgGlucoseMg, tirPercentage, stepsData, medications, sleepData, formatGlucose, getGlucoseUnit } = this.context;
      const stepsToday = stepsData?.current || 0;
      const stepGoal = stepsData?.goal || 8000;
      const stepProgress = Math.round((stepsToday / stepGoal) * 100);
      const stepCarbNote = stepsToday >= stepGoal
        ? `Patient has MET step goal (${stepsToday}/${stepGoal} steps). INCREASE carbs by 20g above baseline to replenish glycogen.`
        : stepsToday >= stepGoal * 0.75
        ? `Patient at 75%+ of step goal (${stepsToday}/${stepGoal} steps). INCREASE carbs by 10g above baseline.`
        : stepsToday <= stepGoal * 0.25
        ? `Very sedentary day — only ${stepsToday}/${stepGoal} steps (${stepProgress}%). REDUCE carbs by 15g below baseline to prevent glycemic spikes.`
        : `Patient at ${stepProgress}% of step goal (${stepsToday}/${stepGoal} steps). Use baseline carb targets.`;

      const prompt = `You are an elite Clinical Endocrinologist and Indian Nutrition Specialist.
Patient: ${user?.name || 'Arjun'} (${user?.diabetesType || 'Type 2 Diabetes'}), Weight: ${user?.weight || 75}kg.
Glucose Profile: Latest ${formatGlucose(latestGlucose?.readingMg || 114)} ${getGlucoseUnit()}, 7-Day Average ${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()}, TIR: ${tirPercentage}%.
Activity Today: ${stepsToday} steps walked / ${stepGoal} goal (${stepProgress}% complete). Calories burned: ${stepsData?.caloriesBurned || 0} kcal.
Step-Based Carb Rule: ${stepCarbNote}
Medications: ${(medications || []).map(m => m.name).join(', ') || 'Metformin 500mg'}, Sleep: ${sleepData?.durationHours || 7}h.

🇮🇳 CRITICAL: ALL meal items MUST be authentic Indian foods only.
Acceptable: Dal tadka, Khichdi, Daliya, Roti/Chapati (jowar/bajra/ragi/wheat), Idli, Dosa, Upma, Poha, Sambar, Sabzi (karela/palak/lauki/bhindi), Paneer dishes, Raita, Sprouted salads, Makhana, Roasted chana, Chaas/Lassi, Dhokla, Methi paratha.
FORBIDDEN: Pizza, pasta, broccoli salad, zucchini soup, Greek dishes, western sandwiches.

Generate a customized low-GI authentic Indian daily meal plan AND daily step prescription in JSON format:
- analysis: { statusSummary (mention ${stepsToday} steps walked and its impact on today's carb allowance), trendLabel, riskLevel ("low"|"moderate"|"high"), keyClinicalInsight }
- stepsGuidance: { dailyStepTarget (number), postMealWalkMinutes (number), clinicalRationale (string), recommendedSplits: [{ label, steps, timing, purpose }], estimatedCaloriesBurn (number) }
- targetNutrition: { dailyCalorieTarget, dailyCarbTarget (adjusted per step rule above), dailyProteinTarget, dailyFatTarget, dailyFiberTarget }
- meals: { breakfast: [2 Indian items], lunch: [2 Indian items], dinner: [2 Indian items], snacks: [2 Indian items] } (each item: id, name, icon, calories, carbs, protein, fat, fiber, giIndex, giRating, portion, ingredients [max 4 Indian ingredients], recipe [1-2 sentences, Indian cooking method], glycemicReason)
- foodsToPrioritize: [4 items with name, reason, icon — all Indian superfoods: karela, methi, ragi, amla, moong, etc.]
- foodsToAvoid: [4 items with name, reason, icon — Indian junk: maida, jaggery, mithai, fried items]
- hydrationAdvice: string (mention Indian drinks: chaas, coconut water, methi water)
- motivationalQuote: string (mention steps walked today: ${stepsToday})
Return PURE JSON only.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      let jsonStr = text;
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1];
      else {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first !== -1 && last !== -1) jsonStr = text.substring(first, last + 1);
      }
      return JSON.parse(jsonStr);
    } catch (err) {
      console.warn('Direct Gemini Food Plan failed:', err.message);
      return null;
    }
  }

  // 4. Clinical Offline Fallback Food Plan — Authentic Indian Cuisine, Step-Aware
  generateOfflineFoodPlan() {
    const { latestGlucose, avgGlucoseMg, tirPercentage, stepsData, formatGlucose, getGlucoseUnit } = this.context;
    const currentMg = latestGlucose?.readingMg || 120;
    const isHigh = currentMg > 160 || avgGlucoseMg > 150;
    const isLow = currentMg < 75;
    const stepsToday = stepsData?.current || 0;
    const stepGoal = stepsData?.goal || 8000;
    const stepProgress = Math.round((stepsToday / stepGoal) * 100);

    // Steps-based carb & calorie adjustment
    let stepCarbBonus = 0;
    let stepCalBonus = 0;
    let stepNote = '';
    if (stepsToday >= stepGoal) {
      stepCarbBonus = 20; stepCalBonus = 150;
      stepNote = `You have met your step goal (${stepsToday.toLocaleString()} steps)! Carbohydrate allowance has been increased by 20g to replenish muscle glycogen.`;
    } else if (stepsToday >= stepGoal * 0.75) {
      stepCarbBonus = 10; stepCalBonus = 80;
      stepNote = `You have walked ${stepsToday.toLocaleString()} steps (${stepProgress}% of goal). A 10g carbohydrate increase has been applied.`;
    } else if (stepsToday <= stepGoal * 0.25) {
      stepCarbBonus = -15; stepCalBonus = -100;
      stepNote = `Only ${stepsToday.toLocaleString()} steps today (${stepProgress}% of goal) — carbohydrate allowance reduced by 15g to prevent sedentary spikes.`;
    } else {
      stepNote = `You have walked ${stepsToday.toLocaleString()} steps (${stepProgress}% of goal). A 15-minute post-meal walk will drop glucose by 20–30 mg/dL.`;
    }

    const dailyCalorieTarget = Math.round((isHigh ? 1650 : isLow ? 1850 : 1750) + stepCalBonus);
    const dailyCarbTarget = Math.round((isHigh ? 115 : isLow ? 160 : 135) + stepCarbBonus);

    return {
      analysis: {
        statusSummary: isHigh
          ? `Elevated glucose detected (${formatGlucose(currentMg)} ${getGlucoseUnit()}, 7-day avg: ${formatGlucose(avgGlucoseMg)} ${getGlucoseUnit()}). ${stepNote} Today's low-GI Indian plan minimizes glycemic load.`
          : isLow
          ? `Hypoglycemia risk (${formatGlucose(currentMg)} ${getGlucoseUnit()}). ${stepNote} Indian foods with moderate GI are included to safely stabilize blood glucose.`
          : `Optimal glycemic balance (${formatGlucose(currentMg)} ${getGlucoseUnit()}, TIR ${tirPercentage}%). ${stepNote}`,
        trendLabel: isHigh ? 'Postprandial Excursions Mitigation' : isLow ? 'Hypoglycemia Recovery Plan' : 'Steady Glycemic Balance',
        riskLevel: isHigh ? 'moderate' : isLow ? 'moderate' : 'low',
        keyClinicalInsight: isHigh
          ? `With ${stepsToday.toLocaleString()} steps today, pair your Indian meals (karela sabzi, methi roti, moong dal) with 15-20 min post-meal walks to activate GLUT-4 glucose transporters and flatten postprandial spikes.`
          : `With ${stepsToday.toLocaleString()} steps logged, Indian foods rich in soluble fiber (dal, ragi, broken wheat, oats upma) keep blood glucose stable throughout the day.`
      },
      stepsGuidance: {
        dailyStepTarget: isHigh ? 9000 : isLow ? 6000 : 8000,
        postMealWalkMinutes: isHigh ? 20 : 15,
        clinicalRationale: isHigh
          ? `Elevated glucose (${formatGlucose(currentMg)} ${getGlucoseUnit()}) with ${stepsToday.toLocaleString()} steps today — targeting 9,000 steps activates muscular GLUT-4 glucose uptake and reduces postprandial glycemic excursions by 20–35 mg/dL.`
          : `Your glycemic control is stable and you've walked ${stepsToday.toLocaleString()} steps. Maintaining 8,000 daily steps preserves peripheral insulin sensitivity and metabolic health.`,
        recommendedSplits: [
          { label: 'Post-Breakfast Walk', steps: 1500, timing: '15 mins after breakfast', purpose: 'Blunts morning glucose rise & dawn phenomenon' },
          { label: 'Post-Lunch Brisk Walk', steps: 2500, timing: '20 mins after lunch', purpose: 'Buffers afternoon postprandial spike' },
          { label: 'Post-Dinner Stroll', steps: 2000, timing: '15 mins after dinner', purpose: 'Prevents dawn phenomenon & nocturnal spikes' },
          { label: 'Baseline Daily Movement', steps: isHigh ? 3000 : 2000, timing: 'All day', purpose: 'Sustains Non-Exercise Activity Thermogenesis (NEAT)' }
        ],
        estimatedCaloriesBurn: isHigh ? 360 : 320
      },
      targetNutrition: {
        dailyCalorieTarget,
        dailyCarbTarget,
        dailyProteinTarget: 85,
        dailyFatTarget: 48,
        dailyFiberTarget: isHigh ? 38 : 35
      },
      meals: {
        breakfast: isLow ? [
          {
            id: 'b1',
            name: 'Sabudana Khichdi with Peanuts & Curd',
            icon: '🍚',
            calories: 350,
            carbs: 58,
            protein: 9,
            fat: 8,
            fiber: 3,
            giIndex: 56,
            giRating: 'Moderate GI',
            portion: '1 medium bowl + 100g curd',
            ingredients: ['Soaked sabudana', 'Roasted peanuts', 'Green chilli', 'Rock salt'],
            recipe: 'Temper cumin seeds, add soaked sabudana and peanuts, cook on medium flame with sendha namak.',
            glycemicReason: 'Sabudana provides fast-acting carbohydrates to safely correct low blood glucose.'
          },
          {
            id: 'b2',
            name: 'Banana Oats Porridge with Milk & Raisins',
            icon: '🍌',
            calories: 320,
            carbs: 52,
            protein: 10,
            fat: 5,
            fiber: 4,
            giIndex: 52,
            giRating: 'Moderate GI',
            portion: '1 bowl + 1/2 banana + 10 raisins',
            ingredients: ['Rolled oats', 'Full-fat milk', 'Ripe banana', 'Raisins'],
            recipe: 'Cook oats in full-fat milk, stir in sliced banana and raisins for quick glucose recovery.',
            glycemicReason: 'Moderate GI carbs from banana and oats prevent further drop in blood glucose.'
          }
        ] : [
          {
            id: 'b1',
            name: isHigh ? 'Methi (Fenugreek) Multigrain Roti with Low-Fat Curd' : 'Ragi Idli with Sambar & Coconut Chutney',
            icon: isHigh ? '🫓' : '🍱',
            calories: isHigh ? 275 : 290,
            carbs: isHigh ? 32 : 38,
            protein: isHigh ? 11 : 10,
            fat: isHigh ? 7 : 6,
            fiber: isHigh ? 6 : 5,
            giIndex: isHigh ? 35 : 38,
            giRating: 'Low GI',
            portion: isHigh ? '2 rotis + 100g curd' : '3 idlis + 1 bowl sambar + 2 tbsp coconut chutney',
            ingredients: isHigh
              ? ['Fenugreek leaves', 'Besan & whole wheat flour', 'Low-fat curd', 'Roasted cumin']
              : ['Ragi flour', 'Urad dal batter', 'Toor dal sambar', 'Coconut'],
            recipe: isHigh
              ? 'Knead chopped methi with 30% besan and whole wheat flour. Cook on tawa with 1/2 tsp cold-pressed oil.'
              : 'Steam fermented ragi-urad batter in idli molds. Serve with piping hot sambar and fresh coconut chutney.',
            glycemicReason: isHigh
              ? 'Fenugreek contains 4-hydroxyisoleucine which stimulates insulin secretion and slows carb absorption.'
              : 'Ragi has a lower GI than white rice and is rich in calcium and dietary fiber.'
          },
          {
            id: 'b2',
            name: 'Moong Dal Cheela with Mint-Coriander Chutney',
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
            recipe: 'Blend soaked moong dal with ginger and green chilli into smooth batter. Pour thin pancakes on non-stick tawa.',
            glycemicReason: 'Moong dal provides plant protein and fiber that blunts post-breakfast glucose rise.'
          }
        ],
        lunch: [
          {
            id: 'l1',
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
            ingredients: ['Sprouted moong', 'Brown rice', 'Bitter gourd (karela)', 'Mustard oil & amchur'],
            recipe: 'Simmer sprouted moong with cumin and turmeric. Sauté sliced karela in mustard oil with dry mango powder.',
            glycemicReason: 'Bitter gourd contains charantin and polypeptide-p which mimic endogenous insulin action.'
          },
          {
            id: 'l2',
            name: 'Palak Paneer with Jowar Roti & Cucumber Raita',
            icon: '🥗',
            calories: 375,
            carbs: 22,
            protein: 24,
            fat: 14,
            fiber: 7,
            giIndex: 30,
            giRating: 'Very Low GI',
            portion: '150g palak paneer + 1 jowar roti + 100g raita',
            ingredients: ['Low-fat paneer', 'Spinach puree', 'Jowar flour', 'Low-fat curd'],
            recipe: 'Blanch and puree spinach, cook with diced paneer and whole spices. Serve with fresh jowar roti and cucumber raita.',
            glycemicReason: 'Spinach provides magnesium and alpha-lipoic acid that improve cellular glucose metabolism.'
          }
        ],
        dinner: [
          {
            id: 'd1',
            name: 'Masoor Dal Tadka with Bajra Roti & Lauki Sabzi',
            icon: '🍛',
            calories: 340,
            carbs: isHigh ? 36 : 44,
            protein: 18,
            fat: 7,
            fiber: 9,
            giIndex: 38,
            giRating: 'Low GI',
            portion: '1 bowl dal + 1 bajra roti + 100g lauki sabzi',
            ingredients: ['Red lentils (masoor)', 'Bajra flour', 'Bottle gourd (lauki)', 'Garlic & ghee tadka'],
            recipe: 'Cook masoor dal with turmeric and tomatoes. Finish with a ghee-garlic tadka. Serve with hot bajra roti and lauki sabzi.',
            glycemicReason: 'Masoor dal is rich in soluble fiber that slows intestinal glucose absorption overnight.'
          },
          {
            id: 'd2',
            name: 'Vegetable Daliya Khichdi with Curd',
            icon: '🍵',
            calories: 280,
            carbs: 35,
            protein: 12,
            fat: 5,
            fiber: 6,
            giIndex: 41,
            giRating: 'Low GI',
            portion: '1 bowl daliya khichdi + 100g low-fat curd',
            ingredients: ['Broken wheat (daliya)', 'Toor dal', 'Mixed vegetables', 'Jeera & ghee'],
            recipe: 'Pressure cook broken wheat with toor dal and diced vegetables. Finish with a light jeera-ghee tadka.',
            glycemicReason: 'Broken wheat is less processed than semolina — its higher fiber content prevents nocturnal glucose spikes.'
          }
        ],
        snacks: [
          {
            id: 's1',
            name: 'Roasted Kala Chana with Lemon & Cinnamon Chai',
            icon: '🫘',
            calories: 120,
            carbs: 16,
            protein: 7,
            fat: 2,
            fiber: 4,
            giIndex: 28,
            giRating: 'Very Low GI',
            portion: '35g roasted chana + 1 cup unsweetened cinnamon chai',
            ingredients: ['Roasted black chickpeas', 'Rock salt', 'Lemon juice', 'Ceylon cinnamon'],
            recipe: 'Toss roasted kala chana with a squeeze of lemon and black salt. Brew cardamom-cinnamon chai without sugar.',
            glycemicReason: 'Cinnamaldehyde activates glucose transporters; chana fiber prevents mid-afternoon sugar dips.'
          },
          {
            id: 's2',
            name: 'Makhana (Fox Nuts) Roasted with Ghee & Rock Salt',
            icon: '🌰',
            calories: 95,
            carbs: 13,
            protein: 4,
            fat: 3,
            fiber: 3,
            giIndex: 25,
            giRating: 'Very Low GI',
            portion: '30g (approximately 30 pieces)',
            ingredients: ['Fox nuts (makhana)', 'Desi ghee', 'Rock salt (sendha namak)', 'Black pepper'],
            recipe: 'Dry-roast makhana on medium flame until crisp. Toss lightly in minimal ghee with rock salt and cracked pepper.',
            glycemicReason: 'Makhana is a low-GI, low-calorie traditional Indian snack rich in magnesium that stabilizes blood sugar.'
          }
        ]
      },
      foodsToPrioritize: [
        { name: 'Fenugreek (Methi)', reason: 'Slows sugar absorption and increases insulin sensitivity — add to rotis, dals, parathas', icon: '🌿' },
        { name: 'Bitter Gourd (Karela)', reason: 'Contains charantin and polypeptide-p — powerful natural blood sugar regulators', icon: '🥬' },
        { name: 'Ragi, Jowar & Bajra (Millets)', reason: 'Low-GI ancient Indian grains high in magnesium and fiber for steady glucose release', icon: '🌾' },
        { name: 'Amla (Indian Gooseberry)', reason: 'Rich in Vitamin C and chromium — improves insulin sensitivity and lowers fasting glucose', icon: '🍃' },
        { name: 'Sprouted Moong & Kala Chana', reason: 'Abundant resistant starch and prebiotic fiber — eat as dal, salad or chaat', icon: '🫘' }
      ],
      foodsToAvoid: [
        { name: 'Maida-based items (Naan, Puri, Biscuits, Bakery)', reason: 'GI > 75 — rapidly enters bloodstream causing severe glycemic spikes', icon: '🥐' },
        { name: 'Sweetened Beverages & Chai with Sugar', reason: 'High glycemic liquid load lacking fiber buffer — spikes glucose within minutes', icon: '🧃' },
        { name: 'Deep-fried Snacks (Samosas, Pakoras, Bhatura)', reason: 'Trans-fats and refined carbs induce acute insulin resistance and inflammation', icon: '🍟' },
        { name: 'Excess White Rice & White Bread', reason: 'Rapidly digested starch — substitute with brown rice, millets, or multigrain options', icon: '🍚' }
      ],
      hydrationAdvice: `Drink 2.5–3 liters of water daily. Start your morning with soaked methi seeds water. Choose buttermilk (chaas) or coconut water over cold drinks. Avoid sweetened lassi. ${stepNote}`,
      motivationalQuote: stepsToday >= stepGoal
        ? `Outstanding! You hit your ${stepGoal.toLocaleString()} step goal — your GLUT-4 receptors are fully active! Keep fueling with low-GI Indian foods! 🏆`
        : `You have walked ${stepsToday.toLocaleString()} steps today. Every low-GI Indian meal and every step is an investment in your energy and lifelong health! 💪`
    };
  }
}

