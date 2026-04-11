import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { useWorkspaceMembers, useAddMember, useRemoveMember } from '@/hooks/useWorkspaces';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Shield, User, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkspaceRole } from '@/types/api';
import { cn } from '@/lib/utils';

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'member']),
});

type InviteForm = z.infer<typeof inviteSchema>;

const roleIcons: Record<WorkspaceRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleBadge: Record<WorkspaceRole, string> = {
  owner: 'bg-primary/20 text-primary',
  admin: 'bg-cyan/20 text-cyan',
  member: 'bg-secondary text-muted-foreground',
};

export default function SettingsPage() {
  const { workspaceId } = useParams();
  const { workspace } = useWorkspaceContext();
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  useEffect(() => {
    document.title = 'SENTINEL AI | Settings';
  }, []);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  });

  const onInvite = async (data: InviteForm) => {
    if (!workspaceId) return;
    try {
      await addMember.mutateAsync({ workspaceId, email: data.email, role: data.role });
      toast.success('Member added');
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!workspaceId) return;
    try {
      await removeMember.mutateAsync({ workspaceId, memberId });
      toast.success('Member removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="font-mono text-2xl font-bold text-foreground">WORKSPACE CONFIGURATION</h1>

      {/* Workspace info */}
      <div className="glass rounded-lg p-5 glow-card space-y-3">
        <h3 className="font-mono text-sm text-muted-foreground">WORKSPACE INFO</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-mono text-xs text-muted-foreground">NAME</Label>
            <p className="font-mono text-foreground">{workspace?.name}</p>
          </div>
          <div>
            <Label className="font-mono text-xs text-muted-foreground">SLUG</Label>
            <p className="font-mono text-cyan">/{workspace?.slug}</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="glass rounded-lg p-5 glow-card space-y-4">
        <h3 className="font-mono text-sm text-muted-foreground">OPERATORS</h3>

        {/* Invite form */}
        <form onSubmit={handleSubmit(onInvite)} className="flex gap-2">
          <div className="flex-1">
            <Input {...register('email')} placeholder="operator@email.com" className="bg-background font-mono text-sm" />
            {errors.email && <p className="text-xs text-destructive font-mono mt-1">{errors.email.message}</p>}
          </div>
          <Select defaultValue="member" onValueChange={(val) => setValue('role', val as 'admin' | 'member')}>
            <SelectTrigger className="w-32 font-mono text-sm bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin" className="font-mono">ADMIN</SelectItem>
              <SelectItem value="member" className="font-mono">MEMBER</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={addMember.isPending} className="btn-glow font-mono shrink-0">
            {addMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            ADD OPERATOR
          </Button>
        </form>

        {/* Members list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="skeleton-cyber h-12 rounded" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {members?.map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-mono font-bold text-sm">
                    {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-foreground truncate">
                      {member.profiles?.full_name || member.user_id.slice(0, 8)}
                    </p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold', roleBadge[member.role])}>
                    <RoleIcon className="w-3 h-3" />
                    {member.role.toUpperCase()}
                  </span>
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
