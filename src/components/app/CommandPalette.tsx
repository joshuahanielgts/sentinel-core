import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useContracts } from '@/hooks/useContracts';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { workspace } = useWorkspaceContext();
  const { data: contracts } = useContracts(workspace?.id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = contracts?.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  const handleSelect = (contractId: string) => {
    if (workspace) {
      navigate(`/w/${workspace.id}/contracts/${contractId}`);
    }
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass border-border sm:max-w-lg p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search contracts</DialogTitle>
          <DialogDescription>Use the command palette to search and open contracts.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search contracts..."
            className="border-0 focus-visible:ring-0 bg-transparent font-mono text-sm"
            autoFocus
          />
          <kbd className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground font-mono py-6">NO RESULTS</p>
          ) : (
            filtered.map((contract, i) => (
              <button
                key={contract.id}
                onClick={() => handleSelect(contract.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm font-mono transition-colors ${
                  i === selectedIndex ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-secondary'
                }`}
              >
                {contract.name}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
