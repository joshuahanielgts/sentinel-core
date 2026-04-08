import type { ContractClause, RiskLevel } from '@/types/api'

interface ClauseCardProps {
  clause: ContractClause
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  low: { color: '#00ff88', bg: 'rgba(0,255,136,0.05)', border: 'rgba(0,255,136,0.15)' },
  medium: { color: '#ffaa00', bg: 'rgba(255,170,0,0.05)', border: 'rgba(255,170,0,0.15)' },
  high: { color: '#ff6633', bg: 'rgba(255,102,51,0.05)', border: 'rgba(255,102,51,0.15)' },
  critical: { color: '#ff3366', bg: 'rgba(255,51,102,0.05)', border: 'rgba(255,51,102,0.15)' },
}

export default function ClauseCard({ clause }: ClauseCardProps) {
  const { color, bg, border } = riskConfig[clause.risk_level]

  return (
    <div
      className="rounded-lg p-4 transition-all holo-hover"
      style={{
        backgroundColor: bg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: border,
        borderLeftWidth: 3,
        borderLeftColor: color,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
          style={{ color, backgroundColor: `${color}15` }}
        >
          {clause.risk_level}
        </span>
        <span className="text-[10px] font-medium text-foreground/70">{clause.category}</span>
        {clause.position && (
          <span className="ml-auto text-[9px] text-muted-foreground">#{clause.position}</span>
        )}
      </div>
      <p className="mb-2 text-xs leading-relaxed text-foreground/60 line-clamp-3">
        {clause.raw_text}
      </p>
      <p className="text-[11px] leading-relaxed text-foreground/80">
        {clause.rationale}
      </p>
    </div>
  )
}
