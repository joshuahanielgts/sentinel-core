import { useEffect } from 'react'
import { Outlet, useParams, useNavigate, NavLink } from 'react-router-dom'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { useAuth } from '@/contexts/AuthContext'
import { workspacesApi } from '@/api/workspaces'
import {
  Shield,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

export default function AppLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { workspace, setWorkspace } = useWorkspace()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!workspaceId) return
    if (workspace?.id === workspaceId) return

    workspacesApi.get(workspaceId).then(setWorkspace).catch(() => {
      navigate('/workspaces', { replace: true })
    })
  }, [workspaceId, workspace?.id, setWorkspace, navigate])

  if (!workspace || workspace.id !== workspaceId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const navItems = [
    { to: `/w/${workspaceId}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/w/${workspaceId}/contracts`, icon: FileText, label: 'Contracts' },
    { to: `/w/${workspaceId}/settings`, icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r bg-sidebar-background">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Shield className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Sentinel AI</span>
        </div>

        <div className="border-b px-4 py-3">
          <button
            onClick={() => navigate('/workspaces')}
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
          >
            <span className="truncate font-medium">{workspace.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-3 py-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 truncate text-sm">{user?.email}</div>
            <button
              onClick={() => signOut().then(() => navigate('/login'))}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
