import type { Contract, RiskLevel, ContractStatus } from '@/types/api'
import { FileText, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface ContractGridProps {
  contracts: Contract[]
  onSelect: (contract: Contract) => void
}

function getRiskLevel(score: number | null): RiskLevel | null {
  if (score === null) return null
  if (score <= 25) return 'low'
  if (score <= 50) return 'medium'
  if (score <= 75) return 'high'
  return 'critical'
}

const riskGlow: Record<RiskLevel, string> = {
  low: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]',
  medium: 'hover:shadow-[0_0_20px_rgba(255,170,0,0.15)]',
  high: 'hover:shadow-[0_0_20px_rgba(255,102,51,0.15)]',
  critical: 'hover:shadow-[0_0_20px_rgba(255,51,102,0.15)]',
}

const riskBorder: Record<RiskLevel, string> = {
  low: 'hover:border-[#00ff88]/30',
  medium: 'hover:border-[#ffaa00]/30',
  high: 'hover:border-[#ff6633]/30',
  critical: 'hover:border-[#ff3366]/30',
}

const riskColor: Record<RiskLevel, string> = {
  low: 'text-[#00ff88]',
  medium: 'text-[#ffaa00]',
  high: 'text-[#ff6633]',
  critical: 'text-[#ff3366]',
}

const statusIcon: Record<ContractStatus, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-[#ffaa00]" />,
  uploaded: <CheckCircle className="h-3.5 w-3.5 text-[#00d4ff]" />,
  analyzing: <Loader2 className="h-3.5 w-3.5 animate-spin text-[#a855f7]" />,
  complete: <CheckCircle className="h-3.5 w-3.5 text-[#00ff88]" />,
  error: <AlertTriangle className="h-3.5 w-3.5 text-[#ff3366]" />,
}

export default function ContractGrid({ contracts, onSelect }: ContractGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contracts.map((contract) => {
        const risk = getRiskLevel(contract.risk_score)
        const glowClass = risk ? riskGlow[risk] : 'hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]'
        const borderClass = risk ? riskBorder[risk] : 'hover:border-[#00d4ff]/20'

        return (
          <div
            key={contract.id}
            onClick={() => onSelect(contract)}
            className={`
              group cursor-pointer rounded-lg border border-border/50 bg-card p-4
              transition-all duration-300 hover:-translate-y-1
              ${glowClass} ${borderClass}
            `}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/50">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              {risk && contract.risk_score !== null && (
                <span className={`text-xl font-bold tabular-nums ${riskColor[risk]}`}>
                  {contract.risk_score}
                </span>
              )}
            </div>

            <h3 className="mb-1 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {contract.name}
            </h3>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              {statusIcon[contract.status]}
              <span className="uppercase tracking-wider">{contract.status}</span>
              <span className="ml-auto">
                {new Date(contract.created_at).toLocaleDateString()}
              </span>
            </div>

            {contract.summary && (
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {contract.summary}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
