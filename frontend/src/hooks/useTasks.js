import { useCallback, useEffect, useRef, useState } from "react";
import { categoriesService, tasksService } from "../services/tasks";

export function useTasks() {
  const isMountedRef = useRef(false);
  const taskRequestRef = useRef(0);
  const categoryRequestRef = useRef(0);
  const taskAbortRef = useRef(null);
  const categoryAbortRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    completed: "",
    category: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      taskAbortRef.current?.abort();
      categoryAbortRef.current?.abort();
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    const requestId = ++taskRequestRef.current;
    taskAbortRef.current?.abort();
    const controller = new AbortController();
    taskAbortRef.current = controller;

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const params = { page };
      if (filters.completed !== "") params.completed = filters.completed;
      if (filters.category !== "") params.category = filters.category;
      if (filters.search !== "") params.search = filters.search;

      const res = await tasksService.list(params, {
        signal: controller.signal,
      });

      if (!isMountedRef.current || requestId !== taskRequestRef.current) {
        return;
      }

      setTasks(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") {
        return;
      }

      if (isMountedRef.current && requestId === taskRequestRef.current) {
        setError("Não foi possível carregar as tarefas.");
      }
    } finally {
      if (isMountedRef.current && requestId === taskRequestRef.current) {
        setLoading(false);
      }
    }
  }, [page, filters]);

  const fetchCategories = useCallback(async () => {
    const requestId = ++categoryRequestRef.current;
    categoryAbortRef.current?.abort();
    const controller = new AbortController();
    categoryAbortRef.current = controller;

    try {
      const res = await categoriesService.list({ signal: controller.signal });

      if (!isMountedRef.current || requestId !== categoryRequestRef.current) {
        return;
      }

      setCategories(res.data.results || res.data);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") {
        return;
      }

      if (isMountedRef.current && requestId === categoryRequestRef.current) {
        setError("Não foi possível carregar as categorias.");
      }
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchTasks();
    });
  }, [fetchTasks]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCategories();
    });
  }, [fetchCategories]);

  const createTask = useCallback(
    async (data) => {
      await tasksService.create(data);
      await fetchTasks();
    },
    [fetchTasks],
  );

  const toggleTask = useCallback(
    async (task) => {
      await tasksService.update(task.id, { completed: !task.completed });
      await fetchTasks();
    },
    [fetchTasks],
  );

  const deleteTask = useCallback(
    async (id) => {
      await tasksService.remove(id);
      await fetchTasks();
    },
    [fetchTasks],
  );

  const shareTask = useCallback(
    async (id, username) => {
      const response = await tasksService.share(id, username);
      await fetchTasks();
      return response;
    },
    [fetchTasks],
  );

  const createCategory = useCallback(
    async (name) => {
      await categoriesService.create({ name });
      await fetchCategories();
    },
    [fetchCategories],
  );

  return {
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
  };
}
