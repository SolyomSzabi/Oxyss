// Persists the staff login session. Only the access token and display data are stored.
const SESSION_KEY = "oxyss_session";
const LEGACY_KEYS = ["barber_token", "barber_id", "barber_name"];

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const loadSession = () => {
  const storage = safeStorage();
  if (!storage) return null;
  LEGACY_KEYS.forEach((key) => storage.removeItem(key));
  try {
    const session = JSON.parse(storage.getItem(SESSION_KEY));
    if (session?.token && session.expiresAt > Date.now()) return session;
  } catch {
    // fall through: corrupted value
  }
  storage.removeItem(SESSION_KEY);
  return null;
};

export const saveSession = (session) => {
  safeStorage()?.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  safeStorage()?.removeItem(SESSION_KEY);
};

export const getToken = () => loadSession()?.token ?? null;
