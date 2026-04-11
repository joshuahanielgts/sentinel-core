import { useNavigate } from 'react-router-dom';
import type { Contract, RiskLevel } from '@/types/api';
import { FileText, Clock, CheckCircle, Shield, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, formatDate } from '@/lib/utils';

interface ContractCardProps {
  contract: Contract;
  workspaceId: string;
}

function getRiskLevel(score: number | null): RiskLevel | null {
  if (score === null) return null;
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

const riskColors: Record<RiskLevel, string> = {
  low: 'text-risk-low',
  medium: 'text-risk-medium',
  high: 'text-risk-high',
  critical: 'text-risk-critical',
};

const statusConfig = {
  pending: { icon: Clock, label: 'PENDING', className: 'bg-muted text-muted-foreground' },
  uploaded: { icon: CheckCircle, label: 'UPLOADED', className: 'bg-primary/20 text-primary' },
  analyzing: { icon: Loader2, label: 'SCANNING...', className: 'bg-cyan/20 text-cyan' },
  complete: { icon: Shield, label: 'COMPLETE', className: 'bg-risk-low/20 text-risk-low' },
  error: { icon: XCircle, label: 'ERROR', className: 'bg-destructive/20 text-destructive' },
};

export function ContractCard({ contract, workspaceId }: ContractCardProps) {
  const navigate = useNavigate();
  const riskLevel = getRiskLevel(contract.risk_score);
  const status = statusConfig[contract.status];
  const StatusIcon = status.icon;

  return (
    <div
      onClick={() => navigate(`/w/${workspaceId}/contracts/${contract.id}`)}
      className="glow-card rounded-lg bg-card p-4 cursor-pointer flex items-center gap-4"
    >
      <FileText className={cn('w-8 h-8 shrink-0', riskLevel ? riskColors[riskLevel] : 'text-muted-foreground')} />

      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-mono font-semibold text-foreground truncate">{contract.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{formatDate(contract.created_at)}</span>
          {contract.mime_type && (
            <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono">
              {contract.mime_type.includes('pdf') ? 'PDF' : 'DOCX'}
            </span>
          )}
          {contract.file_size && (
            <span className="font-mono">{formatFileSize(contract.file_size)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono font-semibold', status.className)}>
          <StatusIcon className={cn('w-3 h-3', contract.status === 'analyzing' && 'spin-slow')} />
          {status.label}
        </span>

        {contract.risk_score !== null && riskLevel && (
          <span className={cn('font-mono font-bold text-lg', riskColors[riskLevel])}>
            {contract.risk_score}
          </span>
        )}
      </div>
    </div>
  );
}
