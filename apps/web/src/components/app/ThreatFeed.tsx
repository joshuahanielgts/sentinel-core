import type { RecentClause, RiskLevel } from '@/types/api'
import { AlertTriangle, Shield } from 'lucide-react'

interface ThreatFeedProps {
  clauses: RecentClause[]
}

const riskIndicator: Record<RiskLevel, { color: string; bg: string }> = {
  low: { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' },
  medium: { color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)' },
  high: { color: '#ff6633', bg: 'rgba(255, 102, 51, 0.1)' },
  critical: { color: '#ff3366', bg: 'rgba(255, 51, 102, 0.1)' },
}

export default function ThreatFeed({ clauses }: ThreatFeedProps) {
  if (clauses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Shield className="mb-3 h-8 w-8 opacity-30" />
        <p className="text-sm">No active threats detected</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {clauses.map((clause, i) => {
        const { color, bg } = riskIndicator[clause.risk_level]
        return (
          <div
            key={clause.id}
            className="group rounded-lg border border-border/50 p-3 transition-all hover:border-border holo-hover"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ backgroundColor: bg }}
              >
                <AlertTriangle className="h-3 w-3" style={{ color }} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                {clause.risk_level}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {clause.category}
              </span>
            </div>
            <p className="text-xs font-medium text-foreground/90">{clause.contract_name}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {clause.rationale}
            </p>
          </div>
        )
      })}
    </div>
  )
}
