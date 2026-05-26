import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiStar from "../assets/kawaii-star.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
import FormField from "../components/FormField";
import SegmentedControl from "../components/SegmentedControl";
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

function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
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
    } catch {
      setError(
        isRegisterMode
          ? "Não foi possível criar a conta. Verifique os dados informados."
          : "Não foi possível entrar. Verifique usuário e senha.",
      );
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

            <FormField
              label="Senha"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={
                isRegisterMode ? "new-password" : "current-password"
              }
              minLenght={6}
            />

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
          </div>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
