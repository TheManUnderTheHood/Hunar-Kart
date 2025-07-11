import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const HandcraftedItems = () => {
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        artisanID: '',
        name: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        status: 'Available',
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [itemsRes, artisansRes] = await Promise.all([
                apiClient.get('/handcrafteditem'),
                apiClient.get('/artisans')
            ]);
            setItems(itemsRes.data.data.items);
            setArtisans(artisansRes.data.data.artisans);
        } catch (err) {
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item } : { artisanID: '', name: '', description: '', category: '', price: '', quantity: '', status: 'Available' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = { ...formData, price: Number(formData.price), quantity: Number(formData.quantity) };
        try {
            if (currentItem) {
                await apiClient.patch(`/handcrafteditem/${currentItem._id}`, dataToSend);
            } else {
                await apiClient.post('/handcrafteditem', dataToSend);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save item.');
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await apiClient.delete(`/handcrafteditem/${itemId}`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete item.');
            }
        }
    };

    const tableHeaders = ["Name", "Artisan", "Price", "Quantity", "Status", "Actions"];

    const renderRow = (item) => (
        <tr key={item._id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.artisanID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${parseFloat(item.price).toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.quantity}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.status}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                 <div className='flex gap-2'>
                    <Button variant="ghost" onClick={() => handleOpenModal(item)} className="p-2 h-auto"><Edit className="h-4 w-4"/></Button>
                    <Button variant="ghost" onClick={() => handleDelete(item._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                </div>
            </td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Handcrafted Items</h1>
                <Button onClick={() => handleOpenModal()} className="gap-2"><PlusCircle className="h-5 w-5"/> Add Item</Button>
            </div>
             {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
            <Table headers={tableHeaders} data={items} renderRow={renderRow} />
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'Edit Item' : 'Add New Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="artisanID" label="Artisan" value={formData.artisanID} onChange={handleInputChange} options={artisans} required/>
                    <FormInput name="name" label="Item Name" value={formData.name} onChange={handleInputChange} required />
                    <FormInput name="description" label="Description" value={formData.description} onChange={handleInputChange} />
                    <FormInput name="category" label="Category" value={formData.category} onChange={handleInputChange} />
                    <FormInput name="price" label="Price" type="number" value={formData.price} onChange={handleInputChange} required />
                    <FormInput name="quantity" label="Quantity" type="number" value={formData.quantity} onChange={handleInputChange} required />
                    <FormSelect name="status" label="Status" value={formData.status} onChange={handleInputChange} options={['Available', 'Sold', 'Draft'].map(v => ({ _id: v, name: v }))} required />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">{currentItem ? 'Save Changes' : 'Create Item'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
// Helper sub-components for the form to reduce repetition
const FormInput = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <Input {...props} />
    </div>
);
const FormSelect = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6">
            <option value="">Select an option</option>
            {options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}
        </select>
    </div>
);


export default HandcraftedItems;