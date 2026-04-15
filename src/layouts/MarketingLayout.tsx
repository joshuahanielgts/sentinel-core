import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/modern-mobile-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, DollarSign, LogIn } from 'lucide-react';
import { useMemo } from 'react';

const mobileNavItems: (InteractiveMenuItem & { path: string })[] = [
  { label: 'Home', icon: Home, path: '/home' },
  { label: 'Pricing', icon: DollarSign, path: '/pricing' },
  { label: 'Login', icon: LogIn, path: '/login' },
];

export function MarketingLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = useMemo(() => {
    const idx = mobileNavItems.findIndex((item) => item.path === location.pathname);
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  const menuItems: InteractiveMenuItem[] = useMemo(
    () =>
      mobileNavItems.map((item) => ({
        label: item.label,
        icon: item.icon,
        onClick: () => navigate(item.path),
      })),
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background grid-bg scanlines">
      <MarketingNavbar />
      <main className={isMobile ? 'pb-20' : ''}>
        <Outlet />
      </main>
      <MarketingFooter />

      {/* Mobile bottom nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2">
          <InteractiveMenu
            items={menuItems}
            activeIndex={activeIndex}
            accentColor="hsl(var(--primary))"
          />
        </div>
      )}
    </div>
  );
}
