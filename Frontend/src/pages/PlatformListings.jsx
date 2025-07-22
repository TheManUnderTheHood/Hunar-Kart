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
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const listingSchema = z.object({
    itemID: z.string().min(1, "An item must be selected"),
    platformName: z.string().min(2, "Platform name is required"),
    listingURL: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
    status: z.enum(['Active', 'Inactive'])
});

const FormInputGroup = ({ label, error, registration, ...props }) => (<div><label className="block text-sm font-medium text-text-secondary mb-1">{label}</label><Input {...props} {...registration} /><FormError message={error?.message}/></div>);
const FormSelectGroup = ({ label, error, registration, options, ...props }) => (<div><label className="block text-sm font-medium text-text-secondary mb-1">{label}</label><select {...props} {...registration} className="block w-full rounded-md border-0 bg-background-offset/50 py-2.5 px-3 text-text-primary shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id || opt.value} value={opt._id || opt.value}>{opt.name || opt.label}</option>)}</select><FormError message={error?.message}/></div>);

const PlatformListings = () => {
    const [listings, setListings] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentListing, setCurrentListing] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'listingDate', direction: 'descending' });
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: zodResolver(listingSchema),
        defaultValues: { status: 'Active' }
    });

    useEffect(() => { const fetchData = async () => { try{ setLoading(true); const [l, i] = await Promise.all([ apiClient.get('/platformlisting'), apiClient.get('/handcrafteditem') ]); setListings(l.data.data.listings||[]); setItems(i.data.data.items||[]); } catch (err) { toast.error('Failed to fetch data.'); } finally { setLoading(false); }}; fetchData(); }, []);
    
    const handleOpenModal = (listing = null) => { setCurrentListing(listing); if(listing){ reset({ ...listing, itemID: listing.itemID._id }); } else { reset({ itemID: '', platformName: '', listingURL: '', status: 'Active' }); } setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); reset(); };
    
    const onSubmit = async (data) => { await toast.promise(currentListing ? apiClient.patch(`/platformlisting/${currentListing._id}`, data) : apiClient.post('/platformlisting', data), { loading: 'Saving...', success: 'Saved!', error: e=>e.response?.data?.message||'Failed.' }).then(()=>{fetchData();handleCloseModal()}); };
    const handleDelete = async (id) => { if (window.confirm('Are you sure?')) { await toast.promise(apiClient.delete(`/platformlisting/${id}`),{loading:'Deleting...',success:'Deleted!',error:'Failed.'}).then(()=>setListings(p=>p.filter(l=>l._id!==id)))}};
    
    const processedListings = useMemo(() => { let d=[...listings];d.sort((a,b)=>{let x=a[sortConfig.key],y=b[sortConfig.key];if(sortConfig.key==='itemID'){x=a.itemID?.name.toLowerCase()||'';y=b.itemID?.name.toLowerCase()||''}if(x<y)return sortConfig.direction==='ascending'?-1:1;if(x>y)return sortConfig.direction==='ascending'?1:-1;return 0;});return d.filter(l=>l.itemID?.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.platformName.toLowerCase().includes(searchTerm.toLowerCase()));}, [listings, searchTerm, sortConfig]);
    const requestSort=(k)=>{let d='ascending';if(sortConfig.key===k&&sortConfig.direction==='ascending')d='descending';setSortConfig({key:k,direction:d})};
    const getSortIcon=(k)=>{if(sortConfig.key!==k)return null; return sortConfig.direction==='ascending'?<ArrowUp className="h-3 w-3 ml-1"/>:<ArrowDown className="h-3 w-3 ml-1"/>;};
    const tableHeaders = [{ name: "Item", key: "itemID", sortable: true }, { name: "Platform", key: "platformName", sortable: true }, { name: "Status", key: "status", sortable: true }, { name: "URL", key: "listingURL", sortable: false }, { name: "Actions", key: "actions", sortable: false }];
    
    const renderRow = (listing, index) => (
        <tr key={listing._id} className="transition-colors hover:bg-background-offset" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{listing.itemID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{listing.platformName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{listing.status}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary max-w-xs truncate"><a href={listing.listingURL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{listing.listingURL}</a></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className='flex gap-1'><Button variant="ghost" onClick={() => handleOpenModal(listing)} className="p-2 h-auto"><Edit className="h-4 w-4"/></Button><Button variant="ghost" onClick={() => handleDelete(listing._id)} className="p-2 h-auto text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></Button></div></td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap"><h1 className="text-3xl font-bold text-glow">Platform Listings</h1><div className="flex items-center gap-2"><SearchInput value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search item or platform..."/><Button onClick={() => handleOpenModal()} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/>Add Listing</Button></div></div>
            <Table headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name} {getSortIcon(h.key)}</div>))} data={processedListings} renderRow={renderRow} />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentListing ? 'Edit Listing' : 'Add New Listing'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormSelectGroup label="Item" registration={register('itemID')} options={items} error={errors.itemID} />
                    <FormInputGroup label="Platform Name" registration={register('platformName')} error={errors.platformName} />
                    <FormInputGroup label="Listing URL" registration={register('listingURL')} error={errors.listingURL} />
                    <FormSelectGroup label="Status" registration={register('status')} options={[{_id:'Active',name:'Active'},{_id:'Inactive',name:'Inactive'}]} error={errors.status}/>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button><Button type="submit" loading={isSubmitting}>{currentListing ? 'Save Changes' : 'Create Listing'}</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default PlatformListings;