import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const DashboardThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const layout = document.querySelector('.d-layout');
    if (layout) {
      layout.classList.toggle('dark-mode', isDark);
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDashboardTheme = () => useContext(ThemeContext);