import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiStar from "../assets/kawaii-star.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
import MiniCalendar from "../components/MiniCalendar";
import "../components/MiniCalendar.css";
import WeatherWidget from "../components/WeatherWidget";
import "../components/WeatherWidget.css";
import { useAuth } from "../contexts/useAuth";
import { useTasks } from "../hooks/useTasks";
import "./DashboardPage.css";

const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };
const PRIORITY_CLASS = { low: "low", medium: "medium", high: "high" };

function DashboardPage() {
  const { user, logout } = useAuth();
  const {
    tasks,
    categories,
    count,
    page,
    setPage,
    filters,
    setFilters,
    loading,
    error,
    createTask,
    toggleTask,
    deleteTask,
    shareTask,
    createCategory,
  } = useTasks();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sharingTaskId, setSharingTaskId] = useState(null);
  const [shareUsername, setShareUsername] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [shareError, setShareError] = useState(false);

  const totalPages = Math.ceil(count / 10);

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    await createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      ...(newTask.category ? { category: newTask.category } : {}),
    });
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "",
    });
    setShowForm(false);
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await createCategory(newCategory);
    setNewCategory("");
  }

  function getCategoryName(categoryId) {
    if (!categoryId) {
      return "Sem categoria";
    }

    const category = categories.find(
      (cat) => String(cat.id) === String(categoryId),
    );
    return category?.name ?? "Sem categoria";
  }

  function resetShareState() {
    setSharingTaskId(null);
    setShareUsername("");
    setShareMsg("");
    setShareError(false);
  }

  async function handleShare(taskId) {
    if (!shareUsername.trim()) return;

    try {
      const response = await shareTask(taskId, shareUsername.trim());
      setShareError(false);
      setShareMsg(response?.data?.message || "Compartilhado!");

      window.setTimeout(() => {
        resetShareState();
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.error || "Nao foi possivel compartilhar a tarefa.";
      setShareError(true);
      setShareMsg(message);
    }
  }

  return (
    <main className="dashboard-page">
      <img
        className="dashboard-deco dashboard-deco-star"
        src={kawaiiStar}
        alt=""
        aria-hidden="true"
      />
      <img
        className="dashboard-deco dashboard-deco-cloud"
        src={kawaiiCloud}
        alt=""
        aria-hidden="true"
      />
      <img
        className="dashboard-deco dashboard-deco-sun"
        src={kawaiiSun}
        alt=""
        aria-hidden="true"
      />
      <img
        className="dashboard-deco dashboard-deco-moon"
        src={kawaiiMoon}
        alt=""
        aria-hidden="true"
      />

      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-header-main">
            <span className="dashboard-kicker">Dia Leve</span>
            <h1 className="dashboard-title">Olá, {user.username}</h1>
            <p className="dashboard-subtitle">
              Seu painel para organizar o dia com leveza.
            </p>
          </div>
          <div className="dashboard-header-actions">
            <div className="dashboard-weather-slot">
              <WeatherWidget />
            </div>
            <button className="dashboard-logout" type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <section className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <MiniCalendar tasks={tasks} />

            <div className="dashboard-card dashboard-sidebar-card">
              <span className="dashboard-section-title">Categorias</span>
              <ul className="dashboard-category-list">
                <li>
                  <button
                    onClick={() => {
                      setFilters((f) => ({ ...f, category: "" }));
                      setPage(1);
                    }}
                    className={`dashboard-category-btn ${filters.category === "" ? "active" : ""}`}
                  >
                    Todas
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setFilters((f) => ({ ...f, category: cat.id }));
                        setPage(1);
                      }}
                      className={`dashboard-category-btn ${String(filters.category) === String(cat.id) ? "active" : ""}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={handleCreateCategory}
                className="dashboard-inline-form"
              >
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nova categoria"
                  className="dashboard-input"
                />
                <button type="submit" className="dashboard-add-btn">
                  +
                </button>
              </form>
            </div>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-card dashboard-toolbar">
              <input
                value={filters.search}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, search: e.target.value }));
                  setPage(1);
                }}
                placeholder="Buscar tarefas..."
                className="dashboard-input search"
              />
              <select
                value={filters.completed}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, completed: e.target.value }));
                  setPage(1);
                }}
                className="dashboard-input dashboard-select"
              >
                <option value="">Todas</option>
                <option value="true">Concluídas</option>
                <option value="false">Pendentes</option>
              </select>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="dashboard-primary-btn"
              >
                + Nova tarefa
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleCreateTask}
                className="dashboard-card dashboard-task-form"
              >
                <input
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, title: e.target.value }))
                  }
                  placeholder="Título da tarefa"
                  className="dashboard-input"
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((t) => ({ ...t, description: e.target.value }))
                  }
                  placeholder="Descrição (opcional)"
                  rows={2}
                  className="dashboard-input dashboard-textarea"
                />
                <div className="dashboard-form-row">
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask((t) => ({ ...t, priority: e.target.value }))
                    }
                    className="dashboard-input dashboard-select"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask((t) => ({ ...t, category: e.target.value }))
                    }
                    className="dashboard-input dashboard-select"
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="dashboard-primary-btn">
                    Salvar
                  </button>
                </div>
              </form>
            )}

            {error && <div className="dashboard-error">{error}</div>}

            {loading ? (
              <p className="dashboard-feedback">Carregando...</p>
            ) : tasks.length === 0 ? (
              <div className="dashboard-card dashboard-empty">
                <p>Nenhuma tarefa encontrada.</p>
              </div>
            ) : (
              <ul className="dashboard-task-list">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`dashboard-task-item ${task.completed ? "completed" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                      className="dashboard-checkbox"
                    />
                    <div className="dashboard-task-content">
                      <p
                        className={`dashboard-task-title ${task.completed ? "done" : ""}`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="dashboard-task-desc">
                          {task.description}
                        </p>
                      )}

                      {task.shared_with_details?.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Compartilhado com:
                          </span>
                          {task.shared_with_details.map((sharedUser) => (
                            <span
                              key={sharedUser.id}
                              className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2 py-0.5 text-[11px] font-bold text-fuchsia-700"
                            >
                              @{sharedUser.username}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="dashboard-task-badges">
                        <span
                          className={`dashboard-badge priority ${PRIORITY_CLASS[task.priority] ?? "medium"}`}
                        >
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                        <span className="dashboard-badge category">
                          {getCategoryName(task.category)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      {sharingTaskId === task.id ? (
                        <div className="flex items-center gap-1.5 rounded-xl border border-pink-200/80 bg-white/90 px-2 py-1 shadow-sm">
                          <input
                            value={shareUsername}
                            onChange={(e) => setShareUsername(e.target.value)}
                            placeholder="username"
                            className="w-24 rounded-md border border-pink-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleShare(task.id)}
                            className="rounded-md bg-gradient-to-r from-pink-500 to-violet-500 px-2 py-1 text-xs font-bold text-white transition hover:brightness-105"
                          >
                            ok
                          </button>
                          {shareMsg && (
                            <span
                              className={`text-xs font-semibold ${shareError ? "text-rose-500" : "text-emerald-600"}`}
                            >
                              {shareMsg}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={resetShareState}
                            className="text-xs text-slate-400 transition hover:text-slate-600"
                            aria-label="Fechar compartilhamento"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSharingTaskId(task.id);
                            setShareUsername("");
                            setShareMsg("");
                            setShareError(false);
                          }}
                          title="Compartilhar"
                          className="rounded-full p-1 text-lg leading-none text-slate-300 transition hover:bg-pink-50 hover:text-pink-400"
                          aria-label="Compartilhar tarefa"
                        >
                          👤
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="dashboard-delete-btn"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="dashboard-pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="dashboard-page-btn"
                >
                  ←
                </button>
                <span className="dashboard-page-indicator">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="dashboard-page-btn"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;
