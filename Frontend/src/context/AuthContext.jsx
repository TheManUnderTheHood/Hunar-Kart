import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuthStatus = async () => {
        try {
            const response = await apiClient.get('/adminoperator/current-user');
            if (response.data && response.data.success) {
                setUser(response.data.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Not authenticated', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/adminoperator/login', { email, password });
            if (response.data && response.data.success) {
                setUser(response.data.data.user);
                setIsAuthenticated(true);
                navigate('/dashboard'); // <-- UPDATED REDIRECT
            }
            return response.data;
        } catch (error) {
            console.error('Login failed:', error.response.data);
            throw error.response.data;
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/adminoperator/logout');
        } catch (error) {
            console.error("Logout failed:", error.response?.data);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        }
    };
    
    // While checking auth, show a loader
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;