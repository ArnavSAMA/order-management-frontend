import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import type { Role, User } from "@/features/auth/types";

type AuthState = {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "om_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setReady(true); // ✅ always set, even if raw is missing
  }, []);

  const login = (role: Role) => {
    const nextUser: User = {
      id: "user001",
      name: "Demo User",
      role,
    };
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, login, logout, ready }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
