import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, User, Shield, ArrowUp, ArrowDown } from 'lucide-react';

const FormInput = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select a role</option>{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>);

const Operators = () => {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', contactNumber: '', password: '', role: 'PortalOperator' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const fetchOperators = async () => {
        try { setLoading(true); const res = await apiClient.get('/adminoperator'); setOperators(res.data.data.operators || []); }
        catch (e) { toast.error('Failed to fetch operators.'); }
        finally { setLoading(false); }
    };
    
    useEffect(() => { fetchOperators(); }, []);

    const handleOpenModal = () => { setFormData({ name: '', email: '', contactNumber: '', password: '', role: 'PortalOperator' }); setAvatarFile(null); setIsModalOpen(true); };
    const handleCloseModal = () => setIsModalOpen(false);
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setAvatarFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const registrationData = new FormData();
        Object.keys(formData).forEach(key => registrationData.append(key, formData[key]));
        if (avatarFile) { registrationData.append('avatar', avatarFile); }
        
        const promise = apiClient.post('/adminoperator/register', registrationData, { headers: { 'Content-Type': 'multipart/form-data' } });
        
        toast.promise(promise, {
            loading: 'Registering new operator...',
            success: 'Operator registered successfully!',
            error: err => err.response?.data?.message || 'Failed to register operator.'
        }).then(() => { fetchOperators(); handleCloseModal(); }).finally(() => setIsSubmitting(false));
    };

    const processedOperators = useMemo(() => {
        let sortableItems = [...operators];
        sortableItems.sort((a,b)=>{ let x=a[sortConfig.key]?.toLowerCase()||''; let y=b[sortConfig.key]?.toLowerCase()||''; if(x<y)return sortConfig.direction==='ascending'?-1:1; if(x>y)return sortConfig.direction==='ascending'?1:-1; return 0; });
        return sortableItems.filter(op=>op.name.toLowerCase().includes(searchTerm.toLowerCase())||op.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [operators, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let dir='ascending';
        if(sortConfig.key === key && sortConfig.direction === 'ascending') dir = 'descending';
        setSortConfig({ key: key, direction: dir });
    };
    const getSortIcon = (name) => {
        if(sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
    };
    
    const tableHeaders = [{ name: "", key: "avatar", sortable: false }, { name: "Name", key: "name", sortable: true }, { name: "Email", key: "email", sortable: true }, { name: "Contact", key: "contactNumber", sortable: false }, { name: "Role", key: "role", sortable: true }];
    
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Manage Operators</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." />
                    <Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/>Add Operator</Button>
                </div>
            </div>
            
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name}{getSortIcon(h.key)}</div>))}
                data={processedOperators}
                renderRow={(op) => (
                    <tr key={op._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4">{op.avatar ? <img src={op.avatar} alt={op.name} className="h-10 w-10 rounded-full object-cover"/> : <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center"><User className="h-5 w-5 text-slate-400"/></div>}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{op.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{op.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{op.contactNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${op.role === 'Admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>{op.role === 'Admin' && <Shield className="h-3 w-3" />}{op.role}</span></td>
                    </tr>
                )}
            />
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Register New Operator">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="name" label="Full Name" onChange={handleInputChange} required />
                    <FormInput name="email" label="Email Address" type="email" onChange={handleInputChange} required />
                    <FormInput name="password" label="Password" type="password" onChange={handleInputChange} required minLength={6} />
                    <FormInput name="contactNumber" label="Contact Number" onChange={handleInputChange} required />
                    <FormSelect name="role" label="Role" value={formData.role} onChange={handleInputChange} options={[{value: 'PortalOperator', label: 'Portal Operator'}, {value: 'Admin', label: 'Admin'}]} required />
                    <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-slate-300 mb-1">Avatar (Optional)</label>
                        <Input id="avatar" name="avatar" type="file" onChange={handleFileChange} className="file:bg-slate-700 file:text-slate-200 file:border-0 file:rounded file:py-1.5 file:px-3 file:mr-3 hover:file:bg-slate-600"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button type="submit" loading={isSubmitting}>Register Operator</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default Operators;