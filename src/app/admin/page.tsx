"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

// --- INLINE SVG COMPONENTS ---

const IconShield = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const IconFile = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
);

const IconTrend = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);

const IconSearch = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const IconRefresh = ({ spinning }: { spinning?: boolean }) => (
    <svg className={spinning ? 'animate-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
);

const IconClock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

interface Stats {
    totalUsers: number;
    totalAdmins: number;
    totalUpdates: number;
    updatesToday: number;
}

interface UserEfficiency {
    id: string;
    name: string;
    email: string;
    telegramUsername: string;
    hourEfficiency: number;
    fifteenMinEfficiency: number;
    lastUpdate: string | null;
    totalUpdatesLast24h: number;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [efficiency, setEfficiency] = useState<UserEfficiency[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const [statsRes, efficiencyRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/efficiency')
            ]);
            setStats(statsRes.data);
            setEfficiency(efficiencyRes.data);
            if (isRefresh) toast.success('INTEL SYNCED');
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            toast.error('SYNC FAILED');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredEfficiency = efficiency.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.telegramUsername && item.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <IconRefresh spinning />
            <p className="text-black font-black tracking-widest uppercase text-xs">Initializing Secure Terminal...</p>
        </div>
    );

    return (
        <div className="max-w-screen-2xl mx-auto px-6 py-12 space-y-16 bg-white text-black min-h-screen">

            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b-4 border-black pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-black text-white p-3">
                            <IconShield />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Command</h1>
                    </div>
                    <p className="text-black/40 font-bold uppercase tracking-[0.2em] text-sm italic">Intelligence compliance & tactical overrides</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="border-2 border-black flex items-center h-16 divide-x-2 divide-black overflow-hidden">
                        <div className="px-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Live Feed</span>
                        </div>
                        <button
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="h-full px-8 hover:bg-black hover:text-white transition-colors flex items-center gap-3 active:invert"
                        >
                            <IconRefresh spinning={refreshing} />
                            <span className="text-xs font-black uppercase tracking-widest leading-none">Sync</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- METRICS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-4 border-black divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                {[
                    { label: 'Personnel', val: stats?.totalUsers, icon: IconUsers, unit: 'Active' },
                    { label: 'Intel Pts', val: stats?.totalUpdates, icon: IconFile, unit: 'Total' },
                    { label: 'Output/24h', val: stats?.updatesToday, icon: IconTrend, unit: 'Volume' },
                    { label: 'Faculty', val: stats?.totalAdmins, icon: IconShield, unit: 'Admins' }
                ].map((stat, i) => (
                    <div key={i} className="p-8 group hover:bg-black hover:text-white transition-colors">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100">{stat.label}</span>
                            <stat.icon />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tabular-nums leading-none tracking-tighter">{stat.val ?? 0}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-60">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- DIRECTORY SECTION --- */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                        Operator Directory
                    </h2>

                    <div className="relative w-full md:max-w-md group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                            <IconSearch />
                        </div>
                        <input
                            placeholder="SEARCH OPERATOR ID..."
                            className="w-full pl-12 pr-6 h-14 bg-transparent border-2 border-black font-black uppercase text-sm tracking-widest focus:bg-black focus:text-white placeholder:text-black/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto border-x-2 border-black">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="py-6 px-8 text-left text-[10px] font-black uppercase tracking-[0.2em]">Operator ID</th>
                                <th className="py-6 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em]">15M Efficiency</th>
                                <th className="py-6 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em]">1H Efficiency</th>
                                <th className="py-6 px-4 text-center text-[10px] font-black uppercase tracking-[0.2em]">Last Signal</th>
                                <th className="py-6 px-8 text-right text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/5">
                            {filteredEfficiency.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-8 px-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-black text-white flex items-center justify-center font-black text-lg shadow-[4px_4px_0px_#ccc]">
                                                {u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-lg tracking-tight leading-none mb-1">{u.name}</div>
                                                <div className="text-[10px] font-black tracking-widest opacity-40 uppercase">@{u.telegramUsername || 'NULL_ID'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        <div className="inline-block border-2 border-black px-4 py-2 font-black tabular-nums transition-colors group-hover:bg-black group-hover:text-white">
                                            {u.fifteenMinEfficiency.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        <div className="inline-block border-2 border-black px-4 py-2 font-black tabular-nums transition-colors group-hover:bg-black group-hover:text-white">
                                            {u.hourEfficiency.toFixed(1)}%
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        {u.lastUpdate ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase">
                                                    <IconClock />
                                                    {formatDistanceToNow(new Date(u.lastUpdate), { addSuffix: true }).toUpperCase()}
                                                </div>
                                                <div className="text-[9px] font-bold opacity-30 tracking-widest text-center">
                                                    {format(new Date(u.lastUpdate), 'HH:MM:SS')}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black opacity-20 uppercase tracking-[0.2em]">No Signal</span>
                                        )}
                                    </td>
                                    <td className="py-8 px-8 text-right">
                                        <button
                                            onClick={() => router.push(`/admin/users/${u.id}`)}
                                            className="border-2 border-black bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 hover:bg-black hover:text-white transition-all active:scale-95 shadow-[4px_4px_0px_#000] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
                                        >
                                            Audit Intel
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredEfficiency.length === 0 && (
                <div className="text-center py-40 border-4 border-dashed border-black/10">
                    <div className="text-8xl font-black text-black/5 opacity-50 mb-10 italic uppercase tracking-tighter">Void</div>
                    <p className="text-black/40 font-black uppercase tracking-[0.2em] text-sm">Target acquisition failed. Zero matches in sector.</p>
                </div>
            )}

            {/* --- FOOTER DECORATION --- */}
            <div className="border-t-2 border-black/5 pt-10 flex justify-between items-center opacity-20 text-[9px] font-black uppercase tracking-[0.5em]">
                <span>VoiceOps Administrative Terminal v4.0.1</span>
                <span>System Status: Optimal</span>
            </div>
        </div>
    );
}
