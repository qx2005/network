/**
 * Lightweight chart components for dashboard KPIs.
 * 仪表盘图表组件：趋势指示器 + SVG 状态分布条。零外部依赖。
 */

import { Typography } from 'antd'

/* ---- TrendIndicator ---- */

export type TrendProps = {
  /** Positive = up, negative = down, zero = flat. */
  value: number
  label?: string
}

export function TrendIndicator({ value, label }: TrendProps) {
  const cls =
    value > 0 ? 'app-trend app-trend-up' : value < 0 ? 'app-trend app-trend-down' : 'app-trend app-trend-flat'
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '─'
  return (
    <span className={cls}>
      {arrow} {Math.abs(value)}%
      {label ? <span style={{ fontWeight: 400 }}>{label}</span> : null}
    </span>
  )
}

/* ---- StatusDistributionBar ---- */

export type Segment = {
  label: string
  value: number
  color: string
}

export type StatusDistributionBarProps = {
  segments: Segment[]
  total: number
  height?: number
}

export function StatusDistributionBar({ segments, total, height = 8 }: StatusDistributionBarProps) {
  const safeTotal = total > 0 ? total : 1

  return (
    <div className="app-chart-container">
      <svg width="100%" height={height} style={{ display: 'block' }}>
        {segments.map((seg, i) => {
          const pct = (seg.value / safeTotal) * 100
          if (pct <= 0) return null
          const x = segments.slice(0, i).reduce((a, s) => a + (s.value / safeTotal) * 100, 0)
          return (
            <rect
              key={seg.label}
              x={`${x}%`}
              y={0}
              width={`${pct}%`}
              height={height}
              rx={4}
              fill={seg.color}
              style={{
                transformOrigin: 'left center',
                animation: 'bar-grow 0.5s ease forwards',
              }}
            />
          )
        })}
        {segments.every((s) => s.value === 0) ? (
          <rect x={0} y={0} width="100%" height={height} rx={4} fill="#e2e8f0" />
        ) : null}
      </svg>
      <div className="app-status-legend">
        {segments.map((seg) => (
          <span key={seg.label} className="app-status-legend-item">
            <span className="app-status-legend-dot" style={{ background: seg.color }} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {seg.label} {seg.value}
            </Typography.Text>
          </span>
        ))}
      </div>
    </div>
  )
}
