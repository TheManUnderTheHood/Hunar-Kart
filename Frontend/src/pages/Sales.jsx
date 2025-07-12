import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
const FormInput = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select></div>);

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ itemID: '', artisanID: '', platformName: '', quantitySold: '', totalRevenue: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
    
    useEffect(() => {
        const fetchData = async () => {
            try { setLoading(true); const [s, i, a] = await Promise.all([ apiClient.get('/sales'), apiClient.get('/handcrafteditem'), apiClient.get('/artisans') ]); setSales(s.data.data.sales || []); setItems(i.data.data.items || []); setArtisans(a.data.data.artisans || []); }
            catch (err) { toast.error('Failed to fetch sales data.'); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);
    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const promise = apiClient.post('/sales', { ...formData, quantitySold: Number(formData.quantitySold), totalRevenue: Number(formData.totalRevenue) });
        toast.promise(promise, {
            loading: 'Recording sale...',
            success: 'Sale recorded successfully!',
            error: err => err.response?.data?.message || 'Failed to record sale.'
        }).then(() => { fetchData(); handleCloseModal(); }).finally(() => setIsSubmitting(false));
    };
    
    const handleDelete = async (saleId) => {
        if (window.confirm('ADMIN ONLY: Are you sure you want to delete this sale record?')) {
            const promise = apiClient.delete(`/sales/${saleId}`);
            toast.promise(promise, {
                loading: 'Deleting sale...',
                success: 'Sale deleted.',
                error: err => err.response?.data?.message || 'Failed to delete sale.'
            }).then(() => setSales(prev => prev.filter(s => s._id !== saleId)));
        }
    };

    const processedSales = useMemo(() => {
        return sales
            .filter(sale => sale.itemID?.name.toLowerCase().includes(searchTerm.toLowerCase()) || sale.platformName.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (sortConfig.key === 'itemID') { aVal = a.itemID?.name || ''; bVal = b.itemID?.name || ''; }
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
    }, [sales, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
    };

    const tableHeaders = [{ name: "Item", key: "itemID", sortable: true }, { name: "Artisan", key: "artisanID", sortable: true }, { name: "Platform", key: "platformName", sortable: true }, { name: "Quantity", key: "quantitySold", sortable: true }, { name: "Revenue", key: "totalRevenue", sortable: true }, { name: "Date", key: "date", sortable: true }, { name: "Actions", key: "actions", sortable: false }];
    
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap"><h1 className="text-3xl font-bold text-white">Sales Records</h1><div className="flex items-center gap-2"><SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by item or platform..." /><Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Record a Sale</Button></div></div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))}
                data={processedSales}
                renderRow={(sale) => (
                    <tr key={sale._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.itemID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.artisanID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.platformName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.quantitySold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(sale.totalRevenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><Button variant="ghost" onClick={() => handleDelete(sale._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Delete Sale"><Trash2 className="h-4 w-4"/></Button></td>
                    </tr>
                )}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record New Sale">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="itemID" label="Item" value={formData.itemID} onChange={handleInputChange} options={items} required />
                    <FormSelect name="artisanID" label="Artisan" value={formData.artisanID} onChange={handleInputChange} options={artisans} required />
                    <FormInput name="platformName" label="Platform Name" value={formData.platformName} onChange={handleInputChange} required />
                    <FormInput name="quantitySold" type="number" label="Quantity Sold" value={formData.quantitySold} onChange={handleInputChange} required />
                    <FormInput name="totalRevenue" type="number" step="0.01" label="Total Revenue (₹)" value={formData.totalRevenue} onChange={handleInputChange} required />
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button type="submit" loading={isSubmitting}>Record Sale</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default Sales;