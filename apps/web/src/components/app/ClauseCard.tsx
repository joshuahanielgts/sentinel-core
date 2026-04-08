import { Badge } from '@/components/ui/badge'
import type { ContractClause } from '@/types/api'
import type { RiskLevel } from '@/types/api'

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

interface ClauseCardProps {
  clause: ContractClause
}

export default function ClauseCard({ clause }: ClauseCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Badge className={riskColors[clause.risk_level]} variant="secondary">
          {clause.risk_level}
        </Badge>
        <span className="text-sm font-medium text-muted-foreground">{clause.category}</span>
      </div>
      <p className="mb-2 text-sm leading-relaxed">{clause.raw_text}</p>
      <p className="text-xs text-muted-foreground italic">{clause.rationale}</p>
    </div>
  )
}
