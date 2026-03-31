import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi, type AuthUser } from "../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("gz_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("gz_token"),
  );
  const [loading, setLoading] = useState(false);

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    if (nextUser) {
      localStorage.setItem("gz_user", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("gz_user");
    }
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const data = await authApi.login(email, password);
        localStorage.setItem("gz_token", data.token);
        setToken(data.token);
        persistUser(data.user);
      } finally {
        setLoading(false);
      }
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("gz_token");
    setToken(null);
    persistUser(null);
  }, [persistUser]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const currentUser = await authApi.me();
    persistUser(currentUser);
  }, [persistUser, token]);

  // Keep user data fresh on page load if token exists
  useEffect(() => {
    if (!token) return;
    refreshUser().catch(() => logout());
  }, [token, refreshUser, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
