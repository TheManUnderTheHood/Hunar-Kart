import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme'; // We will create this hook next
import Button from './Button';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button 
            variant="ghost" 
            onClick={toggleTheme} 
            className="p-2 h-auto"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 transition-all" />
            ) : (
                <Sun className="h-5 w-5 transition-all" />
            )}
        </Button>
    );
};

export default ThemeToggle;