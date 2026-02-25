"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import api from '../lib/api';
import { clearToken, getToken } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: IUser | null;
    loading: boolean;
    login: (token: string, user: IUser) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refreshUser = async () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/api/users/me');
            setUser(response.data);
        } catch (error) {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/login', '/register'];
            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
            }
        }
    }, [user, loading, pathname, router]);

    const login = (token: string, user: IUser) => {
        setUser(user);
        router.push('/dashboard');
    };

    const logout = () => {
        clearToken();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
