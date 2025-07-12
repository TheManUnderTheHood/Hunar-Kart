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
    quantitySold: z.coerce.number().int().positive("Quantity must be a positive number"),
    totalRevenue: z.coerce.number().min(0, "Revenue cannot be negative"),
});

const FormInputGroup = ({ label, error, registration, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} {...registration} /><FormError message={error?.message}/></div>);
const FormSelectGroup = ({ label, error, registration, options, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} {...registration} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select><FormError message={error?.message}/></div>);

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

    const fetchData = async () => { try { setLoading(true); const [s,i,a]=await Promise.all([apiClient.get('/sales'),apiClient.get('/handcrafteditem'),apiClient.get('/artisans')]); setSales(s.data.data.sales||[]);setItems(i.data.data.items||[]);setArtisans(a.data.data.artisans||[]); } catch(e){ toast.error('Failed to fetch data.'); } finally{ setLoading(false); } };
    useEffect(() => { fetchData() }, []);

    const handleOpenModal = () => { reset({ itemID:'',artisanID:'',platformName:'',quantitySold:'',totalRevenue:'' }); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); reset(); };
    const onSubmit = async(data) => { await toast.promise(apiClient.post('/sales', data), { loading: 'Recording...', success: 'Sale recorded!', error: e=>e.response?.data?.message||'Failed.' }).then(()=>{fetchData();handleCloseModal()}); };
    const handleDelete = async (id) => { if(window.confirm('ADMIN ONLY: Delete?')){await toast.promise(apiClient.delete(`/sales/${id}`), { loading: 'Deleting...', success: 'Deleted.', error: e=>e.response?.data?.message||'Failed.' }).then(()=>setSales(p=>p.filter(s=>s._id!==id))); }};
    const processedSales = useMemo(() => { let s=[...sales]; s.sort((a,b)=>{let x=a[sortConfig.key],y=b[sortConfig.key]; if(sortConfig.key==='itemID'){x=a.itemID?.name||'';y=b.itemID?.name||''} if(x<y)return sortConfig.direction==='ascending'?-1:1; if(x>y)return sortConfig.direction==='ascending'?1:-1; return 0;}); return s.filter(s => s.itemID?.name.toLowerCase().includes(searchTerm.toLowerCase())||s.platformName.toLowerCase().includes(searchTerm.toLowerCase()))},[sales,searchTerm,sortConfig]);
    const requestSort = (k) => { let d='ascending';if(sortConfig.key===k&&sortConfig.direction==='ascending')d='descending';setSortConfig({key:k,direction:d}) };
    const getSortIcon = (k) => { if(sortConfig.key!==k)return null;return sortConfig.direction==='ascending'?<ArrowUp className="h-3 w-3 ml-1"/>:<ArrowDown className="h-3 w-3 ml-1"/>;};
    const tableHeaders = [{ name: "Item", key: "itemID", sortable: true }, { name: "Artisan", key: "artisanID", sortable: true }, { name: "Platform", key: "platformName", sortable: true }, { name: "Qty", key: "quantitySold", sortable: true }, { name: "Revenue", key: "totalRevenue", sortable: true }, { name: "Date", key: "date", sortable: true }, { name: "Actions", key: "actions", sortable: false }];
    
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap"><h1 className="text-3xl font-bold text-white">Sales Records</h1><div className="flex items-center gap-2"><SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search item or platform..." /><Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Record a Sale</Button></div></div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))}
                data={processedSales}
                renderRow={(sale) => (<tr key={sale._id} className="transition-colors hover:bg-slate-800/60"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.itemID?.name||'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.artisanID?.name||'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.platformName}</td><td className="px-6 py-4 text-center text-sm text-slate-300">{sale.quantitySold}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR'}).format(sale.totalRevenue)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(sale.date).toLocaleDateString()}</td><td className="px-6 py-4 text-center"><Button variant="ghost" onClick={() => handleDelete(sale._id)} className="p-2 h-auto text-red-500"><Trash2 className="h-4 w-4"/></Button></td></tr>)}
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