import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { PageTransition } from '@/components/app/PageTransition';

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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex items-center gap-3">
        <Shield className="w-10 h-10 text-primary" />
        <span className="font-mono text-2xl font-bold text-foreground tracking-wider">SENTINEL AI</span>
      </div>
      <PageTransition><Outlet /></PageTransition>
    </div>
  );
}
