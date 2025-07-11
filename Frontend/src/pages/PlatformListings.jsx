import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
const FormInput = ({ label, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select></div>);

const PlatformListings = () => {
    const [listings, setListings] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentListing, setCurrentListing] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ itemID: '', platformName: '', listingURL: '', status: 'Active' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [listingsRes, itemsRes] = await Promise.all([ apiClient.get('/platformlisting'), apiClient.get('/handcrafteditem') ]);
            setListings(listingsRes.data.data.listings || []);
            setItems(itemsRes.data.data.items || []);
        } catch (err) {
            setError('Failed to fetch data.');
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
        try {
            if (currentListing) {
                await apiClient.patch(`/platformlisting/${currentListing._id}`, formData);
            } else {
                await apiClient.post('/platformlisting', formData);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save listing.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (listingId) => {
        if (window.confirm('Are you sure?')) {
            try { await apiClient.delete(`/platformlisting/${listingId}`); fetchData(); } 
            catch (err) { setError(err.response?.data?.message || 'Failed to delete listing.'); }
        }
    };

    const renderRow = (listing) => (
        <tr key={listing._id} className="transition-colors hover:bg-slate-800/60">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{listing.itemID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{listing.platformName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{listing.status}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 max-w-xs truncate"><a href={listing.listingURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{listing.listingURL}</a></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className='flex gap-2'><Button variant="ghost" onClick={() => handleOpenModal(listing)} className="p-2 h-auto"><Edit className="h-4 w-4"/></Button><Button variant="ghost" onClick={() => handleDelete(listing._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button></div></td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold text-white">Platform Listings</h1><Button onClick={() => handleOpenModal()} className="gap-2"><PlusCircle className="h-5 w-5"/> Add Listing</Button></div>
            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
            <Table headers={["Item", "Platform", "Status", "URL", "Actions"]} data={listings} renderRow={renderRow} />
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