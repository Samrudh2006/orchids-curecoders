/**
 * Dynamically resolves the backend API base URL depending on the environment.
 * - In local development: defaults to http://localhost:3001
 * - In deployed environment (Vercel): uses VITE_API_URL env variable if set, otherwise falls back to window.location.origin
 */
export const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return window.location.origin;
  }
  
  return 'http://localhost:3001';
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('curecoders_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export default getApiUrl;
