import { lazy, Suspense, useEffect } from 'react';
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

const loadIntroPage = () => import("@/pages/IntroPage");
const loadLandingPage = () => import("@/pages/LandingPage");
const loadPricingPage = () => import("@/pages/PricingPage");
const loadAboutPage = () => import("@/pages/AboutPage");
const loadContactPage = () => import("@/pages/ContactPage");
const loadLoginPage = () => import("@/pages/LoginPage");
const loadSignupPage = () => import("@/pages/SignupPage");
const loadWorkspacesPage = () => import("@/pages/WorkspacesPage");
const loadDashboardPage = () => import("@/pages/DashboardPage");
const loadContractsPage = () => import("@/pages/ContractsPage");
const loadContractDetailPage = () => import("@/pages/ContractDetailPage");
const loadSettingsPage = () => import("@/pages/SettingsPage");
const loadChatPage = () => import("@/pages/ChatPage");
const loadNotFoundPage = () => import("@/pages/NotFound");

const IntroPage = lazy(loadIntroPage);
const LandingPage = lazy(loadLandingPage);
const PricingPage = lazy(loadPricingPage);
const AboutPage = lazy(loadAboutPage);
const ContactPage = lazy(loadContactPage);
const LoginPage = lazy(loadLoginPage);
const SignupPage = lazy(loadSignupPage);
const WorkspacesPage = lazy(loadWorkspacesPage);
const DashboardPage = lazy(loadDashboardPage);
const ContractsPage = lazy(loadContractsPage);
const ContractDetailPage = lazy(loadContractDetailPage);
const SettingsPage = lazy(loadSettingsPage);
const ChatPage = lazy(loadChatPage);
const NotFound = lazy(loadNotFoundPage);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnMount: false,
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

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    let attempts = 0;
    const maxAttempts = 20;

    const tryScroll = () => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(tryScroll, 50);
      }
    };

    tryScroll();
  }, [location.pathname, location.hash]);

  return null;
}

function RoutePrefetcher() {
  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;

    if (connection?.saveData || connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadLandingPage();
      void loadLoginPage();
      void loadSignupPage();
      void loadWorkspacesPage();
      void loadChatPage();
    }, 800);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollManager />
      <RoutePrefetcher />
      <Suspense fallback={<PageLoader />}>
        <Routes>
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
            <Route path="chat" element={<ErrorBoundary><ChatPage /></ErrorBoundary>} />
            <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
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
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
