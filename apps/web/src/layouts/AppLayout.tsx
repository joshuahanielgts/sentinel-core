import { useEffect, useState, useCallback } from 'react'
import { Outlet, useParams, useNavigate, NavLink } from 'react-router-dom'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { workspacesApi } from '@/api/workspaces'
import CommandPalette from '@/components/app/CommandPalette'
import {
  Shield,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Search,
} from 'lucide-react'

export default function AppLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { workspace, setWorkspace } = useWorkspace()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    if (workspace?.id === workspaceId) return

    workspacesApi.get(workspaceId).then(setWorkspace).catch(() => {
      navigate('/workspaces', { replace: true })
    })
  }, [workspaceId, workspace?.id, setWorkspace, navigate])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(true)
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      e.preventDefault()
      setCommandOpen(true)
    }
    if (!e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = (e.target as HTMLElement).tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

      if (e.key === 'u' || e.key === 'U') navigate(`/w/${workspaceId}/contracts`)
      if (e.key === 'a' || e.key === 'A') navigate(`/w/${workspaceId}/dashboard`)
    }
  }, [navigate, workspaceId])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!workspace || workspace.id !== workspaceId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background cyber-grid">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Initializing...</span>
        </div>
      </div>
    )
  }

  const navItems = [
    { to: `/w/${workspaceId}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/w/${workspaceId}/contracts`, icon: FileText, label: 'Contracts' },
    { to: `/w/${workspaceId}/settings`, icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-60 flex-col border-r border-border/50 bg-sidebar-background scanline">
        <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-wider text-primary glow-text-blue">
            SENTINEL
          </span>
        </div>

        <div className="border-b border-border/50 px-3 py-2.5">
          <button
            onClick={() => navigate('/workspaces')}
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-accent/50 transition-colors"
          >
            <span className="truncate font-medium text-foreground">{workspace.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex w-full items-center gap-2 rounded-md border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Search className="h-3 w-3" />
            <span>Search</span>
            <kbd className="ml-auto rounded border border-border bg-accent px-1 py-0.5 text-[9px] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-xs transition-all ${
                  isActive
                    ? 'bg-accent/50 font-semibold text-primary glow-blue-sm'
                    : 'text-sidebar-foreground hover:bg-accent/30 hover:text-foreground'
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/50 px-3 py-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-accent text-[10px] font-bold text-primary">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11px] text-foreground">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut().then(() => navigate('/login'))}
              className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto cyber-grid">
        <Outlet />
      </main>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
