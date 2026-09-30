import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { EnvironmentProvider } from './context/EnvironmentContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Universities } from './pages/Universities';
import { UniversityDetail } from './pages/UniversityDetail';
import { LiveReleases } from './pages/LiveReleases';
import { ReleaseDetail } from './pages/ReleaseDetail';
import { Features } from './pages/Features';
import { FeatureDetail } from './pages/FeatureDetail';
import { BugTickets } from './pages/BugTickets';
import { SanityReports } from './pages/SanityReports';
import { LeadTracking } from './pages/LeadTracking';
import { CalendarPage } from './pages/CalendarPage';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-brand-primary">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <EnvironmentProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Application Layout Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="universities" element={<Universities />} />
                    <Route path="universities/:id" element={<UniversityDetail />} />
                    <Route path="releases" element={<LiveReleases />} />
                    <Route path="releases/:id" element={<ReleaseDetail />} />
                    <Route path="features" element={<Features />} />
                    <Route path="features/:id" element={<FeatureDetail />} />
                    <Route path="bug-tickets" element={<BugTickets />} />
                    <Route path="sanity-reports" element={<SanityReports />} />
                    <Route path="leads" element={<LeadTracking />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Fallback Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </EnvironmentProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
