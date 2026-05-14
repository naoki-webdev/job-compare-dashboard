import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  createSession,
  deleteSession,
  fetchCurrentSession,
  getApiErrorMessage,
  setApiAuthToken,
} from "../api/jobs";
import { t } from "../i18n";
import type { AuthUser } from "../types/job";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const authStorageKey = "job-compare-auth-token";
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken() {
  return window.localStorage.getItem(authStorageKey);
}

function storeToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(authStorageKey, token);
  } else {
    window.localStorage.removeItem(authStorageKey);
  }

  setApiAuthToken(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiAuthToken(token);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    fetchCurrentSession()
      .then((session) => {
        if (!active) return;
        setUser(session.user);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        storeToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);

    try {
      const session = await createSession(email, password);
      storeToken(session.token);
      setToken(session.token);
      setUser(session.user);
      return true;
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, t("auth.errors.login")));
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await deleteSession();
    } finally {
      storeToken(null);
      setToken(null);
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, signIn, signOut, clearError }),
    [clearError, error, loading, signIn, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
