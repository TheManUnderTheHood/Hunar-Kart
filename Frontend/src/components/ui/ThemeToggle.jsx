import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
    html.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    setIsDark(newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-slate-300 hover:text-white px-3 py-1 rounded-md border border-slate-600"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
