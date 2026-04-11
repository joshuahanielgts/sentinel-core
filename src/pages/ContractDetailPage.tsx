import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContract, useContractClauses, useAnalyzeContract } from '@/hooks/useContracts';
import { RiskGauge } from '@/components/app/RiskGauge';
import { ClauseCard } from '@/components/app/ClauseCard';
import { ChatPanel } from '@/components/app/ChatPanel';
import { AnalysisProgress } from '@/components/app/AnalysisProgress';
import { ContractDetailSkeleton } from '@/components/app/ContractDetailSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, MessageSquare, Loader2, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types/api';

const CLAUSE_FILTERS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'CRITICAL', value: 'critical' },
  { label: 'HIGH', value: 'high' },
  { label: 'MEDIUM', value: 'medium' },
  { label: 'LOW', value: 'low' },
];

export default function ContractDetailPage() {
  const { workspaceId, contractId } = useParams();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useContract(contractId);
  const { data: clauses } = useContractClauses(contractId);
  const analyze = useAnalyzeContract();
  const [chatOpen, setChatOpen] = useState(false);
  const [clauseFilter, setClauseFilter] = useState<RiskLevel | 'all'>('all');

  useEffect(() => {
    if (contract) document.title = `SENTINEL AI | ${contract.name}`;
  }, [contract]);

  const filteredClauses = useMemo(() => {
    if (!clauses) return [];
    if (clauseFilter === 'all') return clauses;
    return clauses.filter((c) => c.risk_level === clauseFilter);
  }, [clauses, clauseFilter]);

  const handleAnalyze = async () => {
    if (!contractId) return;
    try {
      await analyze.mutateAsync(contractId);
      toast.success('Analysis initiated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  if (isLoading) {
    return <ContractDetailSkeleton />;
  }

  if (!contract) {
    return (
      <div className="p-6">
        <div className="glass rounded-lg p-12 text-center">
          <p className="font-mono text-muted-foreground">CONTRACT NOT FOUND</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6', chatOpen && 'mr-96')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <button onClick={() => navigate(`/w/${workspaceId}/contracts`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-mono transition-colors">
            <ArrowLeft className="w-4 h-4" /> BACK TO ARCHIVE
          </button>
          <h1 className="font-mono text-2xl font-bold text-foreground">{contract.name}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{formatDate(contract.created_at)}</span>
            {contract.mime_type && <span className="px-1.5 py-0.5 rounded bg-secondary">{contract.mime_type.includes('pdf') ? 'PDF' : 'DOCX'}</span>}
            {contract.file_size && <span>{formatFileSize(contract.file_size)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contract.status === 'uploaded' && (
            <Button onClick={handleAnalyze} disabled={analyze.isPending} className="btn-glow font-mono">
              {analyze.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              RUN ANALYSIS
            </Button>
          )}
          {contract.status === 'analyzing' && (
            <Button disabled className="font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              ANALYZING...
            </Button>
          )}
          {contract.status === 'complete' && (
            <Button variant="outline" onClick={() => setChatOpen(true)} className="border-cyan text-cyan hover:bg-cyan/10 font-mono">
              <MessageSquare className="w-4 h-4" />
              OPEN INTEL CHAT
            </Button>
          )}
        </div>
      </div>

      {/* Analyzing state */}
      {contract.status === 'analyzing' && <AnalysisProgress active />}

      {/* Error state */}
      {contract.status === 'error' && (
        <div className="glass rounded-lg p-5 border-l-2 border-l-destructive">
          <div className="flex items-center gap-2 text-destructive font-mono text-sm">
            <AlertTriangle className="w-4 h-4" />
            ANALYSIS ERROR
          </div>
          <p className="text-sm text-muted-foreground mt-2">{contract.error_message || 'An error occurred during analysis.'}</p>
        </div>
      )}

      {/* Results */}
      {contract.status === 'complete' && (
        <>
          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk gauge */}
            <div className="glass rounded-lg p-5 glow-card flex items-center justify-center">
              <RiskGauge score={contract.risk_score ?? 0} size={180} />
            </div>

            {/* Summary */}
            <div className="glass rounded-lg p-5 glow-card">
              <h3 className="font-mono text-sm text-muted-foreground mb-3">EXECUTIVE SUMMARY</h3>
              <p className="text-sm text-foreground leading-relaxed">{contract.summary || 'No summary available.'}</p>
            </div>

            {/* Intel */}
            <div className="glass rounded-lg p-5 glow-card space-y-4 max-h-[300px] overflow-y-auto">
              {contract.key_obligations && contract.key_obligations.length > 0 && (
                <div>
                  <h3 className="font-mono text-sm text-muted-foreground mb-2">KEY OBLIGATIONS</h3>
                  <ul className="space-y-1.5">
                    {contract.key_obligations.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {contract.red_flags && contract.red_flags.length > 0 && (
                <div>
                  <h3 className="font-mono text-sm text-muted-foreground mb-2">RED FLAGS</h3>
                  <ul className="space-y-1.5">
                    {contract.red_flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Clauses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-mono text-lg text-foreground">CLAUSE ANALYSIS</h3>
                {clauses && (
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono font-semibold">
                    {clauses.length}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {CLAUSE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setClauseFilter(f.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-mono transition-colors',
                      clauseFilter === f.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredClauses.map((clause) => (
                <ClauseCard key={clause.id} clause={clause} />
              ))}
              {filteredClauses.length === 0 && (
                <div className="glass rounded-lg p-8 text-center">
                  <p className="font-mono text-muted-foreground text-sm">NO CLAUSES MATCH FILTER</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Chat panel */}
      {chatOpen && <ChatPanel contractId={contractId!} onClose={() => setChatOpen(false)} />}
    </div>
  );
}
