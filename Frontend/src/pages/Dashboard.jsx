import { useEffect, useState } from "react";
import apiClient from "../api/axiosConfig";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { Users, ShoppingBag, DollarSign, List } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [artisansRes, itemsRes, salesRes, listingsRes] = await Promise.all([
                    apiClient.get('/artisans'),
                    apiClient.get('/handcrafteditem'),
                    apiClient.get('/sales'),
                    apiClient.get('/platformlisting')
                ]);
                
                const totalRevenue = salesRes.data.data.sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);

                setStats({
                    artisans: artisansRes.data.data.count,
                    items: itemsRes.data.data.count,
                    sales: salesRes.data.data.count,
                    listings: listingsRes.data.data.count,
                    revenue: totalRevenue
                });
            } catch (err) {
                setError("Failed to fetch dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg"/></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="mb-8 text-3xl font-bold text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} title="Total Artisans" value={stats.artisans} color="text-sky-400" />
                <StatCard icon={ShoppingBag} title="Total Items" value={stats.items} color="text-emerald-400" />
                <StatCard icon={DollarSign} title="Total Sales" value={stats.sales} subtitle={`Revenue: $${stats.revenue.toFixed(2)}`} color="text-amber-400" />
                <StatCard icon={List} title="Active Listings" value={stats.listings} color="text-violet-400" />
            </div>

            {/* You can add charts or recent activity lists here */}
            <div className="mt-8">
              <Card>
                <h2 className="text-xl font-semibold text-white">More Widgets Coming Soon!</h2>
                <p className="mt-2 text-slate-400">This area can be used for charts, recent sales, or quick actions.</p>
              </Card>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="flex flex-col">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-300">{title}</h3>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="mt-4 text-4xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </Card>
)

export default Dashboard;