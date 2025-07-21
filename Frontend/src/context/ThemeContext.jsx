import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // 1. Check for a saved theme in localStorage
        const savedTheme = localStorage.getItem('theme');
        // 2. Check for the user's OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 3. Default to saved, then OS, then dark
        return savedTheme || (prefersDark ? 'dark' : 'light');
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove the opposite theme class and add the current one
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);

        // Save the user's preference to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;