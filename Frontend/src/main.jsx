import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './tailwind.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx'; // Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* Wrap AuthProvider */}
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-background-offset)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              },
              success: { iconTheme: { primary: 'var(--color-primary)', secondary: 'white' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: 'white' } }
            }}
          />
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);