import type { RecentClause, RiskLevel } from '@/types/api';
import { cn } from '@/lib/utils';

interface ThreatFeedProps {
  clauses: RecentClause[];
}

const riskBorderClass: Record<RiskLevel, string> = {
  low: 'risk-border-low',
  medium: 'risk-border-medium',
  high: 'risk-border-high',
  critical: 'risk-border-critical',
};

const riskBadgeClass: Record<RiskLevel, string> = {
  low: 'bg-risk-low/20 text-risk-low',
  medium: 'bg-risk-medium/20 text-risk-medium',
  high: 'bg-risk-high/20 text-risk-high',
  critical: 'bg-risk-critical/20 text-risk-critical',
};

export function ThreatFeed({ clauses }: ThreatFeedProps) {
  if (clauses.length === 0) {
    return (
      <div className="rounded-lg glass p-6 text-center">
        <p className="font-mono text-risk-low text-sm">NO ACTIVE THREATS DETECTED — SYSTEM NOMINAL</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clauses.map((clause) => (
        <div
          key={clause.id}
          className={cn(
            'rounded-lg bg-card border border-border border-l-2 p-3 space-y-1',
            riskBorderClass[clause.risk_level],
            clause.risk_level === 'critical' && 'pulse-critical'
          )}
        >
          <div className="flex items-center gap-2">
            {clause.risk_level === 'critical' && (
              <span className="w-2 h-2 rounded-full bg-risk-critical pulse-dot" />
            )}
            <span className={cn('px-2 py-0.5 rounded text-xs font-mono font-semibold', riskBadgeClass[clause.risk_level])}>
              {clause.risk_level.toUpperCase()}
            </span>
            <span className="text-sm font-mono text-foreground">{clause.contract_name}</span>
            <span className="text-xs text-muted-foreground font-mono">/ {clause.category}</span>
          </div>
          <p className="text-sm text-muted-foreground">{clause.rationale}</p>
        </div>
      ))}
    </div>
  );
}
