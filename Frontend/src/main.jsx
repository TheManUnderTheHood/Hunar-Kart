import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './tailwind.css';
import { AuthProvider } from './context/AuthContext.jsx';





const theme = localStorage.getItem('theme');
if (theme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}






ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b', // slate-800
              color: '#e2e8f0', // slate-200
              border: '1px solid #334155', // slate-700
            },
            success: {
                iconTheme: {
                    primary: '#38bdf8', // sky-400
                    secondary: 'white',
                },
            },
            error: {
                iconTheme: {
                    primary: '#f43f5e', // rose-500
                    secondary: 'white',
                },
            }
          }}
        />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);