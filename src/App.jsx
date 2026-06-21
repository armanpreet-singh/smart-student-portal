import { useState, useEffect } from "react";
import { injectGlobalStyles } from "./styles/GlobalStyles";

import LandingPage from "./features/landing/LandingPage";

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
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "ltsu-theme",
      theme
    );
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) =>
      t === "light" ? "dark" : "light"
    );

  return (
    <LandingPage
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}