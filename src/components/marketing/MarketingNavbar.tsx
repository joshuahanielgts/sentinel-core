import { FloatingNavBar } from '@/components/ui/floating-navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { SentinelLogo } from '@/components/app/SentinelLogo';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function MarketingNavbar() {
  const isMobile = useIsMobile();

  // On mobile, the bottom InteractiveMenu handles navigation
  if (isMobile) return null;

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <SentinelLogo size="md" linkTo="/" />
      </div>

      <FloatingNavBar leftSlot={<></>} rightSlot={<></>} />

      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Link to="/login">
          <Button size="sm" variant="ghost" className="rounded-full px-4 text-xs font-semibold">
            Sign In
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm" className="rounded-full px-4 text-xs font-semibold btn-glow">
            Get Started
          </Button>
        </Link>
      </div>
    </>
  );
}
