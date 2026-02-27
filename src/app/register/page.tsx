"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// --- INLINE SVG COMPONENTS ---

const IconMic = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);

const IconUserPlus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
);

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/auth/register', formData);
            toast.success('UNIT ENKINDLED. ACCESS AUTHORIZED.');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'ENLISTMENT FAILED');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] bg-white text-black px-6 py-20">

            <div className="w-full max-w-lg">
                {/* BRAND HEADER */}
                <div className="mb-12 text-center space-y-4">
                    <div className="inline-flex bg-black text-white p-6 shadow-[10px_10px_0px_#ccc]">
                        <IconMic />
                    </div>
                    <div className="pt-6">
                        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">VoiceOps</h1>
                        <p className="text-black/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 italic">Personnel Enlistment Terminal</p>
                    </div>
                </div>

                {/* REGISTER CARD */}
                <div className="border-4 border-black p-10 bg-white relative">
                    <div className="absolute -top-4 -left-4 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                        New_Operator_Entry.V4
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            {/* NAME FIELD */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Full_Legal_Name</label>
                                <input
                                    id="name"
                                    placeholder="OPERATOR NAME"
                                    className="w-full px-6 h-14 border-2 border-black font-black uppercase text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* EMAIL FIELD */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Communication_Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="ENTRY_EMAIL@DOMAIN.COM"
                                    className="w-full px-6 h-14 border-2 border-black font-black uppercase text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* PHONE FIELD */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Signal_Phone</label>
                                <input
                                    id="phone"
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-6 h-14 border-2 border-black font-black uppercase text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Secure_Key</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full px-6 h-14 border-2 border-black font-black text-sm tracking-widest bg-transparent outline-none focus:bg-black focus:text-white placeholder:text-black/20 transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-20 bg-black text-white font-black text-xl uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white hover:text-black hover:border-4 border-black transition-all active:scale-95 group shadow-[12px_12px_0px_#ccc] hover:shadow-none"
                            >
                                {loading ? 'Enrolling...' : (
                                    <>
                                        Enlist Unit
                                        <IconUserPlus />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 hover:opacity-100 hover:underline decoration-4"
                                >
                                    Existing Operator? Authenticate
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="mt-12 flex justify-between items-center opacity-20 text-[8px] font-black uppercase tracking-[0.4em]">
                    <span>Personnel Protocol ENABLED</span>
                    <span>System v4.0.1</span>
                </div>
            </div>
        </div>
    );
}
