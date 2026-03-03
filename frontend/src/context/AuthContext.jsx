import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, getProfile } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      const userData = {
        ...response.user,
        token: response.token,
        isAuthenticated: true,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshProfile = async () => {
    try {
      const response = await getProfile();
      if (response.user) {
        updateUser(response.user);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser, 
      refreshProfile,
      loading,
      isAuthenticated: !!user?.token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);