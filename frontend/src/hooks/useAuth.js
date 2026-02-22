import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "user";

/**
 * Simple auth hook backed by localStorage (matches current app behavior).
 * Returns: { user, token, role, isAuthenticated, login, logout, refresh }
 */
export default function useAuth() {
  const [user, setUser] = useState(null);

  const refresh = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (userData) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...userData,
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      })
    );
    refresh();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    refresh();
  };

  return useMemo(() => {
    const token = user?.token || null;
    const role = user?.role || null;
    const isAuthenticated = Boolean(user?.isAuthenticated && token);
    return { user, token, role, isAuthenticated, login, logout, refresh };
  }, [user]);
}
