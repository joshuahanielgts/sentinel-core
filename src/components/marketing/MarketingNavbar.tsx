import { FloatingNavBar } from '@/components/ui/floating-navbar';
import { useIsMobile } from '@/hooks/use-mobile';

export function MarketingNavbar() {
  const isMobile = useIsMobile();

  // On mobile, the bottom InteractiveMenu handles navigation
  if (isMobile) return null;

  return <FloatingNavBar />;
}
