import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import { User, MapPin, Phone, Calendar, ArrowLeft, ShieldCheck, ShoppingCart, BarChart2 } from 'lucide-react';

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-3">
        <Icon className="h-5 w-5 text-slate-400 mt-1 mr-4 shrink-0" />
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-md font-medium text-white break-words">{value}</p>
        </div>
    </div>
);

const ArtisanDetail = () => {
    const { artisanId } = useParams();
    const [artisan, setArtisan] = useState(null);
    const [salesData, setSalesData] = useState({ count: 0, totalRevenue: 0, sales: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatToINR = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);

    useEffect(() => {
        const fetchArtisanDetails = async () => {
            if (!artisanId) return;
            try {
                setLoading(true);
                // Fetch artisan details and their sales in parallel
                const [artisanRes, salesRes] = await Promise.all([
                    apiClient.get(`/artisans/${artisanId}`),
                    apiClient.get(`/artisans/${artisanId}/sales`)
                ]);
                setArtisan(artisanRes.data.data);
                setSalesData(salesRes.data.data);
            } catch (err) {
                setError('Failed to fetch artisan details.');
            } finally {
                setLoading(false);
            }
        };
        fetchArtisanDetails();
    }, [artisanId]);

    const salesTableHeaders = ["Item Sold", "Revenue", "Date"];

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>;
    if (!artisan) return <div className="text-center text-text-secondary">Artisan not found.</div>;

    return (
        <div>
            <Link to="/artisans" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to All Artisans
            </Link>
            <h1 className="text-4xl font-bold text-glow mb-2">{artisan.name}</h1>
            <p className="text-text-secondary mb-8 font-mono text-xs">ID: {artisan._id}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Artisan Info Card */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    <Card>
                        <div className="divide-y divide-border">
                            <DetailRow icon={MapPin} label="Address" value={artisan.address} />
                            <DetailRow icon={Phone} label="Contact Number" value={artisan.contactNumber} />
                            <DetailRow icon={Calendar} label="Registration Date" value={new Date(artisan.registrationDate).toLocaleDateString()} />
                            <DetailRow icon={ShieldCheck} label="Agreement Status" value={artisan.agreementStatus} />
                        </div>
                    </Card>
                     <Card>
                        <DetailRow icon={BarChart2} label="Total Revenue" value={formatToINR(salesData.totalRevenue)} />
                        <DetailRow icon={ShoppingCart} label="Total Sales" value={`${salesData.count} items sold`} />
                    </Card>
                </div>

                {/* Sales History Card */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Sales History</h2>
                        <Table 
                            headers={salesTableHeaders}
                            data={salesData.sales}
                            renderRow={(sale, index) => (
                                <tr key={sale._id} className="transition-colors hover:bg-background-offset" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{sale.itemID?.name || 'Item Deleted'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatToINR(sale.totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(sale.date).toLocaleDateString()}</td>
                                </tr>
                            )}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

const FullDetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-3">
        <Icon className="h-5 w-5 text-text-secondary mt-1 mr-4 shrink-0" />
        <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="text-md font-medium text-text-primary break-words">{value}</p>
        </div>
    </div>
);
ArtisanDetail.prototype.DetailRow = FullDetailRow;
export default ArtisanDetail;