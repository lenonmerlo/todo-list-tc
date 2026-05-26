import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import "./index.css";
import "./styles/themes.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
