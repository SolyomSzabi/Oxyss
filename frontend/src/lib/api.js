// Single HTTP client for the backend API. Attaches the staff token and reacts to expired sessions.
import axios from "axios";
import { getToken } from "@/lib/session";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL ?? ""}/api`,
  timeout: 20000,
});

let onUnauthorized = null;

/** Registered by AuthProvider: called when an authenticated request is rejected with 401. */
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

/** Human-readable message from an API error (FastAPI returns `detail` as a string or a list). */
export const errorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg).join(", ");
  return fallback;
};
