import axios from "axios";

const PROD_API_BASE_URL = "https://todo-list-tc-production.up.railway.app/api";
const DEV_API_BASE_URL = "http://localhost:8000/api";
const envBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();

const api = axios.create({
  baseURL:
    envBaseURL || (import.meta.env.PROD ? PROD_API_BASE_URL : DEV_API_BASE_URL),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
