import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, SESSION_STORAGE_KEY, request } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (session) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {}
  }, [session]);

  const value = useMemo(() => ({
    session,
    apiBaseUrl: API_BASE_URL,
    isAuthenticated: Boolean(session?.token),
    login: async (credentials) => {
      const payload = await request('/auth/login', { method: 'POST', body: credentials });
      setSession(payload.data);
      return payload.data;
    },
    logout: () => setSession(null),
    refreshMe: async () => {
      if (!session?.token) return null;
      const payload = await request('/me', { token: session.token });
      setSession((current) => current ? { ...current, user: payload.data } : current);
      return payload.data;
    },
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
