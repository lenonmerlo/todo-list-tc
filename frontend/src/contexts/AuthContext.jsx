import { useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storeUser = localStorage.getItem("user");
    return storeUser ? JSON.parse(storeUser) : null;
  });

  const isAuthenticated = Boolean(user);

  async function loadCurrentUser() {
    const response = await api.get("/auth/me/");
    localStorage.setItem("user", JSON.stringify(response.data));
    setUser(response.data);
    return response.data;
  }

  async function login(credentials) {
    const response = await api.post("/auth/login/", credentials);

    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);

    return loadCurrentUser();
  }

  async function register(data) {
    await api.post("/auth/register/", data);

    return login({
      username: data.username,
      password: data.password,
    });
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      register,
      logout,
      loadCurrentUser,
    }),
    [user, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("userAuth must be used inside AuthProvider");
  }

  return context;
}
