import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
const FormInput = ({ label, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select></div>);

const PlatformListings = () => {
    const [listings, setListings] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentListing, setCurrentListing] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ itemID: '', platformName: '', listingURL: '', status: 'Active' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'listingDate', direction: 'descending' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [listingsRes, itemsRes] = await Promise.all([ apiClient.get('/platformlisting'), apiClient.get('/handcrafteditem') ]);
            setListings(listingsRes.data.data.listings || []);
            setItems(itemsRes.data.data.items || []);
        } catch (err) {
            toast.error('Failed to fetch platform listings.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchData() }, []);
    
    const handleOpenModal = (listing = null) => {
        setCurrentListing(listing);
        setFormData(listing ? { ...listing, itemID: listing.itemID?._id } : { itemID: '', platformName: '', listingURL: '', status: 'Active' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const promise = currentListing
            ? apiClient.patch(`/platformlisting/${currentListing._id}`, formData)
            : apiClient.post('/platformlisting', formData);

        toast.promise(promise, {
            loading: 'Saving listing...',
            success: 'Listing saved!',
            error: err => err.response?.data?.message || 'Failed to save listing.'
        }).then(() => { fetchData(); handleCloseModal(); }).finally(() => setIsSubmitting(false));
    };

    const handleDelete = async (listingId) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            const promise = apiClient.delete(`/platformlisting/${listingId}`);
            toast.promise(promise, {
                loading: 'Deleting...',
                success: 'Listing deleted successfully.',
                error: 'Failed to delete listing.'
            }).then(() => {
                setListings(prev => prev.filter(l => l._id !== listingId));
            });
        }
    };

    const processedListings = useMemo(() => {
        let sortableItems = [...listings];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'itemID') {
                aVal = a.itemID?.name?.toLowerCase() || '';
                bVal = b.itemID?.name?.toLowerCase() || '';
            }

            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems.filter(l =>
            l.itemID?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.platformName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [listings, searchTerm, sortConfig]);

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
        { name: "Item", key: "itemID", sortable: true },
        { name: "Platform", key: "platformName", sortable: true },
        { name: "Status", key: "status", sortable: true },
        { name: "URL", key: "listingURL", sortable: false },
        { name: "Actions", key: "actions", sortable: false }
    ];

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Platform Listings</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search listings..."/>
                    <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Add Listing</Button>
                </div>
            </div>

            <Table
                headers={tableHeaders.map(h => (
                    <div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>
                        {h.name} {getSortIcon(h.key)}
                    </div>
                ))}
                data={processedListings}
                renderRow={(listing) => (
                    <tr key={listing._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{listing.itemID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{listing.platformName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{listing.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 max-w-xs truncate">
                            <a href={listing.listingURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{listing.listingURL}</a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className='flex gap-1'>
                                <Button variant="ghost" onClick={() => handleOpenModal(listing)} className="p-2 h-auto"><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" onClick={() => handleDelete(listing._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentListing ? 'Edit Listing' : 'Add New Listing'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="itemID" label="Item" value={formData.itemID} onChange={handleInputChange} options={items} required />
                    <FormInput name="platformName" label="Platform Name" value={formData.platformName} onChange={handleInputChange} required />
                    <FormInput name="listingURL" label="Listing URL" value={formData.listingURL} onChange={handleInputChange} />
                    <FormSelect name="status" label="Status" value={formData.status} onChange={handleInputChange} options={[{ _id: 'Active', name: 'Active' }, { _id: 'Inactive', name: 'Inactive' }]} required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>{currentListing ? 'Save Changes' : 'Create Listing'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PlatformListings;