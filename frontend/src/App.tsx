import { AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { Layout } from "./components/layout/Layout";
import { PageTransition, ScrollProgress } from "./components/motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import AboutUsPage from "./pages/AboutUsPage";
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

function AnimatedRoutes() {
  const location = useLocation();
  const { token } = useAuth();
  const isPublicRoute = ["/", "/pricing", "/games", "/about"].includes(
    location.pathname,
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/pricing"
          element={
            <PageTransition>
              <PricingPage />
            </PageTransition>
          }
        />
        <Route
          path="/games"
          element={
            <PageTransition>
              <GamesPage />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <AboutUsPage />
            </PageTransition>
          }
        />
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
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <AnimatedRoutes />
          </SiteSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
