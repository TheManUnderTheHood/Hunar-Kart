import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, List, FileText, Gem, UserCog, ChevronRight } from 'lucide-react';

const navItems = [ 
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }, 
    { to: "/artisans", icon: Users, label: "Artisans" }, 
    { to: "/items", icon: ShoppingBag, label: "Items" }, 
    { to: "/listings", icon: List, label: "Listings" }, 
    { to: "/sales", icon: DollarSign, label: "Sales" }, 
    { to: "/agreements", icon: FileText, label: "Agreements" }
];

const adminNavItems = [ 
    { to: "/operators", icon: UserCog, label: "Operators" }
];

const SidebarNavLink = ({ to, icon: Icon, label }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `
            group relative flex items-center gap-3 rounded-xl px-4 py-3 
            text-text-secondary transition-all duration-200 ease-in-out
            hover:text-white hover:bg-gradient-to-r hover:from-primary/90 hover:to-primary
            hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]
            ${isActive 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30 font-semibold' 
                : ''
            }
        `}
    >
        <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        <span className="flex-1">{label}</span>
        <ChevronRight className={`h-4 w-4 transition-all duration-200 ${
            'opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0'
        }`} />
        
        {/* Subtle glow effect for active/hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 -z-10" />
    </NavLink>
);

const Sidebar = () => {
    const { user } = useAuth();
    
    return (
        <aside className="hidden w-64 flex-col border-r border-border/50 bg-gradient-to-b from-background-offset to-background-offset/80 backdrop-blur-sm p-6 md:flex shadow-xl">
            {/* Enhanced Header */}
            <div className="flex h-16 items-center gap-3 border-b border-border/30 px-2 mb-8">
                <div className="relative">
                    <Gem className="h-9 w-9 text-primary drop-shadow-lg"/>
                    <div className="absolute inset-0 h-9 w-9 text-primary/30 blur-sm">
                        <Gem className="h-9 w-9"/>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-text-primary">HunarKart</span>
                    <span className="text-xs text-text-secondary/60 font-medium">Artisan Marketplace</span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-1 flex-col gap-2">
                <div className="mb-4">
                    <h3 className="px-4 text-xs font-semibold uppercase text-text-secondary/60 tracking-wider mb-3">
                        Main Menu
                    </h3>
                    <div className="space-y-1">
                        {navItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                    </div>
                </div>

                {/* Admin Section */}
                {user?.role === 'Admin' && (
                    <div className="mt-6">
                        <div className="mb-4 flex items-center gap-3 px-4">
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
                            <span className="text-xs font-semibold uppercase text-text-secondary/60 tracking-wider">
                                Admin
                            </span>
                            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
                        </div>
                        <div className="space-y-1">
                            {adminNavItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                        </div>
                    </div>
                )}

                {/* User Info Footer */}
                <div className="mt-auto pt-6 border-t border-border/30">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border/30">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-text-secondary/70 truncate">
                                {user?.role || 'Member'}
                            </p>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
