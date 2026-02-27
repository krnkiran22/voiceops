"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, FileText, Activity, AlertCircle, TrendingUp, Clock, ShieldCheck, Search, RefreshCcw, UserCircle, Hash } from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

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
            if (isRefresh) toast.success('Dashboard data updated');
        } catch (error) {
            console.error('Failed to fetch admin data', error);
            toast.error('Failed to update dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [user, router]);

    const filteredEfficiency = efficiency.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.telegramUsername && item.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Loading Intelligence Dashboard...</p>
        </div>
    );

    if (!user || user.role !== 'admin') return null;

    const getEfficiencyColor = (value: number) => {
        if (value >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
        if (value >= 60) return 'text-amber-700 bg-amber-50 border-amber-100';
        return 'text-rose-700 bg-rose-50 border-rose-100';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-xl">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic uppercase">Command Center</h1>
                    </div>
                    <p className="text-slate-500 font-medium pl-1">Global Operator Intelligence & Compliance Monitor</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-600 font-semibold gap-2 h-11 px-5 shadow-sm active:scale-95 transition-all"
                    >
                        <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                        {refreshing ? 'Syncing...' : 'Refresh Intel'}
                    </Button>
                    <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 h-11 rounded-xl border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold uppercase tracking-wider">Live Monitoring</span>
                    </div>
                </div>
            </div>

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ops Personnel', val: stats?.totalUsers, icon: Users, color: 'blue', desc: 'Active operators' },
                    { label: 'Intelligence Feed', val: stats?.totalUpdates, icon: FileText, color: 'purple', desc: 'Total data points' },
                    { label: 'Today\'s Output', val: stats?.updatesToday, icon: TrendingUp, color: 'emerald', desc: 'Last 24 hours' },
                    { label: 'Admin Faculty', val: stats?.totalAdmins, icon: Activity, color: 'amber', desc: 'System controllers' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow overflow-hidden group">
                        <div className={`h-1 w-full bg-${stat.color}-500/20 group-hover:bg-${stat.color}-500 transition-colors`} />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 pt-6">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{stat.label}</CardTitle>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-500 opacity-80`} />
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="text-3xl font-black text-slate-900 leading-none">{stat.val ?? 0}</div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tight">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Operator Control Panel */}
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl ring-1 ring-slate-100">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-8 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <UserCircle className="w-6 h-6 text-blue-600" />
                                <CardTitle className="text-2xl font-black text-slate-900">Operator Directory</CardTitle>
                            </div>
                            <CardDescription className="text-slate-500 font-medium">Compliance auditing for 15-min and 1-hour recurring intelligence tasks.</CardDescription>
                        </div>

                        <div className="relative w-full lg:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search by name, email or telegram..."
                                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl shadow-inner-sm focus-visible:ring-blue-500/20 text-base font-medium placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="py-5 px-8 text-slate-400 font-bold uppercase text-[11px] tracking-widest">Operator Entity</TableHead>
                                    <TableHead className="py-5 text-slate-400 font-bold uppercase text-[11px] tracking-widest">Communications</TableHead>
                                    <TableHead className="py-5 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest">15m Slot Efficiency</TableHead>
                                    <TableHead className="py-5 text-center text-slate-400 font-bold uppercase text-[11px] tracking-widest">1h Slot Efficiency</TableHead>
                                    <TableHead className="py-5 text-slate-400 font-bold uppercase text-[11px] tracking-widest">Signal Status</TableHead>
                                    <TableHead className="py-5 px-8 text-right text-slate-400 font-bold uppercase text-[11px] tracking-widest">Executive Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEfficiency.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-50/50 last:border-0 group">
                                        <TableCell className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3 shadow-sm uppercase">
                                                    {u.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{u.name}</div>
                                                    <div className="text-xs text-slate-400 font-semibold">{u.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            {u.telegramUsername ? (
                                                <Badge variant="outline" className="font-bold text-blue-600 bg-blue-50/50 border-blue-100 py-1.5 px-3 rounded-lg flex items-center gap-1.5 w-fit lowercase">
                                                    <Hash className="w-3 h-3" />
                                                    {u.telegramUsername}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-100 py-1.5 px-3 italic font-medium">Unlinked</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6 text-center">
                                            <Badge className={`font-black text-xs py-2 px-4 rounded-xl border ${getEfficiencyColor(u.fifteenMinEfficiency)} shadow-none`}>
                                                {u.fifteenMinEfficiency.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6 text-center">
                                            <Badge className={`font-black text-xs py-2 px-4 rounded-xl border ${getEfficiencyColor(u.hourEfficiency)} shadow-none`}>
                                                {u.hourEfficiency.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            {u.lastUpdate ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        {formatDistanceToNow(new Date(u.lastUpdate), { addSuffix: true })}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-6">
                                                        {format(new Date(u.lastUpdate), 'MMM d • HH:mm')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-slate-300 font-bold uppercase text-[10px] tracking-widest italic pl-2">Incommunicado</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-6 px-8 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/admin/users/${u.id}`)}
                                                className="text-white bg-slate-900 hover:bg-blue-600 rounded-xl px-5 font-bold text-xs h-10 shadow-sm active:scale-95 transition-all uppercase tracking-widest"
                                            >
                                                Audit Logs
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {filteredEfficiency.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-inner">
                    <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Target Not Found</h3>
                    <p className="text-slate-400 font-semibold max-w-sm mx-auto">None of your operators match the current intelligence parameters.</p>
                    <Button
                        variant="link"
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 font-bold mt-4 uppercase tracking-widest text-xs"
                    >
                        Reset Local Search
                    </Button>
                </div>
            )}
        </div>
    );
}
