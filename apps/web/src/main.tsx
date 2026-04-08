import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'
import RouteGuard from '@/components/app/RouteGuard'
import AuthLayout from '@/layouts/AuthLayout'
import AppLayout from '@/layouts/AppLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import WorkspacesPage from '@/pages/WorkspacesPage'
import ContractsPage from '@/pages/ContractsPage'
import ContractDetailPage from '@/pages/ContractDetailPage'
import DashboardPage from '@/pages/DashboardPage'
import SettingsPage from '@/pages/SettingsPage'
import ErrorBoundary from '@/components/app/ErrorBoundary'
import './app.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <ErrorBoundary>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>

                <Route element={<RouteGuard />}>
                  <Route path="/workspaces" element={<WorkspacesPage />} />
                  <Route path="/w/:workspaceId" element={<AppLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                    <Route path="contracts" element={<ErrorBoundary><ContractsPage /></ErrorBoundary>} />
                    <Route path="contracts/:contractId" element={<ErrorBoundary><ContractDetailPage /></ErrorBoundary>} />
                    <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </ErrorBoundary>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
