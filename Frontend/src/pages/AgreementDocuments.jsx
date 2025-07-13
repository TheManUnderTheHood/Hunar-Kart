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
import { PlusCircle, Trash2, Download, ArrowUp, ArrowDown } from 'lucide-react';

const agreementSchema = z.object({
    artisanID: z.string().min(1, "An artisan must be selected"),
    dateSigned: z.string().min(1, "Date signed is required"),
    validUntil: z.string().optional(),
    agreementFile: z.any().refine(files => files?.length > 0, "Agreement file is required."),
});

const FormInputGroup = ({ label, error, registration, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} {...registration} /><FormError message={error?.message}/></div>);
const FormSelectGroup = ({ label, error, registration, options, ...props }) => (<div><label className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} {...registration} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"><option value="">Select an option</option>{options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)}</select><FormError message={error?.message}/></div>);

const AgreementDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dateSigned', direction: 'descending' });
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(agreementSchema)
    });
    
    useEffect(() => { const fetchData=async()=>{try{setLoading(true);const[d,a]=await Promise.all([apiClient.get('/agreementdocument'),apiClient.get('/artisans')]);setDocuments(d.data.data.documents||[]);setArtisans(a.data.data.artisans||[])}catch(e){toast.error('Failed to fetch data.')}finally{setLoading(false)}};fetchData() }, []);
    
    const handleOpenModal = () => { reset(); setIsModalOpen(true); };
    const handleCloseModal = () => { reset(); setIsModalOpen(false); };
    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append('agreementFile', data.agreementFile[0]);
        formData.append('artisanID', data.artisanID);
        formData.append('dateSigned', data.dateSigned);
        if (data.validUntil) formData.append('validUntil', data.validUntil);
        await toast.promise(apiClient.post('/agreementdocument',formData,{headers:{'Content-Type':'multipart/form-data'}}),{loading:'Uploading...',success:'Uploaded!',error:e=>e.response?.data?.message||'Upload failed.'}).then(()=>{fetchData();handleCloseModal()});
    };
    const handleDelete = async(id)=>{if(window.confirm('Delete?')){await toast.promise(apiClient.delete(`/agreementdocument/${id}`),{loading:'Deleting...',success:'Deleted!',error:'Failed.'}).then(()=>setDocuments(p=>p.filter(d=>d._id!==id)))}};
    const processedDocuments=useMemo(()=>{let d=[...documents];d.sort((a,b)=>{let x=a[sortConfig.key],y=b[sortConfig.key];if(sortConfig.key==='artisanID'){x=a.artisanID?.name||'';y=b.artisanID?.name||''}if(x<y)return sortConfig.direction==='ascending'?-1:1;if(x>y)return sortConfig.direction==='ascending'?1:-1;return 0;});return d.filter(d=>d.artisanID?.name.toLowerCase().includes(searchTerm.toLowerCase()));},[documents,searchTerm,sortConfig]);
    const requestSort=(k)=>{let d='ascending';if(sortConfig.key===k&&sortConfig.direction==='ascending')d='descending';setSortConfig({key:k,direction:d})};
    const getSortIcon=(k)=>{if(sortConfig.key!==k)return null;return sortConfig.direction==='ascending'?<ArrowUp className="h-3 w-3 ml-1"/>:<ArrowDown className="h-3 w-3 ml-1"/>;};
    const tableHeaders=[{name:"Artisan",key:"artisanID",sortable:!0},{name:"Date Signed",key:"dateSigned",sortable:!0},{name:"Valid Until",key:"validUntil",sortable:!0},{name:"Actions",key:"actions",sortable:!1}];

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4"><h1 className="text-3xl font-bold text-glow">Agreement Documents</h1><div className="flex items-center gap-2"><SearchInput value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search by artisan name..."/><Button onClick={handleOpenModal} className="gap-2 shrink-0"><PlusCircle className="h-5 w-5"/> Add Document</Button></div></div>
            <Table
                headers={tableHeaders.map(h => (<div onClick={() => h.sortable && requestSort(h.key)} className={`flex items-center ${h.sortable ? 'cursor-pointer' : ''}`}>{h.name}{getSortIcon(h.key)}</div>))}
                data={processedDocuments}
                renderRow={(doc, index) => (
                    <tr key={doc._id} className="transition-colors hover:bg-slate-800/60" style={{ animation: 'tableRowFadeIn 0.5s ease-out forwards', animationDelay: `${index * 0.03}s`, opacity: 0 }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc.artisanID?.name||'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(doc.dateSigned).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{doc.validUntil?new Date(doc.validUntil).toLocaleDateString():'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex gap-2"><a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-ghost p-2 h-auto"><Download className="h-4 w-4"/></a><Button variant="ghost" onClick={() => handleDelete(doc._id)} className="p-2 h-auto text-red-500"><Trash2 className="h-4 w-4"/></Button></div></td>
                    </tr>
                )}
            />
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Upload New Agreement">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormSelectGroup label="Artisan" registration={register('artisanID')} options={artisans} error={errors.artisanID}/>
                    <FormInputGroup label="Date Signed" type="date" registration={register('dateSigned')} error={errors.dateSigned} />
                    <FormInputGroup label="Valid Until (Optional)" type="date" registration={register('validUntil')} error={errors.validUntil} />
                    <div><label htmlFor="agreementFile" className="block text-sm font-medium text-slate-300 mb-1">Agreement File (PDF, etc.)</label><Input id="agreementFile" type="file" {...register('agreementFile')} className="file:bg-slate-700 file:text-slate-200 file:border-0 file:rounded file:py-1.5 file:px-3 file:mr-3 hover:file:bg-slate-600"/><FormError message={errors.agreementFile?.message}/></div>
                    <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button><Button type="submit" loading={isSubmitting}>Upload Document</Button></div>
                </form>
            </Modal>
        </div>
    );
};
export default AgreementDocuments;