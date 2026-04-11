import { useEffect, useState } from 'react';
import type { RiskLevel } from '@/types/api';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

function getRiskLevel(score: number): RiskLevel {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'hsl(var(--risk-low))';
    case 'medium': return 'hsl(var(--risk-medium))';
    case 'high': return 'hsl(var(--risk-high))';
    case 'critical': return 'hsl(var(--risk-critical))';
  }
}

function getGlowColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'rgba(16,185,129,0.3)';
    case 'medium': return 'rgba(245,158,11,0.3)';
    case 'high': return 'rgba(249,115,22,0.3)';
    case 'critical': return 'rgba(239,68,68,0.3)';
  }
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const level = getRiskLevel(score);
  const color = getRiskColor(level);
  const glow = getGlowColor(level);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const center = size / 2;
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <defs>
          <filter id={`glow-${level}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M 10 ${center} A ${radius} ${radius} 0 0 1 ${size - 10} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          filter={`url(#glow-${level})`}
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
        />
        {/* Score text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="font-mono font-bold"
          fill={color}
          fontSize={size / 4}
        >
          {animatedScore}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          className="font-mono uppercase"
          fill={color}
          fontSize={size / 14}
        >
          {level.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
