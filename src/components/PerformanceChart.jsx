import React, { useState } from 'react';

export default function PerformanceChart({ marks }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!marks || marks.length === 0) {
    return (
      <div className="dashboard-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>No marks data available to display trend.</p>
      </div>
    );
  }

  // Sort chronologically by date
  const sortedMarks = [...marks].sort((a, b) => new Date(a.test_date) - new Date(b.test_date));

  // Chart Constants
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = sortedMarks.map((mark, index) => {
    const scorePct = (mark.marks_obtained / mark.total_marks) * 100;
    
    // X coordinate: spaced evenly across chartWidth
    const x = paddingLeft + (index / Math.max(1, sortedMarks.length - 1)) * chartWidth;
    
    // Y coordinate: inverted since SVG (0,0) is top-left. 100% is at paddingTop, 0% is at height - paddingBottom
    const y = height - paddingBottom - (scorePct / 100) * chartHeight;
    
    return {
      x,
      y,
      percentage: Math.round(scorePct),
      score: `${mark.marks_obtained}/${mark.total_marks}`,
      name: mark.test_name,
      date: mark.test_date,
      comments: mark.comments || 'No comment'
    };
  });

  // Polyline points string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid Lines (0%, 25%, 50%, 75%, 100%)
  const gridPercentages = [0, 25, 50, 75, 100];

  return (
    <div className="dashboard-card chart-card-wrapper">
      <div className="card-header-actions">
        <h3>Performance Trend (% Score)</h3>
        <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
          Average: {Math.round(points.reduce((sum, p) => sum + p.percentage, 0) / points.length)}%
        </span>
      </div>

      <div className="chart-svg-container">
        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="chart-tooltip-bubble"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%`,
              opacity: 1
            }}
          >
            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {hoveredPoint.name}
            </div>
            <div style={{ color: 'var(--accent)', fontWeight: '600', marginBottom: '2px' }}>
              Score: {hoveredPoint.score} ({hoveredPoint.percentage}%)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Date: {hoveredPoint.date}
            </div>
            <div style={{ fontSize: '11px', fontStyle: 'italic', borderTop: '1px solid var(--border-light)', paddingTop: '4px', maxWidth: '200px' }}>
              "{hoveredPoint.comments}"
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            {/* Gradient under the line */}
            <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Line Stroke Gradient */}
            <linearGradient id="chart-line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>

            {/* Drop Shadow for points */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Lines & Y-Axis Labels */}
          {gridPercentages.map(pct => {
            const y = height - paddingBottom - (pct / 100) * chartHeight;
            return (
              <g key={pct}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--border-light)" 
                  strokeDasharray="4,4" 
                />
                <text 
                  x={paddingLeft - 12} 
                  y={y + 4} 
                  fill="var(--text-muted)" 
                  fontSize="12" 
                  fontWeight="600"
                  textAnchor="end"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* X-Axis labels (dates or indices) */}
          {points.map((p, index) => {
            // Only draw label for every node if small count, or select every Nth to avoid crowding
            const showLabel = points.length <= 6 || index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2);
            if (!showLabel) return null;
            
            return (
              <text
                key={index}
                x={p.x}
                y={height - 12}
                fill="var(--text-muted)"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
              >
                {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            );
          })}

          {/* Shaded Area Under Line */}
          {points.length > 1 && (
            <path
              d={`
                M ${points[0].x} ${height - paddingBottom} 
                L ${polylinePoints} 
                L ${points[points.length - 1].x} ${height - paddingBottom} 
                Z
              `}
              fill="url(#chart-area-gradient)"
            />
          )}

          {/* Main Trend Line */}
          {points.length > 1 ? (
            <path
              d={`M ${polylinePoints}`}
              fill="none"
              stroke="url(#chart-line-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            // For single point, draw a placeholder dash
            <line
              x1={paddingLeft}
              y1={points[0].y}
              x2={width - paddingRight}
              y2={points[0].y}
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeDasharray="5,5"
            />
          )}

          {/* Data Points */}
          {points.map((p, index) => (
            <g key={index}>
              {/* Outer Pulse glow circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r="10"
                fill="var(--accent)"
                opacity={hoveredPoint?.name === p.name ? "0.2" : "0"}
                style={{ transition: 'opacity 0.15s ease' }}
              />
              {/* Main point circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.name === p.name ? "6" : "4.5"}
                fill="var(--bg-dark)"
                stroke={hoveredPoint?.name === p.name ? "var(--accent)" : "var(--primary)"}
                strokeWidth="3.5"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
