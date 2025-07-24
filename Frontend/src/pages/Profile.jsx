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
import { User, Edit2, Camera, Shield, Mail, Phone, UserCheck, Sparkles, Crown } from 'lucide-react';

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    contactNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit number"),
});

const Profile = () => {
    const { user } = useAuth();
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(user?.avatar || null);
    const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || '', contactNumber: user?.contactNumber || '' }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) { 
            setAvatarFile(file); 
            setPreviewAvatar(URL.createObjectURL(file)); 
        }
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
        await toast.promise(apiClient.patch('/adminoperator/update-avatar', formData, { 
            headers: { 'Content-Type': 'multipart/form-data' } 
        }), {
            loading: 'Uploading avatar...',
            success: 'Avatar updated! Changes visible on next login.',
            error: err => err.response?.data?.message || 'Upload failed.'
        });
        setIsAvatarSubmitting(false);
    };

    const tabs = [
        { id: 'account', label: 'Account Details', icon: UserCheck },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text">
                            My Profile
                        </h1>
                        <p className="text-text-secondary mt-1 flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" />
                            Manage your account settings and preferences
                        </p>
                    </div>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50 mt-6"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Avatar Section */}
                <div className="lg:col-span-1">
                    <Card className="relative overflow-hidden group">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-semibold text-text-primary flex items-center justify-center gap-2">
                                    <Camera className="h-5 w-5 text-primary" />
                                    Profile Picture
                                </h2>
                                <p className="text-sm text-text-secondary mt-1">
                                    Upload a photo to personalize your account
                                </p>
                            </div>

                            <form onSubmit={handleUpdateAvatar} className="flex flex-col items-center gap-6">
                                {/* Enhanced Avatar Display */}
                                <div className="relative group/avatar">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
                                    
                                    {previewAvatar ? (
                                        <img 
                                            src={previewAvatar} 
                                            alt="Avatar Preview" 
                                            className="relative h-40 w-40 rounded-full object-cover border-4 border-primary/20 shadow-xl transition-all duration-300 group-hover/avatar:border-primary/40 group-hover/avatar:scale-105"
                                        />
                                    ) : (
                                        <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-background-offset to-background-offset/60 border-4 border-primary/20 flex items-center justify-center shadow-xl transition-all duration-300 group-hover/avatar:border-primary/40 group-hover/avatar:scale-105">
                                            <User className="w-16 h-16 text-text-secondary"/>
                                        </div>
                                    )}
                                    
                                    {/* Enhanced Upload Button */}
                                    <label 
                                        htmlFor="avatar-upload" 
                                        className="absolute -bottom-2 -right-2 cursor-pointer bg-gradient-to-br from-primary to-primary/80 p-3 rounded-full text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-110 group/upload"
                                    >
                                        <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover/upload:rotate-12"/>
                                        <input 
                                            id="avatar-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            className="sr-only" 
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                </div>

                                {/* User Info Display */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        {user?.name || 'User Name'}
                                    </h3>
                                    <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        {user?.role || 'Member'}
                                    </p>
                                </div>

                                {/* Enhanced Upload Button */}
                                <Button 
                                    type="submit" 
                                    loading={isAvatarSubmitting} 
                                    disabled={!avatarFile}
                                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                                >
                                    {isAvatarSubmitting ? 'Uploading...' : 'Upload New Avatar'}
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Enhanced Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Enhanced Tab Navigation */}
                    <div className="flex space-x-1 bg-background-offset/50 p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-background-offset'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Account Details Tab */}
                    {activeTab === 'account' && (
                        <Card className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <UserCheck className="h-6 w-6 text-primary" />
                                    <div>
                                        <h2 className="text-xl font-semibold text-text-primary">Account Details</h2>
                                        <p className="text-sm text-text-secondary">Update your personal information</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-6">
                                    {/* Enhanced Email Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                            <Mail className="h-4 w-4" />
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Input 
                                                type="email" 
                                                value={user?.email || ''} 
                                                disabled 
                                                className="bg-background-offset/50 cursor-not-allowed"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Shield className="h-4 w-4 text-text-secondary" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-text-secondary/70">Email cannot be changed for security reasons</p>
                                    </div>

                                    {/* Enhanced Name Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                            <User className="h-4 w-4" />
                                            Full Name
                                        </label>
                                        <Input 
                                            {...register('name')} 
                                            className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/20"
                                        />
                                        <FormError message={errors.name?.message}/>
                                    </div>

                                    {/* Enhanced Contact Field */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                                            <Phone className="h-4 w-4" />
                                            Contact Number
                                        </label>
                                        <Input 
                                            {...register('contactNumber')} 
                                            className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/20"
                                        />
                                        <FormError message={errors.contactNumber?.message}/>
                                    </div>

                                    {/* Enhanced Submit Button */}
                                    <div className="flex justify-end pt-4 border-t border-border/30">
                                        <Button 
                                            type="submit" 
                                            loading={isSubmitting}
                                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                                        >
                                            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <Card className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10 text-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
                                        <Shield className="h-8 w-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-text-primary mb-2">Security Settings</h3>
                                        <p className="text-text-secondary">
                                            Advanced security features will be available soon
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary/70 mt-4">
                                        <Sparkles className="h-4 w-4" />
                                        <span>Coming in the next update</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;