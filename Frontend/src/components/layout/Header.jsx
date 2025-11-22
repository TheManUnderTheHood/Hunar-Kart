import { useState } from "react";
import { Link } from 'react-router-dom';
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { LogOut, User, ChevronDown, Sparkles } from "lucide-react";

// Header component
const Header = () => {
    const { user, logout } = useAuth();
    
    // Tracks logout button loading state
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Tracks dropdown arrow animation based on hover state
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Handle User logout with loading indication
    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
    };
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <header className="relative flex h-16 items-center justify-between border-b border-border/50 bg-gradient-to-r from-background/95 via-background/80 to-background/95 px-4 backdrop-blur-xl sm:px-6 shadow-sm">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
            
            {/* Left side - Enhanced greeting */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text">
                            {getGreeting()}, {user?.name || "Operator"}!
                        </h1>
                        <p className="text-xs text-text-secondary/70 font-medium">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Enhanced controls */}
            <div className="relative z-10 flex items-center gap-3">
                {/* Enhanced Profile Section */}
                <div className="relative">
                    <Link 
                        to="/profile" 
                        className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-background-offset/80 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
                        onMouseEnter={() => setIsProfileOpen(true)}
                        onMouseLeave={() => setIsProfileOpen(false)}
                    >
                        {/* Enhanced Avatar */}
                        <div className="relative">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt="avatar" 
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 transition-all duration-200 group-hover:from-primary/30 group-hover:to-primary/20 group-hover:scale-110">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse"></div>
                        </div>

                        {/* User info with enhanced styling */}
                        <div className="hidden sm:block text-left min-w-0">
                            <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors duration-200 truncate">
                                {user?.name || "User"}
                            </p>
                            <p className="text-xs text-text-secondary/70 truncate">
                                {user?.email}
                            </p>
                        </div>

                        {/* Dropdown indicator */}
                        <ChevronDown className={`h-4 w-4 text-text-secondary transition-all duration-200 group-hover:text-primary ${
                            isProfileOpen ? 'rotate-180' : 'rotate-0'
                        }`} />
                    </Link>
                </div>

                {/* Enhanced Theme Toggle */}
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                </div>

                {/* Enhanced Divider */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>

                {/* Enhanced Logout Button */}
                <Button 
                    variant="ghost" 
                    onClick={handleLogout} 
                    loading={isLoggingOut} 
                    className="group gap-2 rounded-xl px-4 py-2 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-800/30"
                >
                    {!isLoggingOut && (
                        <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-12"/>
                    )}
                    <span className="font-medium">
                        {isLoggingOut ? "Signing out..." : "Logout"}
                    </span>
                </Button>
            </div>

            {/* Subtle animated border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </header>
    );
};

export default Header;
