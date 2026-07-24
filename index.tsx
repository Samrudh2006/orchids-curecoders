import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { QueryLimitProvider } from './context/QueryLimitContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Get Google Client ID from environment variables or use fallback dev client ID
// In Vercel production: VITE_GOOGLE_CLIENT_ID is set via environment variables
// In local dev: falls back to dev client ID or uses VITE_GOOGLE_CLIENT_ID if set in .env.development.local
const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID.trim())
  ? import.meta.env.VITE_GOOGLE_CLIENT_ID
  : '744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryLimitProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryLimitProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
