import { useTheme } from "../contexts/useTheme";
import "./ThemeSwitcher.css";

function ThemeSwitcher({ className = "", compact = false }) {
  const { theme, setTheme, themes } = useTheme();
  const rootClassName = compact
    ? `theme-switcher theme-switcher-compact ${className}`.trim()
    : `theme-switcher ${className}`.trim();

  return (
    <div className={rootClassName} aria-label="Seletor de tema">
      <span className="theme-switcher-label">Tema</span>
      <div className="theme-switcher-options" role="tablist" aria-label="Temas">
        {themes.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={theme === item.id}
            onClick={() => setTheme(item.id)}
            className={`theme-switcher-button ${theme === item.id ? "active" : ""}`}
            title={item.description}
          >
            <span aria-hidden="true">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
