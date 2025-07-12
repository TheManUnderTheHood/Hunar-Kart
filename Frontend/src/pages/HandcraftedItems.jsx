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
const FormSelect = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select></div>);

const HandcraftedItems = () => {
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ artisanID: '', name: '', description: '', category: '', price: '', quantity: '', status: 'Available' });
    
    // Search and Sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [itemsRes, artisansRes] = await Promise.all([ apiClient.get('/handcrafteditem'), apiClient.get('/artisans') ]);
                setItems(itemsRes.data.data.items || []);
                setArtisans(artisansRes.data.data.artisans || []);
            } catch (err) {
                toast.error('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        setFormData(item ? { ...item, artisanID: item.artisanID._id } : { artisanID: '', name: '', description: '', category: '', price: '', quantity: '', status: 'Available' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData(p => ({...p, [e.target.name]: e.target.value}));

    const handleSubmit = async(e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        const dataToSend = {...formData, price: Number(formData.price), quantity: Number(formData.quantity)};
        const promise = currentItem 
            ? apiClient.patch(`/handcrafteditem/${currentItem._id}`, dataToSend)
            : apiClient.post('/handcrafteditem', dataToSend);
        
        toast.promise(promise, {
            loading: 'Saving item...',
            success: 'Item saved successfully!',
            error: (err) => err.response?.data?.message || 'Failed to save item.'
        }).then(() => {
            fetchData();
            handleCloseModal();
        }).finally(() => {
            setIsSubmitting(false);
        });
    };
    
    const handleDelete = async(id) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            const promise = apiClient.delete(`/handcrafteditem/${id}`);
            toast.promise(promise, {
                loading: 'Deleting item...',
                success: 'Item deleted successfully!',
                error: (err) => err.response?.data?.message || 'Failed to delete item.'
            }).then(() => {
                setItems(prev => prev.filter(i => i._id !== id));
            });
        }
    };
    
    const processedItems = useMemo(() => {
        let sortableItems = [...items];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if(sortConfig.key === 'artisanID') { // Special case for nested object sorting
                aVal = a.artisanID?.name || '';
                bVal = b.artisanID?.name || '';
            }
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
    };
    
    const tableHeaders = [
        { name: "Name", key: "name", sortable: true },
        { name: "Artisan", key: "artisanID", sortable: true },
        { name: "Price", key: "price", sortable: true },
        { name: "Quantity", key: "quantity", sortable: true },
        { name: "Status", key: "status", sortable: true },
        { name: "Actions", key: "actions", sortable: false },
    ];
    
    if(loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-white">Handcrafted Items</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item name..." />
                    <Button onClick={()=>handleOpenModal()} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/>Add Item</Button>
                </div>
            </div>
            
            <Table
                headers={tableHeaders.map(h => (
                    <div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>
                ))}
                data={processedItems}
                renderRow={(item) => (
                    <tr key={item._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.artisanID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className='flex gap-1'><Link to={`/items/${item._id}`}><Button variant="ghost" className="p-2 h-auto" aria-label="View Details"><Eye className="h-4 w-4"/></Button></Link><Button variant="ghost" onClick={() => handleOpenModal(item)} className="p-2 h-auto" aria-label="Edit Item"><Edit className="h-4 w-4"/></Button><Button variant="ghost" onClick={() => handleDelete(item._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Delete Item"><Trash2 className="h-4 w-4"/></Button></div></td>
                    </tr>
                )}
            />
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'Edit Item' : 'Add New Item'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="artisanID" label="Artisan" value={formData.artisanID} onChange={handleInputChange} options={artisans} required/>
                    <FormInput name="name" label="Item Name" value={formData.name} onChange={handleInputChange} required />
                    <FormInput name="description" label="Description" value={formData.description} onChange={handleInputChange} />
                    <FormInput name="category" label="Category" value={formData.category} onChange={handleInputChange} />
                    <FormInput name="price" label="Price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                    <FormInput name="quantity" label="Quantity" type="number" value={formData.quantity} onChange={handleInputChange} required />
                    <FormSelect name="status" label="Status" value={formData.status} onChange={handleInputChange} options={['Available', 'Sold', 'Draft'].map(v => ({ _id: v, name: v }))} required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit" loading={isSubmitting}>{currentItem ? 'Save Changes' : 'Create Item'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default HandcraftedItems;