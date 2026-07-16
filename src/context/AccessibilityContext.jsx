import React, { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("accessibility");
      return saved
        ? JSON.parse(saved)
        : { highContrast: false, largeText: false, reduceMotion: false };
    } catch (e) {
      return { highContrast: false, largeText: false, reduceMotion: false };
    }
  });

  // Apply classes to the layout dynamically
  useEffect(() => {
    const layout = document.querySelector(".d-layout");
    if (layout) {
      layout.classList.toggle("high-contrast", settings.highContrast);
      layout.classList.toggle("large-text", settings.largeText);
      layout.classList.toggle("reduce-motion", settings.reduceMotion);
    }
  }, [settings]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("accessibility", JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <AccessibilityContext.Provider value={{ ...settings, toggle }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
