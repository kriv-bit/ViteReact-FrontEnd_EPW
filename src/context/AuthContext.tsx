import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { restoreTokenFromStorage } from "../api/http";

type AuthUser = {
  token: string;
  username: string;
  role: string | null;
} | null;

type AuthContextType = {
  user: AuthUser;
  login: (token: string, username: string, role?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Persistencia: carga token + username + rol de localStorage al iniciar
  const [user, setUser] = useState<AuthUser>(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    return token && username ? { token, username, role } : null;
  });

  // Al restaurar sesión desde localStorage, también sincronizamos el token global
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      restoreTokenFromStorage();
      console.log("[AuthContext] Sesión restaurada desde localStorage:", {
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role"),
      });
    }
  }, []); // Solo al montar (no necesita dependencias, lee directo de localStorage)

  function login(token: string, username: string, role?: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    if (role) {
      localStorage.setItem("role", role);
    }
    setUser({ token, username, role: role ?? null });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso rápido
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
