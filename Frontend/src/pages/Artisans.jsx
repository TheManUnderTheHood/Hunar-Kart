import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, Edit, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
const FormInput = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);

const Artisans = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArtisan, setCurrentArtisan] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', address: '', contactNumber: '', aadhaarCardNumber: '' });
    
    // New states for search and sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    useEffect(() => {
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
        fetchArtisans();
    }, []);

    const handleOpenModal = (artisan = null) => {
        setCurrentArtisan(artisan);
        setFormData(artisan ? { ...artisan } : { name: '', address: '', contactNumber: '', aadhaarCardNumber: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const promise = currentArtisan
            ? apiClient.patch(`/artisans/${currentArtisan._id}`, formData)
            : apiClient.post('/artisans', formData);

        toast.promise(promise, {
            loading: 'Saving artisan...',
            success: (res) => {
                fetchArtisans();
                handleCloseModal();
                return res.data.message || 'Artisan saved successfully!';
            },
            error: (err) => err.response?.data?.message || 'Failed to save artisan.',
        }).finally(() => setIsSubmitting(false));
    };

    const handleDelete = async (artisanId) => {
        if (window.confirm('Are you sure? This will delete the artisan and ALL related data.')) {
            const promise = apiClient.delete(`/artisans/${artisanId}`);
            toast.promise(promise, {
                loading: 'Deleting artisan...',
                success: 'Artisan deleted successfully!',
                error: (err) => err.response?.data?.message || 'Failed to delete artisan.',
            }).then(() => {
                setArtisans(prev => prev.filter(a => a._id !== artisanId));
            });
        }
    };
    
    // Memoized sorting and filtering
    const processedArtisans = useMemo(() => {
        let sortableItems = [...artisans];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems.filter(artisan =>
            artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            artisan.contactNumber.includes(searchTerm)
        );
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
    
    const tableHeaders = [
        { name: "Name", key: "name", sortable: true },
        { name: "Contact", key: "contactNumber", sortable: false },
        { name: "Address", key: "address", sortable: false },
        { name: "Status", key: "agreementStatus", sortable: true },
        { name: "Actions", key: "actions", sortable: false },
    ];
    
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-white">Manage Artisans</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or contact..." />
                    <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
                        <PlusCircle className="h-5 w-5"/> Add Artisan
                    </Button>
                </div>
            </div>
            
            <Table
                headers={tableHeaders.map(h => (
                    <div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>
                        {h.name} {getSortIcon(h.key)}
                    </div>
                ))}
                data={processedArtisans}
                renderRow={(artisan) => (
                    <tr key={artisan._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{artisan.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{artisan.contactNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 max-w-sm truncate">{artisan.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{artisan.agreementStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className='flex gap-1'>
                            <Link to={`/artisans/${artisan._id}`}><Button variant="ghost" className="p-2 h-auto" aria-label="View Details"><Eye className="h-4 w-4"/></Button></Link>
                            <Button variant="ghost" onClick={() => handleOpenModal(artisan)} className="p-2 h-auto" aria-label="Edit Artisan"><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" onClick={() => handleDelete(artisan._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Delete Artisan"><Trash2 className="h-4 w-4"/></Button>
                        </div></td>
                    </tr>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentArtisan ? 'Edit Artisan' : 'Add New Artisan'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="name" label="Full Name" value={formData.name} onChange={handleInputChange} required />
                    <FormInput name="address" label="Address" value={formData.address} onChange={handleInputChange} required />
                    <FormInput name="contactNumber" label="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
                    <FormInput name="aadhaarCardNumber" label="Aadhaar Card Number (Optional)" value={formData.aadhaarCardNumber || ''} onChange={handleInputChange} />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>{currentArtisan ? 'Save Changes' : 'Create Artisan'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Artisans;