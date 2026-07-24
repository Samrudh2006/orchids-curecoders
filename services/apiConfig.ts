/**
 * Dynamically resolves the backend API base URL depending on the environment.
 * - In local development: defaults to http://localhost:3001
 * - In deployed environment (Vercel): uses VITE_API_URL env variable if set, otherwise falls back to window.location.origin
 * - Handles same-origin API calls on deployed Vercel instances via rewrites
 */
export const getApiUrl = (): string => {
  // First check if VITE_API_URL is explicitly set
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  
  // In development, use localhost:3001
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // In production on Vercel, API rewrites handle /api/* routing to the backend
  // Return window.location.origin (same-origin) so /api/* requests are rewritten by vercel.json
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // SSR or build-time fallback
  return '';
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('curecoders_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export default getApiUrl;
