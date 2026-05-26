import api from "./api";

export const tasksService = {
  list: (params, config = {}) => api.get("/tasks/", { params, ...config }),
  create: (data, config = {}) => api.post("/tasks/", data, config),
  update: (id, data, config = {}) => api.patch(`/tasks/${id}/`, data, config),
  remove: (id, config = {}) => api.delete(`/tasks/${id}/`, config),
  share: (id, username, config = {}) =>
    api.post(`/tasks/${id}/share/`, { username }, config),
};

export const taskService = tasksService;

export const categoriesService = {
  list: (config = {}) => api.get("/categories/", config),
  create: (data, config = {}) => api.post("/categories/", data, config),
};
