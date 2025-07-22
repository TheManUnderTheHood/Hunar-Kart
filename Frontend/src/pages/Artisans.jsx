import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import FormError from '../components/ui/FormError';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, Edit, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';

const artisanSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    address: z.string().min(10, "A detailed address is required (min 10 characters)"),
    contactNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit contact number"),
    aadhaarCardNumber: z.string().regex(/^\d{12}$/, { message: "Aadhaar must be exactly 12 digits" }).optional().or(z.literal('')),
});

const FormInputGroup = ({ label, error, registration, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <Input {...props} {...registration} />
        <FormError message={error?.message} />
    </div>
);

const Artisans = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArtisan, setCurrentArtisan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: zodResolver(artisanSchema),
        defaultValues: { name: '', address: '', contactNumber: '', aadhaarCardNumber: '' }
    });

    const fetchArtisans = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/artisans');
            setArtisans(response.data.data.artisans || []);
        } catch (err) {
            toast.error('Failed to fetch artisans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtisans();
    }, []);

    const handleOpenModal = (artisan = null) => {
        setCurrentArtisan(artisan);
        if (artisan) {
            setValue('name', artisan.name);
            setValue('address', artisan.address);
            setValue('contactNumber', artisan.contactNumber);
            setValue('aadhaarCardNumber', artisan.aadhaarCardNumber || '');
        } else {
            reset({ name: '', address: '', contactNumber: '', aadhaarCardNumber: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = async (data) => {
        const promise = currentArtisan
            ? apiClient.patch(`/artisans/${currentArtisan._id}`, data)
            : apiClient.post('/artisans', data);

        await toast.promise(promise, {
            loading: currentArtisan ? 'Updating artisan...' : 'Creating artisan...',
            success: (res) => {
                fetchArtisans();
                handleCloseModal();
                return res.data.message || 'Artisan saved successfully!';
            },
            error: (err) => err.response?.data?.message || 'An error occurred.',
        });
    };

    const handleDelete = async (artisanId) => {
        if (window.confirm('Are you sure? This will delete the artisan and ALL related data.')) {
            const promise = apiClient.delete(`/artisans/${artisanId}`);
            await toast.promise(promise, {
                loading: 'Deleting artisan...',
                success: 'Artisan deleted successfully!',
                error: (err) => err.response?.data?.message || 'Failed to delete artisan.',
            }).then(() => {
                setArtisans(prev => prev.filter(a => a._id !== artisanId));
            });
        }
    };
    
    const processedArtisans = useMemo(() => {
        let sortableItems = [...artisans];
        if (sortConfig.key) { sortableItems.sort((a, b) => { if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1; if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); }
        return sortableItems.filter(artisan => artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) || artisan.contactNumber.includes(searchTerm));
    }, [artisans, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
    };
    
    const tableHeaders = [{ name: "Name", key: "name", sortable: true }, { name: "Contact", key: "contactNumber", sortable: false }, { name: "Address", key: "address", sortable: false }, { name: "Status", key: "agreementStatus", sortable: true }, { name: "Actions", key: "actions", sortable: false }];
    
    const renderArtisanRow = (artisan, index) => (
        <tr key={artisan._id} className="transition-colors hover:bg-background-offset" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{artisan.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{artisan.contactNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary max-w-sm truncate">{artisan.address}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{artisan.agreementStatus}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className='flex gap-1'>
                    <Link to={`/artisans/${artisan._id}`}><Button variant="ghost" className="p-2 h-auto" aria-label="View Details"><Eye className="h-4 w-4"/></Button></Link>
                    <Button variant="ghost" onClick={() => handleOpenModal(artisan)} className="p-2 h-auto" aria-label="Edit Artisan"><Edit className="h-4 w-4"/></Button>
                    <Button variant="ghost" onClick={() => handleDelete(artisan._id)} className="p-2 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"><Trash2 className="h-4 w-4"/></Button>
                </div>
            </td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-glow">Manage Artisans</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or contact..." />
                    <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Add Artisan</Button>
                </div>
            </div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))}
                data={processedArtisans}
                renderRow={renderArtisanRow}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentArtisan ? 'Edit Artisan' : 'Add New Artisan'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInputGroup label="Full Name" error={errors.name} registration={register('name')} />
                    <FormInputGroup label="Address" error={errors.address} registration={register('address')} />
                    <FormInputGroup label="Contact Number" error={errors.contactNumber} registration={register('contactNumber')} />
                    <FormInputGroup label="Aadhaar Card Number (Optional)" error={errors.aadhaarCardNumber} registration={register('aadhaarCardNumber')} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>{currentArtisan ? 'Save Changes' : 'Create Artisan'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Artisans;