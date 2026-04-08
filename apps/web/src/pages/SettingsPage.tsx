import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspaceMembers, useAddMember, useRemoveMember } from '@/hooks/useWorkspaces'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { workspace } = useWorkspace()
  const { user } = useAuth()
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId!)
  const addMember = useAddMember(workspaceId!)
  const removeMember = useRemoveMember(workspaceId!)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [error, setError] = useState('')

  const currentRole = workspace?.role

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await addMember.mutateAsync({ email, role })
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-sm font-bold uppercase tracking-widest text-primary glow-text-blue">
        Settings
      </h1>

      <div className="max-w-2xl space-y-6">
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
              Workspace
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              Workspace details and configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</Label>
              <p className="text-sm font-medium text-foreground">{workspace?.name}</p>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Slug</Label>
              <p className="text-sm font-medium text-foreground">/{workspace?.slug}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">
              Members
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">
              Manage workspace operators and access levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(currentRole === 'owner' || currentRole === 'admin') && (
              <>
                <form onSubmit={handleInvite} className="mb-4 flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 border-border/50 bg-accent/30 text-xs"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                    className="rounded-md border border-border/50 bg-accent/30 px-3 text-xs text-foreground"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit" disabled={addMember.isPending} className="text-xs">
                    <UserPlus className="mr-1 h-3.5 w-3.5" />
                    {addMember.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </form>
                {error && (
                  <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {error}
                  </div>
                )}
                <Separator className="mb-4 bg-border/30" />
              </>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-accent/30" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md border border-border/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-accent text-[10px] font-bold text-primary">
                        {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">
                          {member.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{member.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {member.role}
                      </span>
                      {(currentRole === 'owner' || currentRole === 'admin') &&
                        member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeMember.mutate(member.user_id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
