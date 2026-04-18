'use client'
import React, { useEffect, useRef } from 'react'

interface CircularGaugeProps {
  value:  number
  max:    number
  size?:  number
  label?: string
  color?: string
}

function getColor(pct: number): string {
  if (pct >= 0.85) return 'var(--color-success, #22C55E)'
  if (pct >= 0.70) return 'var(--color-primary, #4F46E5)'
  if (pct >= 0.50) return 'var(--color-warning, #F59E0B)'
  return 'var(--color-danger, #EF4444)'
}

export default function CircularGauge({ value, max, size = 140, label, color }: CircularGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const pct         = Math.min(value / max, 1)
  const cx          = size / 2
  const cy          = size / 2
  const r           = size * 0.38
  const strokeW     = size * 0.072
  const circumference = 2 * Math.PI * r
  const trackDash   = (270 / 360) * circumference
  const fillDash    = pct * trackDash
  const gapDash     = circumference - trackDash
  const arcColor    = color ?? getColor(pct)
  const fontSize    = size * 0.21
  const subSize     = size * 0.11

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    el.style.transition = 'none'
    el.setAttribute('stroke-dasharray', `0 ${circumference}`)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'stroke-dasharray 0.85s cubic-bezier(0.4,0,0.2,1)'
        el.setAttribute('stroke-dasharray', `${fillDash} ${circumference - fillDash}`)
      })
    })
  }, [value, max, fillDash, circumference])

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#EEF2F8"
        strokeWidth={strokeW}
        strokeDasharray={`${trackDash} ${gapDash}`}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />
      {/* Fill */}
      <circle
        ref={circleRef}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeW}
        strokeDasharray={`0 ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 ${strokeW * 0.5}px ${arcColor}88)` }}
      />
      {/* Value */}
      <text
        x={cx} y={cy - size * 0.03}
        textAnchor="middle" dominantBaseline="middle"
        fill="#0D1B2A"
        fontSize={fontSize}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
      >
        {Math.round(value)}
      </text>
      {/* Label */}
      {label && (
        <text
          x={cx} y={cy + fontSize * 0.72}
          textAnchor="middle" dominantBaseline="middle"
          fill="#5A6A82"
          fontSize={subSize}
          fontFamily="'Cairo', system-ui"
          fontWeight="500"
        >
          {label}
        </text>
      )}
    </svg>
  )
}