import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContracts } from '@/hooks/useContracts';
import { ContractCard } from '@/components/app/ContractCard';
import { UploadDialog } from '@/components/app/UploadDialog';
import { ContractsSkeleton } from '@/components/app/ContractsSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import type { ContractStatus } from '@/types/api';
import { cn } from '@/lib/utils';

const STATUS_FILTERS: { label: string; value: ContractStatus | 'all' }[] = [
  { label: 'ALL', value: 'all' },
  { label: 'PENDING', value: 'pending' },
  { label: 'ANALYZING', value: 'analyzing' },
  { label: 'COMPLETE', value: 'complete' },
  { label: 'ERROR', value: 'error' },
];

export default function ContractsPage() {
  const { workspaceId } = useParams();
  const { data: contracts, isLoading } = useContracts(workspaceId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    document.title = 'SENTINEL AI | Contracts';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'u' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        setShowUpload(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!contracts) return [];
    return contracts.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [contracts, search, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-foreground">CONTRACT ARCHIVE</h1>
          {contracts && (
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono font-semibold">
              {contracts.length}
            </span>
          )}
        </div>
        <Button onClick={() => setShowUpload(true)} className="btn-glow font-mono">
          <Upload className="w-4 h-4" />
          UPLOAD CONTRACT
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts..."
            className="pl-10 bg-card font-mono text-sm"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-3 py-2 rounded-md text-xs font-mono transition-colors',
                statusFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contract list */}
      {isLoading ? (
        <ContractsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="glass rounded-lg p-12 text-center">
          <p className="font-mono text-muted-foreground">NO CONTRACTS DETECTED IN THIS WORKSPACE</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((contract) => (
            <ContractCard key={contract.id} contract={contract} workspaceId={workspaceId!} />
          ))}
        </div>
      )}

      <UploadDialog open={showUpload} onOpenChange={setShowUpload} workspaceId={workspaceId!} />
    </div>
  );
}
