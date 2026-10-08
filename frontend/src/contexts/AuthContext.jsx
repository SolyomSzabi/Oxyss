import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '@/lib/api';
import { clearSession, loadSession, saveSession } from '@/lib/session';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(loadSession);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  /** Store the response of POST /auth/login. */
  const login = useCallback(({ access_token, barber_id, barber_name, expires_in }) => {
    const next = {
      token: access_token,
      barberId: barber_id,
      barberName: barber_name,
      expiresAt: Date.now() + expires_in * 1000,
    };
    saveSession(next);
    setSession(next);
  }, []);

  // Any 401 on an authenticated request means the session is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Log out automatically when the token expires.
  useEffect(() => {
    if (!session) return undefined;
    const timer = setTimeout(logout, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      barberData: session ? { id: session.barberId, name: session.barberName } : null,
      login,
      logout,
      loading: false,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
