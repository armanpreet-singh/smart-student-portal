import { createContext, useContext, useEffect, useState } from "react";
import {
  getResolvedTheme,
  saveThemePreference,
  subscribeToThemeChanges
} from "../../shared/theme/themePreference";

const ThemeContext = createContext();

export const DashboardThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => getResolvedTheme() === "dark");

  useEffect(() => subscribeToThemeChanges((theme) => {
    setIsDark(theme === "dark");
  }), []);

  useEffect(() => {
    const layout = document.querySelector(".d-layout");
    if (layout) {
      layout.classList.toggle("dark-mode", isDark);
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    saveThemePreference(nextTheme);
    setIsDark(nextTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDashboardTheme = () => useContext(ThemeContext);
