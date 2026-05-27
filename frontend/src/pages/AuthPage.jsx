import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiStar from "../assets/kawaii-star.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
import FormField from "../components/FormField";
import SegmentedControl from "../components/SegmentedControl";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useAuth } from "../contexts/useAuth";
import "./AuthPage.css";

const initialForm = {
  username: "",
  email: "",
  password: "",
};

const modeOptions = [
  { value: "login", label: "Login" },
  { value: "register", label: "Cadastro" },
];

function extractApiErrorMessage(error, isRegisterMode) {
  const fallbackMessage = isRegisterMode
    ? "Não foi possível criar a conta. Verifique os dados informados."
    : "Não foi possível entrar. Verifique usuário e senha.";

  const data = error?.response?.data;

  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  const fieldMessages = Object.values(data)
    .flatMap((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return [value];
      }

      return [];
    })
    .filter(Boolean);

  if (fieldMessages.length > 0) {
    return fieldMessages.join(" ");
  }

  return fallbackMessage;
}

function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";

  function updateField(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(form);
      } else {
        await login({
          username: form.username,
          password: form.password,
        });
      }

      setForm(initialForm);
    } catch (errorResponse) {
      setError(extractApiErrorMessage(errorResponse, isRegisterMode));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <img
        className="auth-deco auth-deco-star"
        src={kawaiiStar}
        alt=""
        aria-hidden="true"
      />
      <img
        className="auth-deco auth-deco-cloud"
        src={kawaiiCloud}
        alt=""
        aria-hidden="true"
      />
      <img
        className="auth-deco auth-deco-sun"
        src={kawaiiSun}
        alt=""
        aria-hidden="true"
      />
      <img
        className="auth-deco auth-deco-moon"
        src={kawaiiMoon}
        alt=""
        aria-hidden="true"
      />
      <section className="auth-layout">
        <div className="auth-hero">
          <span className="auth-badge">Seu cantinho de organização</span>
          <h1 className="auth-title">
            Planeje seu dia com leveza, carinho e cor.
          </h1>
          <p className="auth-subtitle">
            Entre para cuidar da sua rotina sem estresse. Crie listas, marque
            conquistas e acompanhe tudo de um jeito simples e gostoso de usar.
          </p>
          <ul className="auth-highlights" aria-label="Benefícios principais">
            <li>Organize suas tarefas por categorias com poucos cliques</li>
            <li>Compartilhe atividades com quem faz parte da rotina</li>
            <li>Encontre tudo rapidinho com busca e filtros inteligentes</li>
          </ul>
          <p className="auth-tip">Dica: comece com 3 prioridades do dia.</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <span className="auth-card-kicker">
              {isRegisterMode ? "Criar conta" : "Acessar conta"}
            </span>
            <h2 className="auth-card-title">
              {isRegisterMode ? "Cadastro" : "Login"}
            </h2>
          </div>

          <div className="auth-form">
            <SegmentedControl
              label="Modo do formulário"
              value={mode}
              options={modeOptions}
              onChange={changeMode}
            />

            <FormField
              label="Usuário"
              name="username"
              value={form.username}
              onChange={updateField}
              autoComplete="username"
            />

            {isRegisterMode && (
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
              />
            )}

            <div className="form-field auth-password-field">
              <label className="form-field-label" htmlFor="auth-password">
                Senha
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-password"
                  className="form-field-input auth-password-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  autoComplete={
                    isRegisterMode ? "new-password" : "current-password"
                  }
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="auth-password-icon"
                    >
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.58 10.58a2 2 0 102.84 2.84"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.88 5.09A10.94 10.94 0 0112 4.9c5.05 0 8.27 3.11 9.5 7.1a10.6 10.6 0 01-4.27 5.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.6 6.62A11.38 11.38 0 002.5 12c1.24 4 4.45 7.1 9.5 7.1 1.4 0 2.66-.24 3.8-.66"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="auth-password-icon"
                    >
                      <path
                        d="M2.5 12C3.74 8 6.95 4.9 12 4.9c5.05 0 8.27 3.11 9.5 7.1-1.23 3.99-4.45 7.1-9.5 7.1-5.05 0-8.26-3.1-9.5-7.1z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Enviado..."
                : isRegisterMode
                  ? "Criar conta"
                  : "Entrar"}
            </button>

            <ThemeSwitcher className="auth-theme-switcher" />
          </div>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
