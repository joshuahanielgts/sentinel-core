import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspaces';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { WorkspaceRole } from '@/types/api';
import { cn } from '@/lib/utils';

const roleBadge: Record<WorkspaceRole, string> = {
  owner: 'bg-primary/20 text-primary',
  admin: 'bg-cyan/20 text-cyan',
  member: 'bg-secondary text-muted-foreground',
};

export default function WorkspacesPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const { setWorkspace } = useWorkspaceContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) return;
    try {
      const ws = await createWorkspace.mutateAsync({ name: name.trim(), slug: slug.trim() });
      setWorkspace(ws);
      navigate(`/w/${ws.id}/dashboard`);
      setShowCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create workspace');
    }
  };

  const handleSelect = (ws: typeof workspaces extends (infer T)[] | undefined ? T : never) => {
    setWorkspace(ws);
    navigate(`/w/${ws.id}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background grid-bg scanlines p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-mono text-2xl font-bold text-foreground tracking-wider">SELECT WORKSPACE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowCreate(true)} className="font-mono text-sm border-cyan text-cyan hover:bg-cyan/10">
              <Plus className="w-4 h-4" />
              NEW WORKSPACE
            </Button>
            <Button variant="ghost" onClick={() => signOut()} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-cyber rounded-lg h-24" />
            ))}
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="glass rounded-lg p-12 text-center">
            <p className="font-mono text-muted-foreground">NO WORKSPACES DETECTED — INITIALIZE FIRST WORKSPACE</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces?.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSelect(ws)}
                className="glow-card rounded-lg bg-card p-5 text-left group hover:border-l-2 hover:border-l-primary transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                    {ws.name}
                  </h3>
                  {ws.role && (
                    <span className={cn('px-2 py-0.5 rounded text-xs font-mono font-semibold', roleBadge[ws.role])}>
                      {ws.role.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-mono mt-1">/{ws.slug}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground">INITIALIZE WORKSPACE</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">WORKSPACE NAME</Label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="My Organization" className="bg-background font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">SLUG</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-organization" className="bg-background font-mono text-sm" />
            </div>
            <Button onClick={handleCreate} disabled={createWorkspace.isPending || !name.trim()} className="w-full btn-glow font-mono">
              CREATE WORKSPACE
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
