import { useCallback, useMemo, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storeUser = localStorage.getItem("user");
    return storeUser ? JSON.parse(storeUser) : null;
  });

  const isAuthenticated = Boolean(user);

  const loadCurrentUser = useCallback(async () => {
    const response = await api.get("/auth/me/");
    localStorage.setItem("user", JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  }, []);

  const login = useCallback(
    async (credentials) => {
      const response = await api.post("/auth/login/", credentials);

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      return loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const register = useCallback(
    async (data) => {
      await api.post("/auth/register/", data);

      return login({
        username: data.username,
        password: data.password,
      });
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      register,
      logout,
      loadCurrentUser,
    }),
    [user, isAuthenticated, login, register, logout, loadCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
