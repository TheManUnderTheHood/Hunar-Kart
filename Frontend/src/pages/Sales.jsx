import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const saleSchema = z.object({
    itemID: z.string().min(1, "An item must be selected"),
    artisanID: z.string().min(1, "An artisan must be selected"),
    platformName: z.string().min(2, "Platform name is required"),
    quantitySold: z.coerce.number({invalid_type_error: "Quantity is required"}).int().positive("Quantity must be a positive whole number"),
    totalRevenue: z.coerce.number({invalid_type_error: "Revenue is required"}).min(0, "Revenue cannot be negative"),
});

const FormInputGroup = ({ label, error, registration, ...props }) => (<div><label className="block text-sm font-medium text-text-secondary mb-1">{label}</label><Input {...props} {...registration} /><FormError message={error?.message}/></div>);
const FormSelectGroup = ({ label, error, registration, options, ...props }) => (<div><label className="block text-sm font-medium text-text-secondary mb-1">{label}</label><select {...props} {...registration} className="block w-full rounded-md border-0 bg-background-offset/50 py-2.5 px-3 text-text-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select><FormError message={error?.message}/></div>);

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(saleSchema)
    });

    const fetchData = async () => { try { setLoading(true); const [s,i,a] = await Promise.all([ apiClient.get('/sales'), apiClient.get('/handcrafteditem'), apiClient.get('/artisans') ]); setSales(s.data.data.sales || []); setItems(i.data.data.items || []); setArtisans(a.data.data.artisans || []); } catch (err) { toast.error('Failed to fetch sales data.'); } finally { setLoading(false); } };
    useEffect(() => { fetchData() }, []);
    
    const handleOpenModal = () => { reset({ itemID: '', artisanID: '', platformName: '', quantitySold: '', totalRevenue: '' }); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); reset(); };
    const onSubmit = async(data) => { await toast.promise(apiClient.post('/sales', data), { loading: 'Recording sale...', success: 'Sale recorded!', error: err => err.response?.data?.message || 'Failed to record sale.' }).then(() => { fetchData(); handleCloseModal(); }); };
    const handleDelete = async (saleId) => { if (window.confirm('ADMIN ONLY: Are you sure you want to delete this sale record?')) { await toast.promise(apiClient.delete(`/sales/${saleId}`), { loading: 'Deleting sale...', success: 'Sale deleted.', error: err => err.response?.data?.message || 'Failed to delete sale.' }).then(() => setSales(prev => prev.filter(s => s._id !== saleId))); }};

    const processedSales = useMemo(() => {
        return sales
            .filter(sale => sale.itemID?.name.toLowerCase().includes(searchTerm.toLowerCase()) || sale.platformName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => { let aVal = a[sortConfig.key], bVal = b[sortConfig.key]; if (sortConfig.key === 'itemID') { aVal = a.itemID?.name || ''; bVal = b.itemID?.name || ''; } if(sortConfig.key === 'artisanID'){ aVal = a.artisanID?.name || ''; bVal = b.artisanID?.name || ''; } if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1; if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; });
    }, [sales, searchTerm, sortConfig]);

    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending'; setSortConfig({ key, direction }); };
    const getSortIcon = (k) => { if(sortConfig.key!==k)return null;return sortConfig.direction==='ascending'?<ArrowUp className="h-3 w-3 ml-1"/>:<ArrowDown className="h-3 w-3 ml-1"/>;};
    const tableHeaders = [{ name: "Item", key: "itemID", sortable: true }, { name: "Artisan", key: "artisanID", sortable: true }, { name: "Platform", key: "platformName", sortable: true }, { name: "Qty", key: "quantitySold", sortable: true }, { name: "Revenue", key: "totalRevenue", sortable: true }, { name: "Date", key: "date", sortable: true }, { name: "Actions", key: "actions", sortable: false }];
    
    const renderRow = (sale, index) => (
        <tr key={sale._id} className="transition-colors hover:bg-background-offset" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{sale.itemID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{sale.artisanID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{sale.platformName}</td>
            <td className="px-6 py-4 text-center text-sm text-text-secondary">{sale.quantitySold}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sale.totalRevenue)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(sale.date).toLocaleDateString()}</td>
            <td className="px-6 py-4 text-center"><Button variant="ghost" onClick={() => handleDelete(sale._id)} className="p-2 h-auto text-destructive hover:bg-destructive/10" aria-label="Delete Sale"><Trash2 className="h-4 w-4"/></Button></td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-glow">Sales Records</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search item or platform..." />
                    <Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Record a Sale</Button>
                </div>
            </div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))}
                data={processedSales}
                renderRow={renderRow}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record New Sale">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormSelectGroup label="Item" registration={register('itemID')} options={items} error={errors.itemID} />
                    <FormSelectGroup label="Artisan" registration={register('artisanID')} options={artisans} error={errors.artisanID} />
                    <FormInputGroup label="Platform Name" registration={register('platformName')} error={errors.platformName} />
                    <FormInputGroup label="Quantity Sold" type="number" registration={register('quantitySold')} error={errors.quantitySold} />
                    <FormInputGroup label="Total Revenue (₹)" type="number" step="0.01" registration={register('totalRevenue')} error={errors.totalRevenue} />
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button><Button type="submit" loading={isSubmitting}>Record Sale</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default Sales;