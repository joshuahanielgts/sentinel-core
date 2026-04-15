import { Outlet, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { PageTransition } from '@/components/app/PageTransition';
import { LayoutDashboard, FileText, Settings, LogOut, ChevronDown, Menu, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { SentinelLogo } from '@/components/app/SentinelLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useEffect, useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CommandPalette } from '@/components/app/CommandPalette';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/modern-mobile-menu';

interface SidebarNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  absolute?: boolean;
  isActive?: (pathname: string) => boolean;
}

const baseNavItems: SidebarNavItem[] = [
  {
    label: 'Dashboard',
    path: 'dashboard',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname.includes('/dashboard'),
  },
  {
    label: 'Contracts',
    path: 'contracts',
    icon: FileText,
    isActive: (pathname) => /\/contracts\/?$/.test(pathname),
  },
  {
    label: 'AI Chat',
    path: 'chat',
    icon: MessageSquare,
    isActive: (pathname) => pathname.includes('/chat'),
  },
  {
    label: 'Settings',
    path: 'settings',
    icon: Settings,
    isActive: (pathname) => pathname.includes('/settings'),
  },
];

function SidebarContent({ workspaceId, workspace, workspaces, location, navItems, onNavigate, user, onSignOut }: {
  workspaceId: string | undefined;
  workspace: any;
  workspaces: any[] | undefined;
  location: any;
  navItems: SidebarNavItem[];
  onNavigate: (path: string) => void;
  user: any;
  onSignOut: () => void;
}) {
  const handleWorkspaceSwitch = (wsId: string) => {
    const current = location.pathname.split('/').slice(3).join('/');
    onNavigate(`/w/${wsId}/${current || 'dashboard'}`);
  };

  return (
    <>
      {/* Branding */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SentinelLogo size="md" linkTo="/workspaces" />
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">v1.0</span>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="p-3 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary text-sm font-mono text-foreground transition-colors">
            <span className="truncate">{workspace?.name || 'Select Workspace'}</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {workspaces?.map((ws) => (
              <DropdownMenuItem key={ws.id} onClick={() => handleWorkspaceSwitch(ws.id)} className="font-mono text-sm">
                {ws.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => onNavigate('/workspaces')} className="font-mono text-sm text-muted-foreground">
              Manage Workspaces...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, path, icon: Icon, absolute, isActive: isActiveMatcher }) => {
          const isActive = isActiveMatcher
            ? isActiveMatcher(location.pathname)
            : location.pathname.includes(absolute ? path : `/${path}`);
          return (
            <Link
              key={path}
              to={absolute ? path : `/w/${workspaceId}/${path}`}
              onClick={() => onNavigate('')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-mono transition-all',
                isActive
                  ? 'nav-active text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground truncate flex-1">
            {user?.email}
          </span>
          <button onClick={onSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { workspace, setWorkspace } = useWorkspaceContext();
  const { workspaceId, contractId } = useParams();
  const { data: workspaces } = useWorkspaces();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (workspaceId && workspaces) {
      const ws = workspaces.find((w) => w.id === workspaceId);
      if (ws && ws.id !== workspace?.id) setWorkspace(ws);
    }
  }, [workspaceId, workspaces]);

  const navItems = useMemo(() => {
    const items = [...baseNavItems];

    if (contractId) {
      items.splice(2, 0, {
        label: 'Contract Detail',
        path: `contracts/${contractId}`,
        icon: FileText,
        isActive: (pathname) => pathname.includes(`/contracts/${contractId}`),
      });
    }

    return items;
  }, [contractId]);

  const handleNavigate = (path: string) => {
    setMobileOpen(false);
    if (path) navigate(path);
  };

  const appNavItems = useMemo(() => {
    const base = `/w/${workspaceId}`;
    return navItems.map((item) => ({
      label: item.label,
      icon: item.icon,
      onClick: () => navigate(`${base}/${item.path}`),
    })) as InteractiveMenuItem[];
  }, [workspaceId, navigate, navItems]);

  const appActiveIndex = useMemo(() => {
    const idx = navItems.findIndex((item) => {
      if (item.isActive) return item.isActive(location.pathname);
      return location.pathname.includes(item.absolute ? item.path : `/${item.path}`);
    });
    return idx >= 0 ? idx : 0;
  }, [location.pathname, navItems]);

  return (
    <div className="flex min-h-screen bg-background scanlines">
      <CommandPalette />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 bg-card/95 backdrop-blur border-r border-border flex flex-col shrink-0 fixed top-0 left-0 bottom-0 z-40">
          <SidebarContent
            workspaceId={workspaceId}
            workspace={workspace}
            workspaces={workspaces}
            location={location}
            navItems={navItems}
            onNavigate={handleNavigate}
            user={user}
            onSignOut={() => signOut()}
          />
        </aside>
      )}

      {/* Mobile Sheet (still accessible via header hamburger for workspace switcher etc.) */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-card/95 backdrop-blur border-r border-border flex flex-col">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent
              workspaceId={workspaceId}
              workspace={workspace}
              workspaces={workspaces}
              location={location}
              navItems={navItems}
              onNavigate={handleNavigate}
              user={user}
              onSignOut={() => signOut()}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <main className={cn("flex-1 min-h-screen bg-background grid-bg overflow-auto", !isMobile && "ml-64")}>
        {!isMobile && (
          <header className="sticky top-0 z-30 flex items-center justify-end px-4 py-3 bg-card/95 backdrop-blur border-b border-border">
            <ThemeToggle />
          </header>
        )}

        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-card/95 backdrop-blur border-b border-border">
            <button onClick={() => setMobileOpen(true)} className="text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <SentinelLogo size="sm" linkTo="/workspaces" />
            <ThemeToggle className="ml-auto" />
          </header>
        )}
        <div className={isMobile ? 'pb-20' : ''}>
          <PageTransition><Outlet /></PageTransition>
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2">
          <InteractiveMenu
            items={appNavItems}
            activeIndex={appActiveIndex}
            accentColor="hsl(var(--primary))"
          />
        </div>
      )}
    </div>
  );
}
