import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const GlucoseView = ({ onOpenGlucoseModal }) => {
  const {
    glucoseReadings,
    deleteGlucoseReading,
    formatGlucose,
    getGlucoseUnit,
    getGlucoseStatus,
    tirPercentage,
    avgGlucoseMg,
    estimatedA1c
  } = useHealth();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const filteredReadings = glucoseReadings.filter(r => {
    if (selectedFilter === 'all') return true;
    return r.type === selectedFilter;
  });

  const allReadingsMg = glucoseReadings.map(r => r.readingMg);
  const minGlucose = allReadingsMg.length ? Math.min(...allReadingsMg) : 0;
  const maxGlucose = allReadingsMg.length ? Math.max(...allReadingsMg) : 0;

  // Chart data: chronological order (last 10)
  const chartData = [...glucoseReadings].slice(0, 10).reverse();

  // SVG Chart Dimensions
  const chartHeight = 150;
  const chartWidth = 440;
  const paddingY = 24;

  const getY = (val) => {
    const minVal = 50;
    const maxVal = 220;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const ratio = (clamped - minVal) / (maxVal - minVal);
    return chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
  };

  const getPointsString = () => {
    if (chartData.length < 2) return '';
    const stepX = (chartWidth - 40) / (chartData.length - 1);
    return chartData
      .map((d, i) => `${20 + i * stepX},${getY(d.readingMg)}`)
      .join(' ');
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. Glucose Analytics 2x2 Grid */}
      <div className="grid-cols-4">
        {/* Average */}
        <div className="app-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            AVG GLUCOSE
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2, lineHeight: 1.2 }}>
            {formatGlucose(avgGlucoseMg)} <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{getGlucoseUnit()}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>Last 7 days mean</div>
        </div>

        {/* Estimated HbA1c */}
        <div className="app-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            EST. HbA1c
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--secondary)', marginTop: 2, lineHeight: 1.2 }}>
            {estimatedA1c}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>Clinical target: &lt;7.0%</div>
        </div>

        {/* Time In Range */}
        <div className="app-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            TIME IN RANGE
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)', marginTop: 2, lineHeight: 1.2 }}>
            {tirPercentage}%
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>Target: &gt;70%</div>
        </div>

        {/* Min - Max Range */}
        <div className="app-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
            MIN / MAX (7D)
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: 2, lineHeight: 1.2 }}>
            <span style={{ color: 'var(--hypo-color)' }}>{formatGlucose(minGlucose)}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 3px' }}>-</span>
            <span style={{ color: 'var(--high-color)' }}>{formatGlucose(maxGlucose)}</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 2 }}>{getGlucoseUnit()} spread</div>
        </div>
      </div>

      {/* 2. Interactive SVG Glucose Curve */}
      <div className="app-card" style={{ padding: '14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Glucose Trend Curve</h3>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {['7d', '14d', '30d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: timeRange === range ? 'var(--primary-light)' : 'var(--bg-card-subtle)',
                  color: timeRange === range ? 'var(--primary)' : 'var(--text-secondary)',
                  border: `1px solid ${timeRange === range ? 'var(--primary)' : 'var(--border-light)'}`
                }}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Responsive Line Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }} className="no-scrollbar">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: 300, overflow: 'visible' }}
          >
            {/* Target Range Band (70 - 140 mg/dL) */}
            <rect
              x="0"
              y={getY(140)}
              width={chartWidth}
              height={getY(70) - getY(140)}
              fill="rgba(16, 185, 129, 0.07)"
              rx="4"
            />
            <line
              x1="0"
              y1={getY(140)}
              x2={chartWidth}
              y2={getY(140)}
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="4 4"
            />
            <line
              x1="0"
              y1={getY(70)}
              x2={chartWidth}
              y2={getY(70)}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeDasharray="4 4"
            />

            <text x="6" y={getY(140) - 3} fontSize="8" fill="var(--text-muted)">140 Max Target</text>
            <text x="6" y={getY(70) + 10} fontSize="8" fill="var(--text-muted)">70 Min Target</text>

            {/* Polyline */}
            {chartData.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPointsString()}
              />
            )}

            {/* Points */}
            {chartData.map((d, i) => {
              const stepX = (chartWidth - 40) / Math.max(1, chartData.length - 1);
              const x = 20 + i * stepX;
              const y = getY(d.readingMg);
              const st = getGlucoseStatus(d.readingMg);
              return (
                <g key={d.id}>
                  <circle cx={x} cy={y} r="4.5" fill="var(--bg-card)" stroke={st.color} strokeWidth="2.2" />
                  <text x={x} y={y - 7} fontSize="8.5" fontWeight="700" textAnchor="middle" fill="var(--text-primary)">
                    {formatGlucose(d.readingMg)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--hypo-color)' }} />
            <span>Hypo (&lt;70)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--in-range-color)' }} />
            <span>Normal (70-140)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--elevated-color)' }} />
            <span>Elevated (140-180)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--high-color)' }} />
            <span>High (&gt;180)</span>
          </div>
        </div>
      </div>

      {/* 3. History Log with Filter Pills */}
      <div className="app-card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Reading Log</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {filteredReadings.length} recorded logs
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={onOpenGlucoseModal}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Plus size={14} />
            <span>Log</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'fasting', label: 'Fasting' },
            { id: 'beforeMeal', label: 'Before Meal' },
            { id: 'afterMeal', label: 'After Meal' },
            { id: 'random', label: 'Random' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: selectedFilter === f.id ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: selectedFilter === f.id ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reading List Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filteredReadings.map(r => {
            const st = getGlucoseStatus(r.readingMg);
            const dateObj = new Date(r.timestamp);
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      color: st.color,
                      border: `1.5px solid ${st.color}`,
                      flexShrink: 0
                    }}
                  >
                    {formatGlucose(r.readingMg)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'capitalize' }}>
                        {r.type || 'Fasting'}
                      </span>
                      <span className={`status-badge ${st.class}`} style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                        {st.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {r.notes && ` • ${r.notes}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteGlucoseReading(r.id)}
                  style={{
                    color: 'var(--text-muted)',
                    padding: 5,
                    borderRadius: 4,
                    flexShrink: 0,
                    marginLeft: 6
                  }}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
