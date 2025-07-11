import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { PlusCircle, User, Shield } from 'lucide-react';

// Re-using helper components
const FormInput = ({ label, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div> <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"> <option value="">Select a role</option> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> </div>);

const Operators = () => {
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        password: '',
        role: 'PortalOperator',
    });
    const [avatarFile, setAvatarFile] = useState(null);

    const fetchOperators = async () => {
        try {
            setError('');
            setLoading(true);
            const response = await apiClient.get('/adminoperator');
            setOperators(response.data.data.operators);
        } catch (err) {
            setError('Failed to fetch operators.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperators();
    }, []);

    const handleOpenModal = () => {
        setFormData({ name: '', email: '', contactNumber: '', password: '', role: 'PortalOperator' });
        setAvatarFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setAvatarFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const registrationData = new FormData();
        Object.keys(formData).forEach(key => {
            registrationData.append(key, formData[key]);
        });
        if (avatarFile) {
            registrationData.append('avatar', avatarFile);
        }
        
        try {
            // The API call is to the 'register' endpoint, not the root
            await apiClient.post('/adminoperator/register', registrationData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchOperators();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to register operator", err);
            setError(err.response?.data?.message || 'Failed to register operator.');
        }
    };

    const tableHeaders = ["", "Name", "Email", "Contact", "Role"];

    const renderOperatorRow = (operator) => (
        <tr key={operator._id}>
            <td className="px-6 py-4">
                {operator.avatar ? (
                    <img src={operator.avatar} alt={operator.name} className="h-10 w-10 rounded-full object-cover"/>
                ) : (
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{operator.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{operator.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{operator.contactNumber}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                    operator.role === 'Admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'
                }`}>
                    {operator.role === 'Admin' && <Shield className="h-3 w-3" />}
                    {operator.role}
                </span>
            </td>
        </tr>
    );

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Manage Operators</h1>
                <Button onClick={handleOpenModal} className="gap-2">
                    <PlusCircle className="h-5 w-5"/>
                    Add Operator
                </Button>
            </div>

            {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
            
            <Table headers={tableHeaders} data={operators} renderRow={renderOperatorRow} />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Register New Operator">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput name="name" label="Full Name" onChange={handleInputChange} required />
                    <FormInput name="email" label="Email Address" type="email" onChange={handleInputChange} required />
                    <FormInput name="password" label="Password" type="password" onChange={handleInputChange} required />
                    <FormInput name="contactNumber" label="Contact Number" onChange={handleInputChange} required />
                    <FormSelect name="role" label="Role" value={formData.role} onChange={handleInputChange} options={[{value: 'PortalOperator', label: 'Portal Operator'}, {value: 'Admin', label: 'Admin'}]} required />
                    <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-slate-300 mb-1">Avatar (Optional)</label>
                        <Input id="avatar" name="avatar" type="file" onChange={handleFileChange} className="file:bg-slate-700 file:text-slate-200 file:border-0 file:rounded file:py-1.5 file:px-3 file:mr-3 hover:file:bg-slate-600"/>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button type="submit">Register Operator</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Operators;