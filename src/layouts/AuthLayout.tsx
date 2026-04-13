import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { PageTransition } from '@/components/app/PageTransition';
import { SentinelLogo } from '@/components/app/SentinelLogo';

export function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background grid-bg">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/workspaces" replace />;
  }

  return (
    <div className="min-h-screen bg-background grid-bg scanlines flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex justify-center">
        <SentinelLogo size="lg" linkTo="/" />
      </div>
      <PageTransition><Outlet /></PageTransition>
    </div>
  );
}
