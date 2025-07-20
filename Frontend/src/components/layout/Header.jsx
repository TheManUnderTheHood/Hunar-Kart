import { useState } from "react";
import { Link } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";
import { LogOut, User, ChevronDown } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-300 dark:border-slate-800/80 bg-white text-black dark:bg-slate-900/70 dark:text-white px-4 backdrop-blur-lg sm:px-6">
      <div>
        <h1 className="text-xl font-semibold text-black dark:text-white">Welcome, {user?.name || "Operator"}!</h1>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* 🌗 Light/Dark Toggle */}
        <ThemeToggle />

        {/* 👤 Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-slate-700/50"
            onClick={() => setOpen(!open)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
              <User className="h-5 w-5 text-slate-300" />
            </div>
            <ChevronDown className="h-4 w-4 text-slate-300" />
          </button>

          {/* Dropdown menu */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/10 z-50">
              <div className="px-4 py-2 text-sm text-slate-800 dark:text-slate-200">
                {user?.email}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
