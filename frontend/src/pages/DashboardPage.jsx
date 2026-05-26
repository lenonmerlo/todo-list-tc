import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiStar from "../assets/kawaii-star.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
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
          <div>
            <span className="dashboard-kicker">Dia Leve</span>
            <h1 className="dashboard-title">Olá, {user.username}</h1>
            <p className="dashboard-subtitle">
              Seu painel para organizar o dia com leveza.
            </p>
          </div>
          <button className="dashboard-logout" type="button" onClick={logout}>
            Sair
          </button>
        </header>

        <section className="dashboard-layout">
          <aside className="dashboard-sidebar">
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
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="dashboard-delete-btn"
                    >
                      ×
                    </button>
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
