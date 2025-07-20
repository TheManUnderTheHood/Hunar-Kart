import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

 const toggleTheme = () => {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    console.log("Switched to light mode");
    setIsDark(false);
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    console.log("Switched to dark mode");
    setIsDark(true);
  }
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
