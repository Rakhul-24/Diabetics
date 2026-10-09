import React, { useMemo } from 'react';
import {
  Activity,
  Flame,
  Footprints,
  TrendingUp,
  TrendingDown,
  Minus,
  Utensils,
  Droplets,
  BarChart2,
  CalendarDays
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

/* ─── helper: get ISO date string ─── */
const dateStr = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

/* ─── helper: day offsets ─── */
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
};

export const ReportsView = () => {
  const {
    glucoseReadings,
    formatGlucose,
    getGlucoseUnit,
    stepsData,
    stepHistory,
    mealPlan,
    tirPercentage,
    avgGlucoseMg,
    estimatedA1c
  } = useHealth();

  const today = dateStr(new Date());

  /* ──────────────────────────────────────────────────
     1. Build 7-day label list
  ────────────────────────────────────────────────── */
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push({
        label: new Date(new Date().setDate(new Date().getDate() - i))
          .toLocaleDateString('en-US', { weekday: 'short' }),
        date: daysAgoStr(i)
      });
    }
    return days;
  }, []);

  /* ──────────────────────────────────────────────────
     2. Glucose by date map
  ────────────────────────────────────────────────── */
  const glucoseByDate = useMemo(() => {
    const map = {};
    glucoseReadings.forEach(r => {
      const d = dateStr(r.timestamp);
      if (!map[d]) map[d] = [];
      map[d].push(r.readingMg);
    });
    return map;
  }, [glucoseReadings]);

  /* This week */
  const thisWeekGlucose = useMemo(() =>
    weekDays.map(({ label, date }) => {
      const vals = glucoseByDate[date] || [];
      return {
        label, date,
        avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
        count: vals.length
      };
    }), [weekDays, glucoseByDate]);

  /* Last week (days 13 → 7 ago) */
  const lastWeekGlucose = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 7; i--) {
      const date = daysAgoStr(i);
      const vals = glucoseByDate[date] || [];
      days.push({
        label: new Date(new Date().setDate(new Date().getDate() - i))
          .toLocaleDateString('en-US', { weekday: 'short' }),
        date,
        avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
      });
    }
    return days;
  }, [glucoseByDate]);

  const thisWeekAvg = useMemo(() => {
    const valid = thisWeekGlucose.filter(d => d.avg !== null);
    return valid.length ? Math.round(valid.reduce((a, d) => a + d.avg, 0) / valid.length) : avgGlucoseMg;
  }, [thisWeekGlucose, avgGlucoseMg]);

  const lastWeekAvg = useMemo(() => {
    const valid = lastWeekGlucose.filter(d => d.avg !== null);
    return valid.length ? Math.round(valid.reduce((a, d) => a + d.avg, 0) / valid.length) : null;
  }, [lastWeekGlucose]);

  const glucoseDelta = lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  /* ──────────────────────────────────────────────────
     3. Steps — merge history + today
  ────────────────────────────────────────────────── */
  const allStepDays = useMemo(() => {
    const map = {};
    (stepHistory || []).forEach(h => { map[h.date] = h; });
    if (stepsData?.current !== undefined) {
      map[today] = {
        date: today,
        day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        steps: stepsData.current || 0,
        goal: stepsData.goal || 8000,
        caloriesBurned: stepsData.caloriesBurned || 0,
        distanceKm: stepsData.distanceKm || 0,
        achieved: (stepsData.current || 0) >= (stepsData.goal || 8000)
      };
    }
    return weekDays.map(({ label, date }) => ({
      label, date,
      ...(map[date] || { steps: 0, goal: 8000, caloriesBurned: 0, distanceKm: 0, achieved: false })
    }));
  }, [stepHistory, stepsData, weekDays, today]);

  const thisWeekTotalSteps = allStepDays.reduce((a, d) => a + (d.steps || 0), 0);
  const thisWeekCaloriesBurned = allStepDays.reduce((a, d) => a + (d.caloriesBurned || 0), 0);
  const stepGoalMetDays = allStepDays.filter(d => d.achieved).length;

  /* Last week step totals from history */
  const lastWeekStepDays = useMemo(() => {
    const map = {};
    (stepHistory || []).forEach(h => { map[h.date] = h; });
    const days = [];
    for (let i = 13; i >= 7; i--) {
      const d = daysAgoStr(i);
      days.push(map[d] || { steps: 0, caloriesBurned: 0 });
    }
    return days;
  }, [stepHistory]);

  const lastWeekTotalSteps = lastWeekStepDays.reduce((a, d) => a + (d.steps || 0), 0);
  const lastWeekCaloriesBurned = lastWeekStepDays.reduce((a, d) => a + (d.caloriesBurned || 0), 0);
  const stepsDelta = thisWeekTotalSteps - lastWeekTotalSteps;

  /* ──────────────────────────────────────────────────
     4. Calories eaten from mealPlan
  ────────────────────────────────────────────────── */
  const allMeals = useMemo(() => {
    const plan = mealPlan?.meals || {};
    return [
      ...(plan.breakfast || []),
      ...(plan.lunch || []),
      ...(plan.dinner || []),
      ...(plan.snacks || [])
    ];
  }, [mealPlan]);

  // Eaten meals today (resets to 0 each morning, increases as meals are marked eaten)
  const eatenMeals = useMemo(() => {
    return allMeals.filter(m => m.eaten === true);
  }, [allMeals]);

  const totalCaloriesEaten = eatenMeals.reduce((a, m) => a + (m.calories || 0), 0);
  const totalCarbsEaten = eatenMeals.reduce((a, m) => a + (m.carbs || 0), 0);
  const totalProteinEaten = eatenMeals.reduce((a, m) => a + (m.protein || 0), 0);
  const totalFatEaten = eatenMeals.reduce((a, m) => a + (m.fat || 0), 0);
  const calTarget = mealPlan?.dailyCalorieTarget || 1750;
  const calPct = Math.min(100, Math.round((totalCaloriesEaten / calTarget) * 100));

  /* ──────────────────────────────────────────────────
     Chart helpers
  ────────────────────────────────────────────────── */
  const maxGlucose = 220;
  const maxSteps = Math.max(...allStepDays.map(d => d.steps || 0), stepsData?.goal || 8000);

  const glucoseBarColor = (val) => {
    if (!val) return 'var(--border-light)';
    if (val < 70) return '#6366f1';
    if (val <= 140) return '#10B981';
    if (val <= 180) return '#F59E0B';
    return '#EF4444';
  };

  const TrendIcon = ({ delta, positiveIsGood = true }) => {
    if (delta === null || delta === 0) return <Minus size={13} style={{ color: 'var(--text-muted)' }} />;
    const good = positiveIsGood ? delta > 0 : delta < 0;
    return delta > 0
      ? <TrendingUp size={13} style={{ color: good ? '#10B981' : '#EF4444' }} />
      : <TrendingDown size={13} style={{ color: good ? '#10B981' : '#EF4444' }} />;
  };

  const card = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md, 12px)',
    border: '1px solid var(--border-light)',
    padding: '14px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(59,130,246,0.08) 100%)',
        border: '1.5px solid rgba(16,185,129,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}>
            <BarChart2 size={18} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 900 }}>Weekly Health Summary</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 1 }}>
              {new Date(daysAgoStr(6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' – '}
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '0.69rem', fontWeight: 800, padding: '4px 10px',
          borderRadius: 99, background: 'rgba(16,185,129,0.12)',
          color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.3)'
        }}>
          <CalendarDays size={12} /> Last 7 days
        </div>
      </div>

      {/* ── KEY METRICS STRIP ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {/* Avg glucose this week */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${thisWeekAvg > 160 ? '#EF4444' : '#10B981'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color={thisWeekAvg > 160 ? '#EF4444' : '#10B981'} />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Week Avg Glucose</div>
            <div style={{ fontSize: '1.12rem', fontWeight: 900, color: thisWeekAvg > 160 ? '#EF4444' : '#10B981' }}>{formatGlucose(thisWeekAvg)} <span style={{ fontSize: '0.65rem' }}>{getGlucoseUnit()}</span></div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <TrendIcon delta={glucoseDelta !== null ? -glucoseDelta : null} positiveIsGood={true} />
              {glucoseDelta !== null ? `${glucoseDelta > 0 ? '+' : ''}${glucoseDelta} vs last week` : 'No prior data'}
            </div>
          </div>
        </div>

        {/* Total steps this week */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#3B82F622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Footprints size={18} color="#3B82F6" />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Steps This Week</div>
            <div style={{ fontSize: '1.12rem', fontWeight: 900, color: '#3B82F6' }}>{thisWeekTotalSteps.toLocaleString()}</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)' }}>{stepGoalMetDays}/7 daily goals met</div>
          </div>
        </div>

        {/* Calories burned from steps */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#F59E0B22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={18} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Calories Burned</div>
            <div style={{ fontSize: '1.12rem', fontWeight: 900, color: '#F59E0B' }}>{thisWeekCaloriesBurned.toLocaleString()} <span style={{ fontSize: '0.65rem' }}>kcal</span></div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)' }}>vs {lastWeekCaloriesBurned.toLocaleString()} kcal last week</div>
          </div>
        </div>

        {/* Calories eaten today */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: '#8B5CF622', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils size={18} color="#8B5CF6" />
          </div>
          <div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Calories Eaten Today</div>
            <div style={{ fontSize: '1.12rem', fontWeight: 900, color: '#8B5CF6' }}>{totalCaloriesEaten} <span style={{ fontSize: '0.65rem' }}>kcal</span></div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)' }}>{calPct}% of {calTarget} kcal target</div>
          </div>
        </div>
      </div>

      {/* ── GLUCOSE CHART — THIS WEEK vs LAST WEEK ────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Activity size={15} color="var(--primary)" />
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Blood Glucose — This Week vs Last Week</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#10B981' }} />This Week
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'rgba(16,185,129,0.28)' }} />Last Week
            </span>
          </div>
        </div>

        {/* Grouped bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
          {thisWeekGlucose.map((day, idx) => {
            const lastDay = lastWeekGlucose[idx];
            const thisH = day.avg ? Math.round((day.avg / maxGlucose) * 100) : 0;
            const lastH = lastDay?.avg ? Math.round((lastDay.avg / maxGlucose) * 100) : 0;
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: '0.56rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {day.avg || '–'}
                </div>
                <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 96 }}>
                  {/* Last week ghost bar */}
                  <div style={{
                    flex: 1, height: `${lastH}%`, minHeight: lastDay?.avg ? 4 : 0,
                    background: 'rgba(16,185,129,0.22)', borderRadius: '3px 3px 0 0'
                  }} title={lastDay?.avg ? `Last week: ${lastDay.avg}` : 'No data'} />
                  {/* This week bar */}
                  <div style={{
                    flex: 1, height: `${thisH}%`, minHeight: day.avg ? 4 : 0,
                    background: glucoseBarColor(day.avg),
                    borderRadius: '3px 3px 0 0',
                    boxShadow: day.avg ? `0 2px 6px ${glucoseBarColor(day.avg)}55` : 'none'
                  }} title={day.avg ? `${day.label}: ${day.avg} ${getGlucoseUnit()}` : 'No reading'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* X labels */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {thisWeekGlucose.map(day => (
            <div key={day.date} style={{ flex: 1, textAlign: 'center', fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {day.label}
            </div>
          ))}
        </div>

        {/* Summary strip */}
        <div style={{
          marginTop: 10, padding: '7px 11px', borderRadius: 7,
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.71rem', color: 'var(--text-secondary)'
        }}>
          <span>🟢 Target: 70–140 {getGlucoseUnit()}</span>
          <span>This week avg: <strong style={{ color: thisWeekAvg > 160 ? '#EF4444' : '#10B981' }}>{formatGlucose(thisWeekAvg)} {getGlucoseUnit()}</strong></span>
          {lastWeekAvg && <span>Last week avg: <strong>{formatGlucose(lastWeekAvg)} {getGlucoseUnit()}</strong></span>}
          {glucoseDelta !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendIcon delta={-glucoseDelta} positiveIsGood={true} />
              <span style={{ color: glucoseDelta < 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                {glucoseDelta > 0 ? '+' : ''}{glucoseDelta} {getGlucoseUnit()} vs last week
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── STEPS CHART ─────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Footprints size={15} color="#3B82F6" />
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Steps & Calories Burned — This Week</h3>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Goal: <strong>{(stepsData?.goal || 8000).toLocaleString()}</strong>/day
          </div>
        </div>

        {/* Step bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110 }}>
          {allStepDays.map(day => {
            const h = Math.round(((day.steps || 0) / maxSteps) * 100);
            const goalH = Math.round(((day.goal || 8000) / maxSteps) * 100);
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {day.steps ? ((day.steps / 1000).toFixed(1) + 'k') : '0'}
                </div>
                <div style={{ width: '100%', height: 92, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                  {/* Goal dashed line */}
                  <div style={{
                    position: 'absolute', bottom: `${goalH}%`, left: 0, right: 0,
                    borderTop: '1.5px dashed rgba(59,130,246,0.35)'
                  }} />
                  {/* Bar */}
                  <div style={{
                    width: '100%',
                    height: `${Math.max(h, 3)}%`,
                    background: day.achieved
                      ? 'linear-gradient(180deg, #3B82F6, #2563EB)'
                      : 'linear-gradient(180deg, rgba(59,130,246,0.55), rgba(59,130,246,0.28))',
                    borderRadius: '4px 4px 0 0',
                    boxShadow: day.achieved ? '0 2px 8px rgba(59,130,246,0.4)' : 'none'
                  }} title={`${day.label}: ${(day.steps || 0).toLocaleString()} steps · ${day.caloriesBurned || 0} kcal burned`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* X labels */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {allStepDays.map(day => (
            <div key={day.date} style={{ flex: 1, textAlign: 'center', fontSize: '0.63rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {day.label}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 8 }}>
          {[
            { label: 'Total Steps', value: thisWeekTotalSteps.toLocaleString(), icon: '👟', accent: '#3B82F6' },
            { label: 'Goals Met', value: `${stepGoalMetDays} / 7 days`, icon: '🎯', accent: '#10B981' },
            { label: 'Calories Burned', value: `${thisWeekCaloriesBurned.toLocaleString()} kcal`, icon: '🔥', accent: '#F59E0B' },
            {
              label: 'vs Last Week', icon: stepsDelta >= 0 ? '📈' : '📉',
              value: (stepsDelta >= 0 ? '+' : '') + stepsDelta.toLocaleString() + ' steps',
              accent: stepsDelta >= 0 ? '#10B981' : '#EF4444'
            }
          ].map(({ label, value, icon, accent }) => (
            <div key={label} style={{
              padding: '8px 10px', borderRadius: 8,
              background: `${accent}12`, border: `1px solid ${accent}33`
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: accent, marginTop: 2 }}>{icon} {value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CALORIES EATEN — NUTRITION BREAKDOWN ─────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <Utensils size={15} color="#8B5CF6" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Today's Nutrition — Calories Eaten</h3>
        </div>

        {/* Calorie progress */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, marginBottom: 6 }}>
            <span>Calories Eaten</span>
            <span style={{ color: 'var(--text-secondary)' }}>{totalCaloriesEaten} / {calTarget} kcal</span>
          </div>
          <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${calPct}%`,
              background: calPct > 105 ? 'linear-gradient(90deg,#EF4444,#DC2626)' : 'linear-gradient(90deg,#8B5CF6,#7C3AED)',
              borderRadius: 6, transition: 'width 0.6s ease',
              boxShadow: '0 2px 8px rgba(139,92,246,0.35)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
            <span>{calPct}% of daily target</span>
            <span>{Math.max(0, calTarget - totalCaloriesEaten)} kcal remaining</span>
          </div>
        </div>

        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Carbs', eaten: totalCarbsEaten, target: mealPlan?.dailyCarbTarget || 140, unit: 'g', color: '#F59E0B' },
            { label: 'Protein', eaten: totalProteinEaten, target: mealPlan?.dailyProteinTarget || 85, unit: 'g', color: '#10B981' },
            { label: 'Fat', eaten: totalFatEaten, target: mealPlan?.dailyFatTarget || 50, unit: 'g', color: '#3B82F6' }
          ].map(({ label, eaten, target, unit, color }) => {
            const pct = Math.min(100, Math.round((eaten / target) * 100));
            return (
              <div key={label} style={{
                padding: '10px 12px', borderRadius: 10,
                background: `${color}11`, border: `1px solid ${color}33`
              }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color }}>{eaten}{unit}</div>
                <div style={{ fontSize: '0.61rem', color: 'var(--text-secondary)', marginBottom: 5 }}>of {target}{unit}</div>
                <div style={{ width: '100%', height: 5, borderRadius: 3, background: 'rgba(0,0,0,0.08)' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-meal list */}
        {allMeals.length > 0 && (
          <>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Meal Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {allMeals.map((m, i) => (
                <div key={m.id || i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 10px', borderRadius: 8,
                  background: 'var(--bg-card-subtle, rgba(0,0,0,0.03))',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ fontSize: '1rem' }}>{m.icon || '🍽️'}</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: m.eaten ? 'rgba(16, 185, 129, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                      color: m.eaten ? '#10B981' : 'var(--text-muted)'
                    }}>
                      {m.eaten ? '✓ Eaten' : 'Planned'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: '0.68rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, color: '#8B5CF6' }}>{m.calories} kcal</span>
                    <span>{m.carbs}g carbs</span>
                    <span>{m.protein}g protein</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── GLYCEMIC CONTROL SUMMARY ─────────────────────── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <Droplets size={15} color="#6366f1" />
          <h3 style={{ fontSize: '0.88rem', fontWeight: 800 }}>Glycemic Control Summary</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: 8 }}>
          {[
            { label: 'Est. HbA1c', value: `${estimatedA1c}%`, sub: 'Target < 7.0%', accent: '#6366f1' },
            { label: 'Time in Range', value: `${tirPercentage}%`, sub: 'Goal > 70%', accent: '#10B981' },
            { label: 'This Week Avg', value: `${formatGlucose(thisWeekAvg)} ${getGlucoseUnit()}`, sub: 'Target 70–140', accent: thisWeekAvg > 160 ? '#EF4444' : '#10B981' },
            { label: 'Total Readings', value: glucoseReadings.length, sub: 'All logged readings', accent: '#3B82F6' }
          ].map(({ label, value, sub, accent }) => (
            <div key={label} style={{
              padding: '10px 12px', borderRadius: 10,
              background: `${accent}11`, border: `1px solid ${accent}33`
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: accent, marginTop: 2 }}>{value}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 1 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

