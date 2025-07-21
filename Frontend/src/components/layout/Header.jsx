import { useState } from "react";
import { Link } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle"; // Import the new component
import { LogOut, User } from "lucide-react";

const Header = () => {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur-lg sm:px-6">
            <div>
                <h1 className="text-xl font-semibold text-text-primary">Welcome, {user?.name || "Operator"}!</h1>
            </div>
            <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-background-offset">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background-offset">
                           <User className="h-5 w-5 text-text-secondary" />
                        </div>
                    )}
                    <span className="hidden sm:inline text-text-primary">{user?.email}</span>
                </Link>

                <ThemeToggle /> {/* Add the toggle button here */}

                <div className="h-6 w-px bg-border"></div> {/* Separator */}

                <Button variant="ghost" onClick={handleLogout} loading={isLoggingOut} className="gap-2">
                   {!isLoggingOut && <LogOut className="h-4 w-4"/>}
                   <span>Logout</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;