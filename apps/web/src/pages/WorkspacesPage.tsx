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
import { Badge } from '@/components/ui/badge'
import { Shield, Plus, LogOut } from 'lucide-react'

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
    <div className="flex min-h-screen flex-col items-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">Sentinel AI</span>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut().then(() => navigate('/login'))}
        >
          <LogOut className="mr-1 h-4 w-4" /> Sign out
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Your Workspaces</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" /> New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your contracts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name">Name</Label>
                    <Input
                      id="ws-name"
                      placeholder="My Company"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ws-slug">Slug</Label>
                    <Input
                      id="ws-slug"
                      placeholder="my-company"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createWorkspace.isPending}>
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
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <Card
                key={ws.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => handleSelect(ws)}
              >
                <CardHeader className="flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-base">{ws.name}</CardTitle>
                    <CardDescription className="text-xs">/{ws.slug}</CardDescription>
                  </div>
                  <Badge variant="secondary">{ws.role}</Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <p className="mb-2 text-muted-foreground">No workspaces yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first workspace to get started.
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Create Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
