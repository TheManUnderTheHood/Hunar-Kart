import { useState } from "react";
import { Link } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";
import { LogOut, User } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };

    return (

        <header className="flex h-16 items-center justify-between border-b border-slate-300 dark:border-slate-800/80 bg-white text-black dark:bg-slate-900/70 dark:text-white px-4 backdrop-blur-lg sm:px-6">

            <div>
                <h1 className="text-xl font-semibold text-white">Welcome, {user?.name || "Operator"}!</h1>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-slate-700/50">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                            <User className="h-5 w-5 text-slate-400" />
                        </div>
                    )}
                    <span className="hidden sm:inline text-slate-300">{user?.email}</span>
                </Link>


                {/* 🌗 Light/Dark Mode Toggle Button */}
                <ThemeToggle />

               


                <Button variant="ghost" onClick={handleLogout} loading={isLoggingOut} className="gap-2">
                    {!isLoggingOut && <LogOut className="h-4 w-4" />}
                    <span>Logout</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;