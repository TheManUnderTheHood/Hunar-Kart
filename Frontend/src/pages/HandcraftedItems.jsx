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

const itemSchema = z.object({
    name: z.string().min(3, "Item name must be at least 3 characters"),
    description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
    category: z.string().optional(),
    price: z.coerce.number({ invalid_type_error: "Price must be a number" }).positive("Price must be a positive number"),
    quantity: z.coerce.number({ invalid_type_error: "Quantity must be a number" }).int("Quantity must be a whole number").min(0, "Quantity cannot be negative"),
    artisanID: z.string().min(1, "An artisan must be selected"),
    status: z.enum(['Available', 'Sold', 'Draft']),
});

const FormInputGroup = ({ label, error, registration, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} {...registration} /><FormError message={error?.message}/></div>);
const FormSelectGroup = ({ label, error, registration, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <select 
            {...props} 
            {...registration} 
            className="block w-full rounded-md border-0 bg-background-offset/50 py-2.5 px-3 text-text-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
        >
            <option value="">Select an option</option>
            {options.map(opt => <option key={opt._id || opt.value} value={opt._id || opt.value}>{opt.name || opt.label}</option>)}
        </select>
        <FormError message={error?.message}/>
    </div>
);

const HandcraftedItems = () => {
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: zodResolver(itemSchema),
        defaultValues: { status: 'Available' }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [itemsRes, artisansRes] = await Promise.all([ apiClient.get('/handcrafteditem'), apiClient.get('/artisans') ]);
                setItems(itemsRes.data.data.items || []);
                setArtisans(artisansRes.data.data.artisans || []);
            } catch (err) {
                toast.error('Failed to fetch item data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (item = null) => {
        setCurrentItem(item);
        if (item) {
            const defaultValues = { ...item, artisanID: item.artisanID._id };
            reset(defaultValues);
        } else {
            reset({ artisanID: '', name: '', description: '', category: '', price: '', quantity: '', status: 'Available' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); reset(); };
    
    const onSubmit = async (data) => {
        const promise = currentItem 
            ? apiClient.patch(`/handcrafteditem/${currentItem._id}`, data)
            : apiClient.post('/handcrafteditem', data);
        await toast.promise(promise, { loading: 'Saving item...', success: 'Item saved successfully!', error: err => err.response?.data?.message || 'Failed to save item.' })
            .then(() => {
                const fetchData = async () => { try { const res = await apiClient.get('/handcrafteditem'); setItems(res.data.data.items || []); } catch(e){} };
                fetchData();
                handleCloseModal();
            });
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this item?')) {
            const promise = apiClient.delete(`/handcrafteditem/${id}`);
            await toast.promise(promise, { loading: 'Deleting item...', success: 'Item deleted successfully!', error: err => err.response?.data?.message || 'Failed to delete.' })
                 .then(() => setItems(p => p.filter(i => i._id !== id)));
        }
    };
    
    const processedItems = useMemo(() => {
        let sortableItems = [...items];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if(sortConfig.key === 'artisanID'){ aVal = a.artisanID?.name || ''; bVal = b.artisanID?.name || ''; }
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm, sortConfig]);

    const requestSort = (key) => { let d = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') d = 'descending'; setSortConfig({ key, direction: d }); };
    const getSortIcon = (name) => { if (sortConfig.key !== name) return null; return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>; };
    const tableHeaders=[{name:"Name",key:"name",sortable:!0},{name:"Artisan",key:"artisanID",sortable:!0},{name:"Price",key:"price",sortable:!0},{name:"Quantity",key:"quantity",sortable:!0},{name:"Status",key:"status",sortable:!0},{name:"Actions",key:"actions",sortable:!1}];

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-glow">Handcrafted Items</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by item name..." />
                    <Button onClick={()=>handleOpenModal()} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/>Add Item</Button>
                </div>
            </div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))}
                data={processedItems}
                renderRow={(item, index) => (
                    <tr key={item._id} className="transition-colors hover:bg-slate-800/60" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.artisanID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className='flex gap-1'>
                            <Link to={`/items/${item._id}`}><Button variant="ghost" className="p-2 h-auto" aria-label="View Details"><Eye className="h-4 w-4"/></Button></Link>
                            <Button variant="ghost" onClick={() => handleOpenModal(item)} className="p-2 h-auto" aria-label="Edit Item"><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" onClick={() => handleDelete(item._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Delete Item"><Trash2 className="h-4 w-4"/></Button>
                        </div></td>
                    </tr>
                )}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentItem ? 'Edit Item' : 'Add New Item'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormSelectGroup label="Artisan" registration={register('artisanID')} options={artisans} error={errors.artisanID} />
                    <FormInputGroup label="Item Name" registration={register('name')} error={errors.name} />
                    <FormInputGroup label="Description" registration={register('description')} error={errors.description} />
                    <FormInputGroup label="Category" registration={register('category')} error={errors.category} />
                    <FormInputGroup label="Price (in ₹)" type="number" step="0.01" registration={register('price')} error={errors.price} />
                    <FormInputGroup label="Quantity" type="number" registration={register('quantity')} error={errors.quantity} />
                    <FormSelectGroup label="Status" registration={register('status')} options={['Available', 'Sold', 'Draft'].map(v => ({ _id: v, name: v }))} error={errors.status} />
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button><Button type="submit" loading={isSubmitting}>{currentItem ? 'Save Changes' : 'Create Item'}</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default HandcraftedItems;