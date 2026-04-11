import type { ContractClause, RiskLevel } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClauseCardProps {
  clause: ContractClause;
}

const riskStyles: Record<RiskLevel, { border: string; badge: string }> = {
  low: { border: 'risk-border-low', badge: 'bg-risk-low/20 text-risk-low' },
  medium: { border: 'risk-border-medium', badge: 'bg-risk-medium/20 text-risk-medium' },
  high: { border: 'risk-border-high', badge: 'bg-risk-high/20 text-risk-high' },
  critical: { border: 'risk-border-critical', badge: 'bg-risk-critical/20 text-risk-critical' },
};

export function ClauseCard({ clause }: ClauseCardProps) {
  const styles = riskStyles[clause.risk_level];

  return (
    <div
      className={cn(
        'rounded-lg bg-card border border-border p-4 border-l-2 space-y-3',
        styles.border,
        clause.risk_level === 'critical' && 'pulse-critical'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-xs font-mono font-semibold', styles.badge)}>
            {clause.risk_level.toUpperCase()}
          </span>
          <span className="font-mono text-sm text-cyan">{clause.category}</span>
        </div>
        {clause.position !== null && (
          <span className="text-xs text-muted-foreground font-mono">§{clause.position}</span>
        )}
      </div>

      <div className="max-h-[120px] overflow-y-auto rounded bg-background/50 p-3 border border-border">
        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
          {clause.raw_text}
        </pre>
      </div>

      <p className="text-sm text-muted-foreground italic">{clause.rationale}</p>
    </div>
  );
}
