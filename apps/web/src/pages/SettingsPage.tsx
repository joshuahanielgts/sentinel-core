import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkspaceMembers, useAddMember, useRemoveMember } from '@/hooks/useWorkspaces'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Workspace details and configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{workspace?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Slug</Label>
              <p className="font-medium">/{workspace?.slug}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage workspace members and their roles.</CardDescription>
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
                    className="flex-1"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                    className="rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit" disabled={addMember.isPending}>
                    <UserPlus className="mr-1 h-4 w-4" />
                    {addMember.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </form>
                {error && (
                  <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <Separator className="mb-4" />
              </>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      {(currentRole === 'owner' || currentRole === 'admin') &&
                        member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeMember.mutate(member.user_id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
