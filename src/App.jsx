import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { injectGlobalStyles } from "./styles/GlobalStyles";
import {
  getResolvedTheme,
  saveThemePreference,
  subscribeToThemeChanges
} from "./features/shared/theme/themePreference";
import { AccessibilityProvider } from "./context/AccessibilityContext"; // <-- Added Import
import DashboardRoutes from "./features/dashboard/routes/DashboardRoutes";
import TeacherRoutes from "./features/teacher/routes/TeacherRoutes"; 
import AdminRoutes from "./features/admin/routes/AdminRoutes"; 
import LandingPage from "./features/landing/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SessionRecoveryNotice from "./features/auth/components/SessionRecoveryNotice";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import PasswordChangePage from "./features/auth/pages/PasswordChangePage";

// Temporary Dashboard Page
function Dashboard() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100vh",
        fontSize: "2rem", 
        fontWeight: "600",
      }}
    >
      Dashboard Coming Soon 🚀
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getResolvedTheme);

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  useEffect(() => subscribeToThemeChanges(setTheme), []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    saveThemePreference(nextTheme);
    setTheme(nextTheme);
  };

  return (
    // <-- Wrapped in Accessibility Provider
    <AccessibilityProvider>
      <SessionRecoveryNotice />
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            <LandingPage
              theme={theme}
              toggleTheme={toggleTheme}
            />
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <LoginPage
              theme={theme}
              toggleTheme={toggleTheme}
            />
          }
        />

        {/* Required password update for provisioned accounts */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute requirePasswordChange>
              <PasswordChangePage theme={theme} />
            </ProtectedRoute>
          }
        />


        {/* Student Dashboard */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRole="STUDENT">
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRole="TEACHER">
              <TeacherRoutes />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global Sonner notifications */}
      <Toaster
        position="top-right"
        theme={theme}
        duration={4200}
        visibleToasts={4}
        gap={12}
        expand={false}
        closeButton={false}
        swipeDirections={["right", "left"]}
        offset={{ top: 24, right: 24 }}
        mobileOffset={{ top: 16, left: 12, right: 12 }}
        toastOptions={{
          className: "ltsu-sonner-toast",
          duration: 4200,
          style: {
            width: "min(340px, calc(100vw - 32px))",
            padding: 0,
            border: 0,
            background: "transparent",
            boxShadow: "none"
          }
        }}
      />
    </AccessibilityProvider>
  );
}