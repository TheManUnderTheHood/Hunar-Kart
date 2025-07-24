import { useEffect, useState } from "react";
import apiClient from "../api/axiosConfig";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import SalesChart from "../components/dashboard/SalesChart";
import TopArtisans from "../components/dashboard/TopArtisans";
import { Users, ShoppingBag, DollarSign, List, ArrowUpRight, Sparkles } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1">
        {/* Content */}
        <div className="relative z-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-text-secondary">{title}</h3>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>

            {/* Main value */}
            <div className="flex items-baseline gap-2 mb-2">
                <p className="text-4xl font-bold text-text-primary group-hover:text-primary transition-colors duration-300">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            </div>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors duration-300 mt-1">
                    {subtitle}
                </p>
            )}
        </div>

        {/* Subtle hover background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatToINR = (num) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [artisansRes, itemsRes, salesRes, listingsRes] = await Promise.all([
                    apiClient.get('/artisans'),
                    apiClient.get('/handcrafteditem'),
                    apiClient.get('/sales'),
                    apiClient.get('/platformlisting')
                ]);
                
                const sales = salesRes.data.data.sales || [];
                const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalRevenue, 0);

                setStats({
                    artisans: artisansRes.data.data.count || 0,
                    items: itemsRes.data.data.count || 0,
                    sales: salesRes.data.data.count || 0,
                    listings: listingsRes.data.data.count || 0,
                    revenue: totalRevenue
                });

                setSalesData(sales);
                setArtisans(artisansRes.data.data.artisans || []);
            } catch (err) {
                setError("Failed to fetch dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg"/>
                    <p className="mt-4 text-text-secondary animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-8">
                <div className="text-red-500 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 p-6 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500 rounded-full">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Oops! Something went wrong</h3>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8">
            {/* Enhanced Header */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text">
                            Dashboard Overview
                        </h1>
                        <p className="text-text-secondary mt-1">
                            Real-time insights into your marketplace performance
                        </p>
                    </div>
                </div>
                
                {/* Decorative line */}
                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mt-6"></div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    icon={Users} 
                    title="Total Artisans" 
                    value={stats.artisans} 
                    color="from-sky-400 to-sky-600" 
                />
                <StatCard 
                    icon={ShoppingBag} 
                    title="Total Items" 
                    value={stats.items} 
                    color="from-emerald-400 to-emerald-600" 
                />
                <StatCard 
                    icon={DollarSign} 
                    title="Total Sales" 
                    value={stats.sales} 
                    subtitle={`Revenue: ${formatToINR(stats.revenue)}`}
                    color="from-amber-400 to-amber-600" 
                />
                <StatCard 
                    icon={List} 
                    title="Active Listings" 
                    value={stats.listings} 
                    color="from-violet-400 to-violet-600" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SalesChart data={salesData} />
                </div>
                <div className="lg:col-span-1">
                    <TopArtisans sales={salesData} artisans={artisans} />
                </div>
            </div>

            {/* Floating background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
        </div>
    );
};

export default Dashboard;