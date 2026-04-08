import type { RiskLevel } from '@/types/api'

interface RiskGaugeProps {
  score: number
  size?: number
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

const riskColorMap: Record<RiskLevel, string> = {
  low: 'var(--color-risk-low)',
  medium: 'var(--color-risk-medium)',
  high: 'var(--color-risk-high)',
  critical: 'var(--color-risk-critical)',
}

const riskLabelMap: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
}

export default function RiskGauge({ score, size = 160 }: RiskGaugeProps) {
  const level = getRiskLevel(score)
  const color = riskColorMap[level]
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={8}
          className="text-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: size * 0.28 }}>
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">{riskLabelMap[level]}</span>
      </div>
    </div>
  )
}
