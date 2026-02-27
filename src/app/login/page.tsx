"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// --- INLINE SVG COMPONENTS ---

const IconMic = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);

const IconArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/api/auth/login', { email, password });
            setToken(response.data.token);
            login(response.data.token, response.data.user);
            toast.success('ACCESS GRANTED');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'AUTHORIZATION FAILED');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] bg-white text-black px-6">

            <div className="w-full max-w-lg">
                {/* BRAND HEADER */}
                <div className="mb-12 text-center space-y-4">
                    <div className="inline-flex bg-black text-white p-6 shadow-[10px_10px_0px_#ccc]">
                        <IconMic />
                    </div>
                    <div className="pt-6">
                        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">VoiceOps</h1>
                        <p className="text-black/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 italic">Autonomous Intelligence Management</p>
                    </div>
                </div>

                {/* LOGIN CARD */}
                <div className="border-4 border-black p-10 bg-white relative">
                    <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                        Security_Gateway.V4
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            {/* EMAIL FIELD */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">User_Identifier</label>
                                <input
                                    type="email"
                                    placeholder="ENTRY_EMAIL@DOMAIN.COM"
                                    className="w-full px-6 h-16 border-2 border-black font-black uppercase text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Access_Key</label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full px-6 h-16 border-2 border-black font-black text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-20 bg-black text-white font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white hover:text-black hover:border-4 border-black transition-all active:scale-95 group shadow-[12px_12px_0px_#ccc] hover:shadow-none"
                            >
                                {loading ? 'Validating...' : (
                                    <>
                                        Authorize
                                        <IconArrowRight />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/register"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 hover:opacity-100 hover:underline decoration-4"
                                >
                                    New Unit? Initiate Registration
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="mt-12 flex justify-between items-center opacity-20 text-[8px] font-black uppercase tracking-[0.4em]">
                    <span>Secure Protocol ACTIVE</span>
                    <span>System v4.0.1</span>
                </div>
            </div>
        </div>
    );
}
