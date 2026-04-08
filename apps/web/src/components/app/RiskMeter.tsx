import { useEffect, useState } from 'react'
import type { RiskLevel } from '@/types/api'

interface RiskMeterProps {
  score: number
  size?: number
  animated?: boolean
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

const riskConfig: Record<RiskLevel, { color: string; glow: string; label: string }> = {
  low: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)', label: 'LOW RISK' },
  medium: { color: '#ffaa00', glow: 'rgba(255, 170, 0, 0.4)', label: 'MEDIUM RISK' },
  high: { color: '#ff6633', glow: 'rgba(255, 102, 51, 0.4)', label: 'HIGH RISK' },
  critical: { color: '#ff3366', glow: 'rgba(255, 51, 102, 0.4)', label: 'CRITICAL' },
}

export default function RiskMeter({ score, size = 180, animated = true }: RiskMeterProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const level = getRiskLevel(score)
  const { color, glow, label } = riskConfig[level]

  const strokeWidth = 8
  const radius = (size - strokeWidth * 2) / 2
  const center = size / 2
  const startAngle = 135
  const endAngle = 405
  const totalAngle = endAngle - startAngle
  const progressAngle = startAngle + (displayScore / 100) * totalAngle

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score)
      return
    }
    let frame: number
    const start = performance.now()
    const duration = 1200
    const from = 0

    function animate(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(from + (score - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score, animated])

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    }
  }

  function describeArc(startA: number, endA: number) {
    const start = polarToCartesian(endA)
    const end = polarToCartesian(startA)
    const largeArc = endA - startA > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  const bgPath = describeArc(startAngle, endAngle)
  const fgPath = displayScore > 0 ? describeArc(startAngle, progressAngle) : ''

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <filter id="glow-meter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={bgPath}
          fill="none"
          stroke="rgba(30, 42, 69, 0.8)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {displayScore > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow-meter)"
            style={{ transition: animated ? 'none' : 'all 0.7s ease' }}
          />
        )}

        {displayScore > 0 && (() => {
          const tip = polarToCartesian(progressAngle)
          return (
            <circle
              cx={tip.x}
              cy={tip.y}
              r={4}
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
            />
          )
        })()}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 20px ${glow}` }}
        >
          {displayScore}
        </span>
        <span className="mt-1 text-[10px] font-medium tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}
