import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Edit2 } from 'lucide-react';

const FormInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <Input {...props} />
    </div>
);

const Profile = () => {
    // Note: The AuthContext doesn't see these changes until the next login/refresh.
    // For a fully dynamic update, AuthContext would need a 'refetchUser' function.
    const { user } = useAuth();

    const [details, setDetails] = useState({ name: user?.name || '', contactNumber: user?.contactNumber || '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || null);
    
    const [isDetailsSubmitting, setIsDetailsSubmitting] = useState(false);
    const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleDetailsChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });
    
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file)); // Create a temporary URL for preview
        }
    };
    
    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setIsDetailsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');
        try {
            await apiClient.patch('/adminoperator/update-account', details);
            setSuccessMessage('Account details updated! Changes will be fully visible on your next login.');
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to update details.');
        } finally {
            setIsDetailsSubmitting(false);
        }
    };
    
    const handleUpdateAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) return;

        setIsAvatarSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');
        
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        try {
            await apiClient.patch('/adminoperator/update-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMessage('Avatar updated! Changes will be fully visible on your next login.');
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to update avatar.');
        } finally {
            setIsAvatarSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>
            
            {successMessage && <div className="bg-green-500/10 text-green-400 p-3 rounded-md mb-6">{successMessage}</div>}
            {errorMessage && <div className="bg-red-500/10 text-red-400 p-3 rounded-md mb-6">{errorMessage}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Card */}
                <div className="lg:col-span-1">
                    <Card>
                        <form onSubmit={handleUpdateAvatar} className="flex flex-col items-center gap-4">
                            <h2 className="text-xl font-semibold text-white mb-2">Profile Picture</h2>
                            <div className="relative">
                                {previewAvatar ? (
                                    <img src={previewAvatar} alt="Avatar Preview" className="h-40 w-40 rounded-full object-cover border-2 border-slate-600"/>
                                ) : (
                                    <div className="h-40 w-40 rounded-full bg-slate-700 flex items-center justify-center"><User className="w-16 h-16 text-slate-500"/></div>
                                )}
                                <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer bg-primary p-2 rounded-full text-white hover:bg-primary-hover">
                                    <Edit2 className="w-4 h-4"/>
                                    <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange}/>
                                </label>
                            </div>
                            <Button type="submit" loading={isAvatarSubmitting} disabled={!avatarFile}>
                                Upload New Avatar
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Details Card */}
                <div className="lg:col-span-2">
                    <Card>
                         <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
                        <form onSubmit={handleUpdateDetails} className="space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                               <Input type="email" value={user?.email || ''} disabled className="bg-slate-800 cursor-not-allowed"/>
                            </div>
                            <FormInput name="name" label="Full Name" value={details.name} onChange={handleDetailsChange} required/>
                            <FormInput name="contactNumber" label="Contact Number" value={details.contactNumber} onChange={handleDetailsChange} required/>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" loading={isDetailsSubmitting}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;