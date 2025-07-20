import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains('dark');
    html.classList.toggle('dark');
    localStorage.setItem('theme', isCurrentlyDark ? 'light' : 'dark');
    setIsDark(!isCurrentlyDark);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark' || !saved);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="px-2 py-1 text-slate-300 hover:text-white border rounded"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
