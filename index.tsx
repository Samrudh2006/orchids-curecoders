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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '744896976826-kaleqhlhvfmt9sc81ojid7o9sara7a6u.apps.googleusercontent.com';

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
