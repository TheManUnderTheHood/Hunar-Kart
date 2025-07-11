import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";
import { LogOut, User } from "lucide-react";

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 sm:px-6">
            <div>
                {/* Could add breadcrumbs or search here in the future */}
                <h1 className="text-xl font-semibold text-white">Welcome, {user?.name || "Operator"}!</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                           <User className="h-5 w-5 text-slate-400" />
                        </div>
                    )}
                    <span className="hidden sm:inline text-slate-300">{user?.email}</span>
                </div>
                <Button variant="ghost" onClick={logout} className="gap-2">
                   <LogOut className="h-4 w-4"/> 
                   Logout
                </Button>
            </div>
        </header>
    );
};

export default Header;