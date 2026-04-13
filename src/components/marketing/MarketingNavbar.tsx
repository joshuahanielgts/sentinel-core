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
    <FloatingNavBar
      leftSlot={<SentinelLogo size="md" linkTo="/" />}
      rightSlot={
        <>
          <ThemeToggle />
          <Link to="/login">
            <Button size="sm" variant="ghost" className="rounded-full px-4 text-xs font-semibold">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="rounded-full ml-1 px-4 text-xs font-semibold btn-glow">
              Get Started
            </Button>
          </Link>
        </>
      }
    />
  );
}
