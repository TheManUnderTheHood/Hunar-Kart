import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { ShoppingBag, User, DollarSign, Archive, Tag, ArrowLeft, AlignLeft, CalendarCheck } from 'lucide-react';

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-3">
        <Icon className="h-5 w-5 text-slate-400 mt-1 mr-4 shrink-0" />
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-md font-medium text-white break-words">{value}</p>
        </div>
    </div>
);

const ItemDetail = () => {
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            if (!itemId) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`/handcrafteditem/${itemId}`);
                setItem(response.data.data);
            } catch (err) { setError('Failed to fetch item details.'); } 
            finally { setLoading(false); }
        };
        fetchItem();
    }, [itemId]);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>;
    if (!item) return <div className="text-center text-slate-400">Item not found.</div>;

    return (
        <div>
            <Link to="/items" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to All Items
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">{item.name}</h1>
            <p className="text-slate-400 mb-8 font-mono text-xs">ID: {item._id}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Item Information</h2>
                    <div className="divide-y divide-slate-700">
                        <DetailRow icon={ShoppingBag} label="Name" value={item.name} />
                        <DetailRow icon={Tag} label="Category" value={item.category || 'N/A'} />
                        <DetailRow icon={DollarSign} label="Price" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)} />
                        <DetailRow icon={Archive} label="Quantity in Stock" value={item.quantity} />
                        <DetailRow icon={Tag} label="Status" value={item.status} />
                         <DetailRow icon={CalendarCheck} label="Upload Date" value={new Date(item.uploadDate).toLocaleDateString()} />
                    </div>
                </Card>
                 <Card>
                    <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">Artisan & Description</h2>
                     {item.artisanID ? (
                        <div className="divide-y divide-slate-700">
                           <DetailRow icon={User} label="Artisan Name" value={<Link to={`/artisans/${item.artisanID._id}`} className="text-primary hover:underline">{item.artisanID.name}</Link>} />
                        </div>
                     ) : (
                        <DetailRow icon={User} label="Artisan" value="Artisan not associated or found." />
                     )}
                     <div className="mt-4 border-t border-slate-700 pt-4">
                        <div className="flex items-center text-sm text-slate-400 mb-1"><AlignLeft className="h-4 w-4 mr-2" />Description</div>
                        <p className="text-md text-white mt-1 pl-6">{item.description || 'No description provided.'}</p>
                     </div>
                 </Card>
            </div>
        </div>
    );
};
export default ItemDetail;