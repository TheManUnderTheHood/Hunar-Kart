import { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import { PlusCircle, Trash2, Download, ArrowUp, ArrowDown } from 'lucide-react';

const FormInput = ({ label, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select></div>);

const AgreementDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ artisanID: '', dateSigned: '', validUntil: '' });
    const [file, setFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dateSigned', direction: 'descending' });
    
    useEffect(() => {
        const fetchData = async () => {
            try { setLoading(true); const [docsRes, artisansRes] = await Promise.all([apiClient.get('/agreementdocument'), apiClient.get('/artisans')]); setDocuments(docsRes.data.data.documents || []); setArtisans(artisansRes.data.data.artisans || []); }
            catch(e) { toast.error('Failed to fetch agreement data.') } 
            finally { setLoading(false) }
        };
        fetchData();
    }, []);
    
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => { setIsModalOpen(false); setFile(null); setFormData({ artisanID: '', dateSigned: '', validUntil: '' }); };
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { toast.error('Please select a file to upload.'); return; }
        
        setIsSubmitting(true);
        const data = new FormData();
        data.append('agreementFile', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        const promise = apiClient.post('/agreementdocument', data, { headers: { 'Content-Type': 'multipart/form-data' } });

        toast.promise(promise, {
            loading: 'Uploading document...',
            success: 'Document uploaded successfully!',
            error: err => err.response?.data?.message || 'Upload failed.'
        }).then(() => { fetchData(); handleCloseModal(); }).finally(() => setIsSubmitting(false));
    };

    const handleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this agreement?')) {
            const promise = apiClient.delete(`/agreementdocument/${docId}`);
            toast.promise(promise, {
                loading: 'Deleting...',
                success: 'Document deleted.',
                error: 'Failed to delete document.'
            }).then(() => setDocuments(p => p.filter(d => d._id !== docId)));
        }
    };
    
    const processedDocuments = useMemo(() => {
        let sortableItems = [...documents];
        sortableItems.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if(sortConfig.key === 'artisanID') { aVal = a.artisanID?.name.toLowerCase() || ''; bVal = b.artisanID?.name.toLowerCase() || ''; }
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems.filter(doc => doc.artisanID?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [documents, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let dir = 'ascending';
        if(sortConfig.key === key && sortConfig.direction === 'ascending') dir = 'descending';
        setSortConfig({ key, dir });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1"/> : <ArrowDown className="h-3 w-3 ml-1"/>;
    };
    
    const tableHeaders = [
        { name: "Artisan", key: "artisanID", sortable: true },
        { name: "Date Signed", key: "dateSigned", sortable: true },
        { name: "Valid Until", key: "validUntil", sortable: true },
        { name: "Actions", key: "actions", sortable: false },
    ];
    
    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Agreement Documents</h1>
                <div className="flex items-center gap-2">
                    <SearchInput value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search by artisan name..."/>
                    <Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Add Document</Button>
                </div>
            </div>
            
            <Table
                headers={tableHeaders.map(h=>(<div onClick={()=>h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable?'cursor-pointer':''}`}>{h.name}{getSortIcon(h.key)}</div>))}
                data={processedDocuments}
                renderRow={(doc) => (
                    <tr key={doc._id} className="transition-colors hover:bg-slate-800/60">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.artisanID?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(doc.dateSigned).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{doc.validUntil ? new Date(doc.validUntil).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex gap-2"><a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-ghost p-2 h-auto"><Download className="h-4 w-4"/></a><Button variant="ghost" onClick={() => handleDelete(doc._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button></div></td>
                    </tr>
                )}
            />
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Upload New Agreement">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormSelect name="artisanID" label="Artisan" value={formData.artisanID} onChange={handleInputChange} options={artisans} required/>
                    <FormInput name="dateSigned" label="Date Signed" type="date" value={formData.dateSigned} onChange={handleInputChange} required />
                    <FormInput name="validUntil" label="Valid Until (Optional)" type="date" value={formData.validUntil} onChange={handleInputChange} />
                    <div>
                        <label htmlFor="agreementFile" className="block text-sm font-medium text-slate-300 mb-1">Agreement File (PDF, etc.)</label>
                        <Input id="agreementFile" name="agreementFile" type="file" onChange={handleFileChange} required className="file:bg-slate-700 file:text-slate-200 file:border-0 file:rounded file:py-1.5 file:px-3 file:mr-3 hover:file:bg-slate-600"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button><Button type="submit" loading={isSubmitting}>Upload Document</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default AgreementDocuments;