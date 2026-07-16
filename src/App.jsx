import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { injectGlobalStyles } from "./styles/GlobalStyles";
import { AccessibilityProvider } from "./context/AccessibilityContext"; // <-- Added Import
import DashboardRoutes from "./features/dashboard/routes/DashboardRoutes";
import TeacherRoutes from "./features/teacher/routes/TeacherRoutes"; 
import AdminRoutes from "./features/admin/routes/AdminRoutes"; 
import LandingPage from "./features/landing/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";

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
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("ltsu-theme");

    if (saved) {
      setTheme(saved);
    } else if (
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("ltsu-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    // <-- Wrapped in Accessibility Provider
    <AccessibilityProvider>
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

        {/* Student Dashboard */}
        <Route
          path="/dashboard/*"
          element={<DashboardRoutes />}
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher/*"
          element={<TeacherRoutes />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/*"
          element={<AdminRoutes />}
        />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 24,
          right: 24,
        }}
      />
    </AccessibilityProvider>
  );
}