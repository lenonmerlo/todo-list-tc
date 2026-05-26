import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./useTheme";

const THEME_STORAGE_KEY = "app_theme";

const THEMES = [
  {
    id: "kawaii",
    label: "Kawaii",
    emoji: "🌸",
    description: "Fofo e colorido",
  },
  {
    id: "classic",
    label: "Classico",
    emoji: "🧭",
    description: "Sobrio e profissional",
  },
  {
    id: "energy",
    label: "Energia",
    emoji: "⚡",
    description: "Dinamico e marcante",
  },
];

function resolveInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const hasSavedTheme = THEMES.some((item) => item.id === savedTheme);
  return hasSavedTheme ? savedTheme : "kawaii";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: THEMES,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
