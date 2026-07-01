import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { injectGlobalStyles } from "./styles/GlobalStyles";

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
  <>
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

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
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
  </>
);
}