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
            `flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 transition-all hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 ${
            isActive ? 'bg-primary/10 text-black dark:text-white font-semibold' : ''
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
        <aside className="hidden w-64 flex-col border-r border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-900/70 p-4 backdrop-blur-lg md:flex">

            <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-2">
                <Gem className="h-8 w-8 text-primary"/>
                <span className="text-2xl font-bold text-black dark:text-white">HunarKart</span>

            </div>
            <nav className="mt-6 flex flex-1 flex-col gap-2">
                {navItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                
                {user?.role === 'Admin' && (
                    <>
                      <div className="my-2 border-t border-slate-800"></div>
                      <h3 className="px-3 text-xs font-semibold uppercase text-slate-500">Admin</h3>
                      {adminNavItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;