import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { User, MapPin, Phone, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArtisan = async () => {
            if (!artisanId) return;
            try {
                setLoading(true);
                const response = await apiClient.get(`/artisans/${artisanId}`);
                setArtisan(response.data.data);
            } catch (err) {
                setError('Failed to fetch artisan details.');
            } finally {
                setLoading(false);
            }
        };
        fetchArtisan();
    }, [artisanId]);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    if (error) return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">{error}</div>;
    if (!artisan) return <div className="text-center text-slate-400">Artisan not found.</div>;

    return (
        <div>
            <Link to="/artisans" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to All Artisans
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">{artisan.name}</h1>
            <p className="text-slate-400 mb-8 font-mono text-xs">ID: {artisan._id}</p>

            <Card>
                <div className="divide-y divide-slate-700">
                    <DetailRow icon={User} label="Full Name" value={artisan.name} />
                    <DetailRow icon={MapPin} label="Address" value={artisan.address} />
                    <DetailRow icon={Phone} label="Contact Number" value={artisan.contactNumber} />
                    <DetailRow icon={Calendar} label="Registration Date" value={new Date(artisan.registrationDate).toLocaleDateString()} />
                    <DetailRow icon={ShieldCheck} label="Agreement Status" value={artisan.agreementStatus} />
                    {artisan.aadhaarCardNumber && <DetailRow icon={User} label="Aadhaar Number" value={"**** **** " + artisan.aadhaarCardNumber.slice(-4)} />}
                </div>
            </Card>
        </div>
    );
};

export default ArtisanDetail;