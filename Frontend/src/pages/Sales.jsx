import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input'; // Import for helper components
import { PlusCircle, Trash2 } from 'lucide-react';

// --- Re-using helper components (no changes) ---
const FormInput = ({ label, ...props }) => ( <div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div> <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"> <option value="">Select an option</option> {options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)} </select> </div>);

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [items, setItems] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        itemID: '',
        artisanID: '',
        platformName: '',
        quantitySold: '',
        totalRevenue: ''
    });
    
    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [salesRes, itemsRes, artisansRes] = await Promise.all([
                apiClient.get('/sales'),
                apiClient.get('/handcrafteditem'),
                apiClient.get('/artisans')
            ]);

            // **IMPROVEMENT 1: Ensure state is always an array**
            setSales(salesRes.data.data.sales || []);
            setItems(itemsRes.data.data.items || []);
            setArtisans(artisansRes.data.data.artisans || []);
            
        } catch (err) {
            console.error('Failed to fetch sales page data:', err);
            setError('Failed to fetch data needed for this page. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => { fetchData() }, []);
    
    const handleOpenModal = () => {
        // **IMPROVEMENT 2: Log state right before opening the modal**
        console.log("Opening Sale Modal. Current state:");
        console.log("Items:", items);
        console.log("Artisans:", artisans);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        // **IMPROVEMENT 3: Add more robust validation before sending**
        const payload = {
            ...formData,
            quantitySold: parseInt(formData.quantitySold, 10),
            totalRevenue: parseFloat(formData.totalRevenue)
        };
        if (isNaN(payload.quantitySold) || isNaN(payload.totalRevenue)) {
            setError("Quantity and Revenue must be valid numbers.");
            return;
        }

        try {
            await apiClient.post('/sales', payload);
            fetchData();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to record sale:", err);
            setError(err.response?.data?.message || 'Failed to record sale.');
        }
    };
    
    const handleDelete = async (saleId) => {
        if (window.confirm('ADMIN ONLY: Are you sure you want to delete this sale record?')) {
            try {
                await apiClient.delete(`/sales/${saleId}`);
                fetchData();
            } catch (err) {
                console.error("Failed to delete sale:", err);
                setError(err.response?.data?.message || 'You may not be authorized to delete sales.');
            }
        }
    };
    
    // --- RENDER LOGIC ---

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    // If there's a fatal error in fetching dropdown data, don't even try to render the table.
    if (error && items.length === 0 && artisans.length === 0) {
        return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">Error: {error}</div>;
    }

    const tableHeaders = ["Item", "Artisan", "Platform", "Quantity", "Revenue", "Date", "Actions"];
    
    const renderRow = (sale) => (
        <tr key={sale._id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.itemID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.artisanID?.name || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.platformName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.quantitySold}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">${sale.totalRevenue ? parseFloat(sale.totalRevenue).toFixed(2) : '0.00'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Button variant="ghost" onClick={() => handleDelete(sale._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
            </td>
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Sales Records</h1>
                <Button onClick={handleOpenModal} className="gap-2"><PlusCircle className="h-5 w-5"/> Record a Sale</Button>
            </div>
            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
            <Table headers={tableHeaders} data={sales} renderRow={renderRow} />
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Record New Sale">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="itemID" label="Item" value={formData.itemID} onChange={handleInputChange} options={items || []} required />
                    <FormSelect name="artisanID" label="Artisan" value={formData.artisanID} onChange={handleInputChange} options={artisans || []} required />
                    <FormInput name="platformName" label="Platform Name" value={formData.platformName} onChange={handleInputChange} required />
                    <FormInput name="quantitySold" type="number" label="Quantity Sold" value={formData.quantitySold} onChange={handleInputChange} required />
                    <FormInput name="totalRevenue" type="number" label="Total Revenue ($)" value={formData.totalRevenue} onChange={handleInputChange} required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Record Sale</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Sales;