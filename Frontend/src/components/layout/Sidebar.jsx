import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, DollarSign, List, FileText, Gem } from 'lucide-react';

const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/artisans", icon: Users, label: "Artisans" },
    { to: "/items", icon: ShoppingBag, label: "Items" },
    { to: "/listings", icon: List, label: "Listings" },
    { to: "/sales", icon: DollarSign, label: "Sales" },
    { to: "/agreements", icon: FileText, label: "Agreements" },
];

const SidebarNavLink = ({ to, icon: Icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 transition-all hover:text-white hover:bg-slate-700/50 ${isActive ? 'bg-primary/20 text-white font-semibold' : ''
              }`
            }
        >
            <Icon className="h-5 w-5" />
            {label}
        </NavLink>
    );
}

const Sidebar = () => {
    return (
        <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900 p-4 md:flex">
            <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-2">
                <Gem className="h-8 w-8 text-primary"/>
                <span className="text-2xl font-bold text-white">HunarKart</span>
            </div>
            <nav className="mt-6 flex flex-1 flex-col gap-2">
                {navItems.map(item => <SidebarNavLink key={item.to} {...item} />)}
            </nav>
        </aside>
    );
};

export default Sidebar;