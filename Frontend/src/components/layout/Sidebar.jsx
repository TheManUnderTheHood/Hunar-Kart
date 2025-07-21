import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, List, FileText, Gem, UserCog } from 'lucide-react';

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/artisans", icon: Users, label: "Artisans" },
    { to: "/items", icon: ShoppingBag, label: "Items" },
    { to: "/listings", icon: List, label: "Listings" },
    { to: "/sales", icon: DollarSign, label: "Sales" },
    { to: "/agreements", icon: FileText, label: "Agreements" },
];

const adminNavItems = [
    { to: "/operators", icon: UserCog, label: "Operators" },
];

const SidebarNavLink = ({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary transition-all hover:text-text-primary hover:bg-background-offset/50 ${isActive ? 'bg-primary/10 text-primary font-semibold' : ''
              }`
            }
        >
            <Icon className="h-5 w-5" />
            {label}
        </NavLink>
    );
}

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <aside className="hidden w-64 flex-col border-r border-border bg-background/70 p-4 backdrop-blur-lg md:flex">
            <div className="flex h-16 items-center gap-3 border-b border-border px-2">
                <Gem className="h-8 w-8 text-primary"/>
                <span className="text-2xl font-bold text-text-primary">HunarKart</span>
            </div>
            <nav className="mt-6 flex flex-1 flex-col gap-2">
                {navItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                
                {user?.role === 'Admin' && (
                    <>
                      <div className="my-2 border-t border-border"></div>
                      <h3 className="px-3 text-xs font-semibold uppercase text-text-secondary/50">Admin</h3>
                      {adminNavItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;