import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaces, useCreateWorkspace } from '@/hooks/useWorkspaces'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Shield, Plus, LogOut, Briefcase } from 'lucide-react'

export default function WorkspacesPage() {
  const { data: workspaces, isLoading } = useWorkspaces()
  const createWorkspace = useCreateWorkspace()
  const { setWorkspace } = useWorkspace()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  function handleSelect(ws: NonNullable<typeof workspaces>[0]) {
    setWorkspace(ws)
    navigate(`/w/${ws.id}/dashboard`)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const ws = await createWorkspace.mutateAsync({ name, slug })
    setOpen(false)
    setName('')
    setSlug('')
    setWorkspace(ws)
    navigate(`/w/${ws.id}/dashboard`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background cyber-grid scanline px-4 py-12">
      <div className="mb-6 flex items-center gap-2.5">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold tracking-widest text-primary glow-text-blue">SENTINEL</span>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <span className="text-xs text-muted-foreground">{user?.email}</span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-destructive"
          onClick={() => signOut().then(() => navigate('/login'))}
        >
          <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">Workspaces</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" /> New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border/50 bg-card">
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle className="text-primary text-sm">Create Workspace</DialogTitle>
                  <DialogDescription className="text-xs">
                    Create a secure workspace to organize your contracts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name" className="text-xs">Name</Label>
                    <Input
                      id="ws-name"
                      placeholder="My Company"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                      }}
                      required
                      className="border-border/50 bg-accent/30 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-slug" className="text-xs">Slug</Label>
                    <Input
                      id="ws-slug"
                      placeholder="my-company"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      required
                      className="border-border/50 bg-accent/30 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createWorkspace.isPending} className="text-xs">
                    {createWorkspace.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg border border-border/30 bg-card" />
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="cursor-pointer rounded-lg border border-border/50 bg-card p-4 transition-all holo-hover"
                onClick={() => handleSelect(ws)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-accent/50">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ws.name}</p>
                      <p className="text-[10px] text-muted-foreground">/{ws.slug}</p>
                    </div>
                  </div>
                  <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {ws.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-primary/20" />
            <p className="mb-1 text-sm font-medium">No workspaces yet</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Create your first workspace to begin analysis.
            </p>
            <Button onClick={() => setOpen(true)} className="text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" /> Create Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
