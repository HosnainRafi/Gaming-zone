import { type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import GamesPage from "./pages/GamesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import OffersPage from "./pages/OffersPage";
import PricingPage from "./pages/PricingPage";
import ReportsPage from "./pages/ReportsPage";
import SessionsPage from "./pages/SessionsPage";
import SettingsPage from "./pages/SettingsPage";
import StaffPage from "./pages/StaffPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === "ADMIN" ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SocketProvider>
        <Layout>{children}</Layout>
      </SocketProvider>
    </RequireAuth>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/games" element={<GamesPage />} />
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedLayout>
            <DevicesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedLayout>
            <MembersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedLayout>
            <SessionsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/offers"
        element={
          <ProtectedLayout>
            <OffersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <ReportsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedLayout>
            <RequireAdmin>
              <StaffPage />
            </RequireAdmin>
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <RequireAdmin>
              <SettingsPage />
            </RequireAdmin>
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <AppRoutes />
          </SiteSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
