import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://cod-ah1q.onrender.com/api' : '/api');

// In production VITE_STATIC_URL points to the backend host (e.g. https://cod-api.onrender.com)
// In dev mode it falls back to '' which keeps relative paths working via Vite proxy.
const STATIC_BASE_URL =
  import.meta.env.VITE_STATIC_URL ||
  (import.meta.env.PROD ? 'https://cod-ah1q.onrender.com' : '');

/**
 * Resolves a server-relative static path to an absolute URL.
 * Usage: staticUrl(`/static/player_photos/${photo}`)
 */
export function staticUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = STATIC_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach Bearer token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event so AuthContext can react
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default client;
