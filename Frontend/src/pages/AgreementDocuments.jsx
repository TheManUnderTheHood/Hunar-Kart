import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input'; // Assuming Input is still needed for form helpers
import { PlusCircle, Trash2, Download } from 'lucide-react';

// --- Form Helper Components (no changes needed here) ---
const FormInput = ({ label, ...props }) => ( <div><label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><Input {...props} /></div>);
const FormSelect = ({ label, options, ...props }) => (<div> <label htmlFor={props.id || props.name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label><select {...props} className="block w-full rounded-md border-0 bg-slate-700/50 py-2.5 px-3 text-slate-100 shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-primary-focus sm:text-sm sm:leading-6"> <option value="">Select an option</option> {options.map(opt => <option key={opt._id} value={opt._id}>{opt.name}</option>)} </select> </div>);

const AgreementDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ artisanID: '', dateSigned: '', validUntil: '' });
    const [file, setFile] = useState(null);

    // --- Data Fetching (no changes here, but good to review) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(''); // Reset error on new fetch
            const [docsRes, artisansRes] = await Promise.all([
                apiClient.get('/agreementdocument'),
                apiClient.get('/artisans')
            ]);
            
            // **IMPROVEMENT 1: Log the fetched data to inspect it**
            console.log("Fetched documents:", docsRes.data.data.documents);

            setDocuments(docsRes.data.data.documents || []); // Ensure documents is always an array
            setArtisans(artisansRes.data.data.artisans || []); // Ensure artisans is always an array
        } catch (err) {
            console.error('Failed to fetch agreement data:', err); // Log the full error
            setError('Failed to fetch data. See console for details.');
        } finally { 
            setLoading(false);
        }
    };
    
    useEffect(() => { 
        fetchData();
    }, []);
    
    // --- Modal and Form Handlers (no changes needed) ---
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => { setIsModalOpen(false); setFile(null); setFormData({ artisanID: '', dateSigned: '', validUntil: '' }); };
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        const data = new FormData();
        data.append('agreementFile', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        try {
            await apiClient.post('/agreementdocument', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload document.');
        }
    };

    const handleDelete = async (docId) => {
        if (window.confirm('Are you sure you want to delete this agreement?')) {
            try {
                await apiClient.delete(`/agreementdocument/${docId}`);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete document.');
            }
        }
    };
    
    const tableHeaders = ["Artisan", "Date Signed", "Valid Until", "Actions"];
    
    // **IMPROVEMENT 2: Wrap the component return in a try-catch to catch render errors**
    try {
        if (loading) return <div className="flex h-full items-center justify-center"><Spinner size="lg" /></div>;
        
        // This is not a render error, but a data-fetching error. Show it clearly.
        if (error && documents.length === 0) {
            return <div className="text-red-500 bg-red-500/10 p-4 rounded-md">Error: {error}</div>;
        }
        
        // --- This is the MAIN RENDER block that might be failing ---
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">Agreement Documents</h1>
                    <Button onClick={handleOpenModal} className="gap-2"><PlusCircle className="h-5 w-5"/> Add Document</Button>
                </div>
                {/* Show persistent errors even if there's old data */}
                {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                
                <Table 
                    headers={tableHeaders} 
                    data={documents} 
                    renderRow={(doc) => (
                        <tr key={doc?._id || Math.random()}>
                            {/* Adding more checks to be safe */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{doc?.artisanID?.name || 'Artisan Not Found'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{doc?.dateSigned ? new Date(doc.dateSigned).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{doc?.validUntil ? new Date(doc.validUntil).toLocaleDateString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                    <a href={doc?.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-ghost p-2 h-auto"><Download className="h-4 w-4"/></a>
                                    <Button variant="ghost" onClick={() => handleDelete(doc._id)} className="p-2 h-auto text-red-500 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </td>
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
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button type="submit">Upload Document</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        );

    } catch (renderError) {
        // **IMPROVEMENT 3: If an error happens DURING render, show this fallback UI**
        console.error("A critical render error occurred in AgreementDocuments:", renderError);
        return <div className="p-4 rounded-md bg-red-900 text-white">
            <h2 className="font-bold text-lg">Component Error</h2>
            <p>A critical error prevented this page from loading. Please check the browser console for more details.</p>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{renderError.toString()}</pre>
        </div>
    }
};

export default AgreementDocuments;