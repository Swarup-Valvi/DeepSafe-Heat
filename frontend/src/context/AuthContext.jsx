import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import api from "../api/api";
  
  const AuthContext = createContext(null);
  
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem("heatsafe_user");
  
      try {
        return savedUser ? JSON.parse(savedUser) : null;
      } catch {
        localStorage.removeItem("heatsafe_user");
        return null;
      }
    });
  
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const loadCurrentUser = async () => {
        const token = localStorage.getItem("heatsafe_token");
  
        if (!token) {
          setLoading(false);
          return;
        }
  
        try {
          const response = await api.get("/auth/me/");
  
          setUser(response.data);
  
          localStorage.setItem(
            "heatsafe_user",
            JSON.stringify(response.data)
          );
        } catch (error) {
          console.error("Session validation failed:", error);
  
          localStorage.removeItem("heatsafe_token");
          localStorage.removeItem("heatsafe_user");
  
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
  
      loadCurrentUser();
    }, []);
  
    const login = async (email, password) => {
      const response = await api.post("/auth/login/", {
        email,
        password,
      });
  
      const {
        token,
        user: authenticatedUser,
      } = response.data;
  
      localStorage.setItem("heatsafe_token", token);
      localStorage.setItem(
        "heatsafe_user",
        JSON.stringify(authenticatedUser)
      );
  
      setUser(authenticatedUser);
  
      return authenticatedUser;
    };
  
    const register = async (formData) => {
      const response = await api.post(
        "/auth/register/",
        formData
      );
  
      const {
        token,
        user: registeredUser,
      } = response.data;
  
      localStorage.setItem("heatsafe_token", token);
      localStorage.setItem(
        "heatsafe_user",
        JSON.stringify(registeredUser)
      );
  
      setUser(registeredUser);
  
      return registeredUser;
    };
  
    const logout = async () => {
      try {
        await api.post("/auth/logout/");
      } catch (error) {
        console.error("Backend logout failed:", error);
      } finally {
        localStorage.removeItem("heatsafe_token");
        localStorage.removeItem("heatsafe_user");
        setUser(null);
      }
    };
  
    const value = useMemo(
      () => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }),
      [user, loading]
    );
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider."
      );
    }
  
    return context;
  }