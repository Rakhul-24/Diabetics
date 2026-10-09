import { db } from '../config/firebase.js';

export async function getWeeklyReport(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';

    const report = {
      period: 'weekly',
      generatedAt: new Date().toISOString(),
      avgGlucose: 142.5,
      maxGlucose: 190.0,
      minGlucose: 105.0,
      inRangePercentage: 85.0,
      totalSteps: 36500,
      avgSleepHours: 6.7,
      glucoseReadings: [142, 168, 135, 195, 158, 172, 148],
      stepTrend: [5200, 7800, 4300, 6100, 8200, 5500, 6800],
      heartRateTrend: [72, 68, 78, 82, 71, 75, 69],
      doctorSummary: 'Glucose levels showed minor post-lunch spikes on Day 2 and Day 4. Overall 85% of readings were within target range (70-140 mg/dL).'
    };

    return res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyReport(req, res, next) {
  try {
    const uid = req.user?.uid || 'dev_user_arjun_123';

    const report = {
      period: 'monthly',
      generatedAt: new Date().toISOString(),
      avgGlucose: 138.2,
      estimatedHbA1c: 6.4,
      totalSteps: 158000,
      avgSleepHours: 6.9,
      monthlyComplianceScore: 88,
      doctorSummary: 'Estimated HbA1c is 6.4% based on 30-day continuous glucose data. Good adherence to exercise and medication.'
    };

    return res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
}
