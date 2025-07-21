import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormError from '../components/ui/FormError';
import { User, Edit2 } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    contactNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit number"),
});

const Profile = () => {
    const { user } = useAuth();
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || null);
    const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || '', contactNumber: user?.contactNumber || '' }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) { setAvatarFile(file); setPreviewAvatar(URL.createObjectURL(file)); }
    };
    
    const onDetailsSubmit = async (data) => {
        await toast.promise(apiClient.patch('/adminoperator/update-account', data), {
            loading: 'Updating details...',
            success: 'Details updated! Changes visible on next login.',
            error: err => err.response?.data?.message || 'Update failed.'
        });
    };
    
    const handleUpdateAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) return;
        setIsAvatarSubmitting(true);
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await toast.promise(apiClient.patch('/adminoperator/update-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }), {
            loading: 'Uploading avatar...',
            success: 'Avatar updated! Changes visible on next login.',
            error: err => err.response?.data?.message || 'Upload failed.'
        });
        setIsAvatarSubmitting(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-glow mb-8">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <form onSubmit={handleUpdateAvatar} className="flex flex-col items-center gap-4">
                            <h2 className="text-xl font-semibold text-text-primary mb-2">Profile Picture</h2>
                            <div className="relative">
                                {previewAvatar ? (<img src={previewAvatar} alt="Avatar Preview" className="h-40 w-40 rounded-full object-cover border-2 border-border"/>) : (<div className="h-40 w-40 rounded-full bg-background-offset flex items-center justify-center"><User className="w-16 h-16 text-text-secondary"/></div>)}
                                <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 cursor-pointer bg-primary p-2 rounded-full text-white hover:bg-primary-hover"><Edit2 className="w-4 h-4"/><input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange}/></label>
                            </div>
                            <Button type="submit" loading={isAvatarSubmitting} disabled={!avatarFile}>Upload New Avatar</Button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                         <h2 className="text-xl font-semibold text-text-primary mb-4">Account Details</h2>
                        <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label><Input type="email" value={user?.email || ''} disabled /></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label><Input {...register('name')} /><FormError message={errors.name?.message}/></div>
                            <div><label className="block text-sm font-medium text-text-secondary mb-1">Contact Number</label><Input {...register('contactNumber')} /><FormError message={errors.contactNumber?.message}/></div>
                            <div className="flex justify-end pt-2"><Button type="submit" loading={isSubmitting}>Save Changes</Button></div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;