import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RouteGuard } from "@/components/app/RouteGuard";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { AnimatePresence } from 'framer-motion';

const IntroPage = lazy(() => import("@/pages/IntroPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const WorkspacesPage = lazy(() => import("@/pages/WorkspacesPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ContractsPage = lazy(() => import("@/pages/ContractsPage"));
const ContractDetailPage = lazy(() => import("@/pages/ContractDetailPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />} key={location.pathname}>
        <Routes location={location}>
          {/* Public marketing routes */}
          {/* Intro splash */}
          <Route path="/" element={<IntroPage />} />

          <Route element={<MarketingLayout />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Protected routes */}
          <Route path="/workspaces" element={
            <RouteGuard>
              <ErrorBoundary><WorkspacesPage /></ErrorBoundary>
            </RouteGuard>
          } />

          <Route path="/w/:workspaceId" element={
            <RouteGuard>
              <ErrorBoundary><AppLayout /></ErrorBoundary>
            </RouteGuard>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
            <Route path="contracts" element={<ErrorBoundary><ContractsPage /></ErrorBoundary>} />
            <Route path="contracts/:contractId" element={<ErrorBoundary><ContractDetailPage /></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
