import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiStar from "../assets/kawaii-star.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
import MiniCalendar from "../components/MiniCalendar";
import "../components/MiniCalendar.css";
import ThemeSwitcher from "../components/ThemeSwitcher";
import WeatherWidget from "../components/WeatherWidget";
import "../components/WeatherWidget.css";
import { useAuth } from "../contexts/useAuth";
import { useTasks } from "../hooks/useTasks";
import "./DashboardPage.css";

const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };
const PRIORITY_CLASS = { low: "low", medium: "medium", high: "high" };
const STATUS_LABEL = {
  todo: "A fazer",
  in_progress: "Em andamento",
  waiting: "Aguardando",
  done: "Concluída",
};
const STATUS_CLASS = {
  todo: "todo",
  in_progress: "in-progress",
  waiting: "waiting",
  done: "done",
};
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatApiError(err, fallback) {
  const data = err?.response?.data;

  if (!data) return fallback;

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.join(" ");
  }

  if (typeof data === "object") {
    const messages = [];
    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(" ")}`);
        return;
      }

      if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
}

function toTaskPayload(task) {
  const estimatedRaw = String(task.estimated_minutes ?? "").trim();

  return {
    title: task.title.trim(),
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date || null,
    due_time: task.due_time || null,
    estimated_minutes: estimatedRaw ? Number(estimatedRaw) : null,
    category: task.category ? Number(task.category) : null,
  };
}

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
    updateTask,
    toggleTask,
    deleteTask,
    shareTask,
    createCategory,
  } = useTasks();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    due_time: "",
    estimated_minutes: "",
    category: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sharingTaskId, setSharingTaskId] = useState(null);
  const [shareUsername, setShareUsername] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [shareError, setShareError] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    due_date: "",
    due_time: "",
    estimated_minutes: "",
    category: "",
  });
  const [createError, setCreateError] = useState("");
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [editingError, setEditingError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const totalPages = Math.ceil(count / 10);

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTask.title.trim() || isSavingCreate) return;

    setIsSavingCreate(true);
    setCreateError("");

    try {
      await createTask(toTaskPayload(newTask));
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
        due_time: "",
        estimated_minutes: "",
        category: "",
      });
      setShowForm(false);
    } catch (err) {
      setCreateError(formatApiError(err, "Nao foi possivel criar a tarefa."));
    } finally {
      setIsSavingCreate(false);
    }
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

  function isTaskOwner(task) {
    const ownerUsername = (task?.owner_details?.username || "").toLowerCase();
    const viewerUsername = (user?.username || "").toLowerCase();
    return ownerUsername && ownerUsername === viewerUsername;
  }

  function startEditTask(task) {
    if (!isTaskOwner(task)) return;

    setEditingTaskId(task.id);
    setEditingError("");
    setEditingTask({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      due_date: task.due_date || "",
      due_time: task.due_time ? String(task.due_time).slice(0, 5) : "",
      estimated_minutes:
        task.estimated_minutes != null ? String(task.estimated_minutes) : "",
      category: task.category ? String(task.category) : "",
    });
  }

  function cancelEditTask() {
    setEditingTaskId(null);
    setEditingError("");
    setEditingTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: "",
      due_time: "",
      estimated_minutes: "",
      category: "",
    });
  }

  async function saveEditedTask(taskId) {
    if (isSavingEdit) return;

    const title = editingTask.title.trim();
    if (!title) {
      setEditingError("Informe um titulo para a tarefa.");
      return;
    }

    setIsSavingEdit(true);
    setEditingError("");

    try {
      await updateTask(taskId, toTaskPayload({ ...editingTask, title }));
      cancelEditTask();
    } catch (err) {
      setEditingError(
        formatApiError(err, "Nao foi possivel salvar as alteracoes."),
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  function formatDueDate(dueDate) {
    if (!dueDate) return null;
    const parsed = new Date(`${dueDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dueDate;
    return dateFormatter.format(parsed);
  }

  function formatDueTime(dueTime) {
    if (!dueTime) return null;
    return String(dueTime).slice(0, 5);
  }

  const todayIsoDate = new Date().toISOString().slice(0, 10);

  function getShareDisplayUsers(task) {
    const viewerUsername = (user?.username || "").toLowerCase();
    const sharedUsers = Array.isArray(task.shared_with_details)
      ? task.shared_with_details
      : [];
    const ownerUser = task.owner_details;
    const ownerUsername = (ownerUser?.username || "").toLowerCase();
    const isOwnerViewing = ownerUsername && ownerUsername === viewerUsername;

    if (isOwnerViewing) {
      return sharedUsers;
    }

    const visibleSharedUsers = sharedUsers.filter(
      (sharedUser) =>
        (sharedUser?.username || "").toLowerCase() !== viewerUsername,
    );

    if (!ownerUser) {
      return visibleSharedUsers;
    }

    const mergedUsers = [ownerUser, ...visibleSharedUsers];
    const uniqueUsers = [];
    const seenKeys = new Set();

    for (const item of mergedUsers) {
      const key = item?.id ?? item?.username;
      if (!key || seenKeys.has(key)) continue;
      seenKeys.add(key);
      uniqueUsers.push(item);
    }

    return uniqueUsers;
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
            <ThemeSwitcher className="dashboard-theme-switcher" compact />
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
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-status"
                    >
                      Estado
                    </label>
                    <select
                      id="create-status"
                      value={newTask.status}
                      onChange={(e) =>
                        setNewTask((t) => ({ ...t, status: e.target.value }))
                      }
                      className="dashboard-input dashboard-select"
                    >
                      <option value="todo">A fazer</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="waiting">Aguardando</option>
                      <option value="done">Concluída</option>
                    </select>
                  </div>
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-priority"
                    >
                      Prioridade
                    </label>
                    <select
                      id="create-priority"
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
                  </div>
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-category"
                    >
                      Categoria
                    </label>
                    <select
                      id="create-category"
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
                  </div>
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-due-date"
                    >
                      Prazo
                    </label>
                    <input
                      id="create-due-date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) =>
                        setNewTask((t) => ({ ...t, due_date: e.target.value }))
                      }
                      className="dashboard-input"
                      aria-label="Data de vencimento"
                    />
                  </div>
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-due-time"
                    >
                      Horário
                    </label>
                    <input
                      id="create-due-time"
                      type="time"
                      value={newTask.due_time}
                      onChange={(e) =>
                        setNewTask((t) => ({ ...t, due_time: e.target.value }))
                      }
                      className="dashboard-input"
                      aria-label="Horario de vencimento"
                    />
                  </div>
                  <div className="dashboard-form-field">
                    <label
                      className="dashboard-field-label"
                      htmlFor="create-estimated"
                    >
                      Duração (min)
                    </label>
                    <input
                      id="create-estimated"
                      type="number"
                      min="1"
                      max="1440"
                      value={newTask.estimated_minutes}
                      onChange={(e) =>
                        setNewTask((t) => ({
                          ...t,
                          estimated_minutes: e.target.value,
                        }))
                      }
                      placeholder="Duracao (min)"
                      className="dashboard-input"
                      aria-label="Duracao estimada em minutos"
                    />
                  </div>
                  <div className="dashboard-form-submit">
                    <button
                      type="submit"
                      className="dashboard-primary-btn"
                      disabled={isSavingCreate}
                    >
                      {isSavingCreate ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
                {createError && (
                  <p className="dashboard-inline-error">{createError}</p>
                )}
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
                {tasks.map((task) => {
                  const shareDisplayUsers = getShareDisplayUsers(task);
                  const isOverdue =
                    !task.completed &&
                    Boolean(task.due_date) &&
                    String(task.due_date) < todayIsoDate;
                  const dueDateText = formatDueDate(task.due_date);
                  const dueTimeText = formatDueTime(task.due_time);
                  const hasEstimated = task.estimated_minutes != null;

                  return (
                    <li
                      key={task.id}
                      className={`dashboard-task-item ${task.completed ? "completed" : ""} ${isOverdue ? "overdue" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        className="dashboard-checkbox"
                      />
                      <div className="dashboard-task-content">
                        {editingTaskId === task.id ? (
                          <form
                            className="dashboard-edit-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void saveEditedTask(task.id);
                            }}
                          >
                            <input
                              value={editingTask.title}
                              onChange={(event) =>
                                setEditingTask((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="Titulo da tarefa"
                              className="dashboard-input"
                            />
                            <textarea
                              value={editingTask.description}
                              onChange={(event) =>
                                setEditingTask((current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              placeholder="Descricao (opcional)"
                              rows={2}
                              className="dashboard-input dashboard-textarea"
                            />
                            <div className="dashboard-form-row">
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-status-${task.id}`}
                                >
                                  Estado
                                </label>
                                <select
                                  id={`edit-status-${task.id}`}
                                  value={editingTask.status}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      status: event.target.value,
                                    }))
                                  }
                                  className="dashboard-input dashboard-select"
                                >
                                  <option value="todo">A fazer</option>
                                  <option value="in_progress">
                                    Em andamento
                                  </option>
                                  <option value="waiting">Aguardando</option>
                                  <option value="done">Concluída</option>
                                </select>
                              </div>
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-priority-${task.id}`}
                                >
                                  Prioridade
                                </label>
                                <select
                                  id={`edit-priority-${task.id}`}
                                  value={editingTask.priority}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      priority: event.target.value,
                                    }))
                                  }
                                  className="dashboard-input dashboard-select"
                                >
                                  <option value="low">Baixa</option>
                                  <option value="medium">Média</option>
                                  <option value="high">Alta</option>
                                </select>
                              </div>
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-category-${task.id}`}
                                >
                                  Categoria
                                </label>
                                <select
                                  id={`edit-category-${task.id}`}
                                  value={editingTask.category}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      category: event.target.value,
                                    }))
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
                              </div>
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-due-date-${task.id}`}
                                >
                                  Prazo
                                </label>
                                <input
                                  id={`edit-due-date-${task.id}`}
                                  type="date"
                                  value={editingTask.due_date}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      due_date: event.target.value,
                                    }))
                                  }
                                  className="dashboard-input"
                                  aria-label="Data de vencimento"
                                />
                              </div>
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-due-time-${task.id}`}
                                >
                                  Horário
                                </label>
                                <input
                                  id={`edit-due-time-${task.id}`}
                                  type="time"
                                  value={editingTask.due_time}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      due_time: event.target.value,
                                    }))
                                  }
                                  className="dashboard-input"
                                  aria-label="Horario de vencimento"
                                />
                              </div>
                              <div className="dashboard-form-field">
                                <label
                                  className="dashboard-field-label"
                                  htmlFor={`edit-estimated-${task.id}`}
                                >
                                  Duração (min)
                                </label>
                                <input
                                  id={`edit-estimated-${task.id}`}
                                  type="number"
                                  min="1"
                                  max="1440"
                                  value={editingTask.estimated_minutes}
                                  onChange={(event) =>
                                    setEditingTask((current) => ({
                                      ...current,
                                      estimated_minutes: event.target.value,
                                    }))
                                  }
                                  placeholder="Duracao (min)"
                                  className="dashboard-input"
                                  aria-label="Duracao estimada em minutos"
                                />
                              </div>
                              <div className="dashboard-edit-actions">
                                <button
                                  type="submit"
                                  className="dashboard-primary-btn"
                                  disabled={isSavingEdit}
                                >
                                  {isSavingEdit ? "Salvando..." : "Salvar"}
                                </button>
                                <button
                                  type="button"
                                  className="dashboard-secondary-btn"
                                  onClick={cancelEditTask}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                            {editingError && (
                              <p className="dashboard-inline-error">
                                {editingError}
                              </p>
                            )}
                          </form>
                        ) : (
                          <>
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

                            {shareDisplayUsers.length > 0 && (
                              <div className="dashboard-share-row">
                                <span className="dashboard-share-label">
                                  Compartilhado com:
                                </span>
                                {shareDisplayUsers.map((sharedUser) => (
                                  <span
                                    key={sharedUser.id}
                                    className="dashboard-share-chip"
                                  >
                                    @{sharedUser.username}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="dashboard-task-badges">
                              <span
                                className={`dashboard-badge status ${STATUS_CLASS[task.status] ?? "todo"}`}
                              >
                                Estado: {STATUS_LABEL[task.status] ?? "A fazer"}
                              </span>
                              <span
                                className={`dashboard-badge priority ${PRIORITY_CLASS[task.priority] ?? "medium"}`}
                              >
                                {PRIORITY_LABEL[task.priority]}
                              </span>
                              <span className="dashboard-badge category">
                                {getCategoryName(task.category)}
                              </span>
                              {dueDateText && (
                                <span className="dashboard-badge due-date">
                                  Prazo: {dueDateText}
                                </span>
                              )}
                              {dueTimeText && (
                                <span className="dashboard-badge due-time">
                                  Horario: {dueTimeText}
                                </span>
                              )}
                              {hasEstimated && (
                                <span className="dashboard-badge duration">
                                  Duracao: {task.estimated_minutes} min
                                </span>
                              )}
                              {isOverdue && (
                                <span className="dashboard-badge overdue-text">
                                  Atrasada
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="dashboard-task-actions">
                        {isTaskOwner(task) && editingTaskId !== task.id && (
                          <button
                            type="button"
                            onClick={() => startEditTask(task)}
                            className="dashboard-edit-trigger"
                            title="Editar tarefa"
                            aria-label="Editar tarefa"
                          >
                            ✏️
                          </button>
                        )}
                        {sharingTaskId === task.id ? (
                          <div className="dashboard-share-panel">
                            <input
                              value={shareUsername}
                              onChange={(e) => setShareUsername(e.target.value)}
                              placeholder="username"
                              className="dashboard-share-input"
                            />
                            <button
                              type="button"
                              onClick={() => handleShare(task.id)}
                              className="dashboard-share-submit"
                            >
                              ok
                            </button>
                            {shareMsg && (
                              <span
                                className={`dashboard-share-message ${shareError ? "error" : "success"}`}
                              >
                                {shareMsg}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={resetShareState}
                              className="dashboard-share-close"
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
                            className="dashboard-share-trigger"
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
                  );
                })}
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
