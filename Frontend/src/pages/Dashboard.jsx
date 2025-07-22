import { useEffect, useState } from "react";
import apiClient from "../api/axiosConfig";
import Card from "../components/ui/Card"; // Using the regular card for a cleaner look
import Spinner from "../components/ui/Spinner";
import SalesChart from "../components/dashboard/SalesChart";
import { Users, ShoppingBag, DollarSign, List } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="flex flex-col">
        <div className="flex items-center justify-between text-text-secondary">
            <h3 className="font-semibold">{title}</h3>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="mt-4 text-4xl font-bold text-text-primary">{value}</p>
        {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatToINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [artisansRes, itemsRes, salesRes, listingsRes] = await Promise.all([ apiClient.get('/artisans'), apiClient.get('/handcrafteditem'), apiClient.get('/sales'), apiClient.get('/platformlisting') ]);
                const sales = salesRes.data.data.sales || [];
                const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);
                setStats({ artisans: artisansRes.data.data.count || 0, items: itemsRes.data.data.count || 0, sales: salesRes.data.data.count || 0, listings: listingsRes.data.data.count || 0, revenue: totalRevenue });
                setSalesData(sales);
            } catch (err) {
                setError("Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg"/></div>;
    if (error) return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-glow">Dashboard Overview</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard icon={Users} title="Total Artisans" value={stats.artisans} color="text-sky-500" />
                <StatCard icon={ShoppingBag} title="Total Items" value={stats.items} color="text-emerald-500" />
                <StatCard icon={DollarSign} title="Total Sales" value={stats.sales} subtitle={`Revenue: ${formatToINR(stats.revenue)}`} color="text-amber-500" />
                <StatCard icon={List} title="Active Listings" value={stats.listings} color="text-violet-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <SalesChart data={salesData} />
            </div>
        </div>
    );
};

export default Dashboard;