import { createContext, useEffect, useMemo, useState } from 'react';
import { getMe, login as loginRequest, updateProfile as updateProfileRequest } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('liftflow_session');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('liftflow_token')));

  useEffect(() => {
    if (!localStorage.getItem('liftflow_token')) return setLoading(false);
    getMe().then(({ user, employee }) => setSession((current) => ({ ...current, user, employee }))).catch(() => {
      localStorage.removeItem('liftflow_token');
      localStorage.removeItem('liftflow_session');
      setSession(null);
    }).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user,
    employee: session?.employee,
    loading,
    async login(credentials) {
      const next = await loginRequest(credentials);
      if (!next.token) return next;
      localStorage.setItem('liftflow_token', next.token);
      localStorage.setItem('liftflow_session', JSON.stringify(next));
      setSession(next);
      return next;
    },
    completeLogin(next) {
      localStorage.setItem('liftflow_token', next.token);
      localStorage.setItem('liftflow_session', JSON.stringify(next));
      setSession(next);
      return next;
    },
    async updateProfile(data) {
      const next = await updateProfileRequest(data);
      const updatedSession = { ...session, ...next };
      setSession(updatedSession);
      localStorage.setItem('liftflow_session', JSON.stringify(updatedSession));
      return next;
    },
    logout() {
      localStorage.removeItem('liftflow_token');
      localStorage.removeItem('liftflow_session');
      setSession(null);
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

