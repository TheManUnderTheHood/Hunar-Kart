import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const Artisans = () => {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentArtisan, setCurrentArtisan] = useState(null); // null for new, object for editing
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contactNumber: '',
        aadhaarCardNumber: ''
    });

    const fetchArtisans = async () => {
        try {
            setError('');
            setLoading(true);
            const response = await apiClient.get('/artisans');
            setArtisans(response.data.data.artisans);
        } catch (err) {
            setError('Failed to fetch artisans.');
            console.error(err);
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
            setFormData({
                name: artisan.name,
                address: artisan.address,
                contactNumber: artisan.contactNumber,
                aadhaarCardNumber: artisan.aadhaarCardNumber || ''
            });
        } else {
            setFormData({ name: '', address: '', contactNumber: '', aadhaarCardNumber: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentArtisan(null);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentArtisan) {
                // Update
                await apiClient.patch(`/artisans/${currentArtisan._id}`, formData);
            } else {
                // Create
                await apiClient.post('/artisans', formData);
            }
            fetchArtisans();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save artisan", err);
            setError(err.response?.data?.message || 'Failed to save artisan.');
        }
    };

    const handleDelete = async (artisanId) => {
        if (window.confirm('Are you sure you want to delete this artisan and all related data? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/artisans/${artisanId}`);
                fetchArtisans();
            } catch (err) {
                console.error('Failed to delete artisan', err);
                setError(err.response?.data?.message || 'Failed to delete artisan.');
            }
        }
    };


    const tableHeaders = ["Name", "Contact", "Address", "Agreement Status", "Actions"];

    const renderArtisanRow = (artisan, index) => (
        <tr key={artisan._id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{artisan.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{artisan.contactNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{artisan.address}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{artisan.agreementStatus}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className='flex gap-2'>
                    <Button variant="ghost" onClick={() => handleOpenModal(artisan)} className="p-2 h-auto"><Edit className="h-4 w-4"/></Button>
                    <Button variant="ghost" onClick={() => handleDelete(artisan._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                </div>
            </td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Manage Artisans</h1>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <PlusCircle className="h-5 w-5"/>
                    Add Artisan
                </Button>
            </div>

            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
            
            <Table headers={tableHeaders} data={artisans} renderRow={renderArtisanRow} />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentArtisan ? 'Edit Artisan' : 'Add New Artisan'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-300 mb-1">Contact Number</label>
                        <Input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="aadhaarCardNumber" className="block text-sm font-medium text-slate-300 mb-1">Aadhaar Card Number (Optional)</label>
                        <Input id="aadhaarCardNumber" name="aadhaarCardNumber" value={formData.aadhaarCardNumber} onChange={handleInputChange} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">{currentArtisan ? 'Save Changes' : 'Create Artisan'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Artisans;