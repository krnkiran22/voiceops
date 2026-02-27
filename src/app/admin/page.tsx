"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Activity, AlertCircle, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';

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

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [statsRes, efficiencyRes] = await Promise.all([
                    api.get('/api/admin/stats'),
                    api.get('/api/admin/efficiency')
                ]);
                setStats(statsRes.data);
                setEfficiency(efficiencyRes.data);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, router]);

    if (loading) return <div>Loading...</div>;
    if (!user || user.role !== 'admin') return null;

    const getEfficiencyColor = (value: number) => {
        if (value >= 80) return 'bg-green-100 text-green-700 border-green-200';
        if (value >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
                    <p className="text-slate-500 mt-1">Monitor operator compliance and team efficiency.</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Admin Mode Active</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Operators</CardTitle>
                        <Users className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Updates</CardTitle>
                        <FileText className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUpdates}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Updates Today</CardTitle>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.updatesToday}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Admins</CardTitle>
                        <Activity className="w-4 h-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalAdmins}</div>
                    </CardContent>
                </Card>
            </div>

            {/* User Efficiency Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <CardTitle>Operator Compliance (Last 24h)</CardTitle>
                    </div>
                    <CardDescription>Tracks 15-minute and 1-hour update frequency goals.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold">Operator</TableHead>
                                <TableHead className="font-semibold">Telegram</TableHead>
                                <TableHead className="font-semibold">15m Compliance</TableHead>
                                <TableHead className="font-semibold">1h Compliance</TableHead>
                                <TableHead className="font-semibold">Last Update</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white">
                            {efficiency.map((u) => (
                                <TableRow key={u.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">
                                        <div>
                                            {u.name}
                                            <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.telegramUsername ? (
                                            <Badge variant="outline" className="font-normal text-blue-600 bg-blue-50 border-blue-100">
                                                @{u.telegramUsername}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Not Linked</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`font-semibold ${getEfficiencyColor(u.fifteenMinEfficiency)}`}>
                                            {u.fifteenMinEfficiency.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`font-semibold ${getEfficiencyColor(u.hourEfficiency)}`}>
                                            {u.hourEfficiency.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {u.lastUpdate ? (
                                            <div className="text-sm">
                                                {formatDistanceToNow(new Date(u.lastUpdate), { addSuffix: true })}
                                                <div className="text-[10px] text-slate-400">
                                                    {format(new Date(u.lastUpdate), 'MMM d, HH:mm')}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">No updates</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/users/${u.id}`)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            View Logs
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {efficiency.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No operators found in the system.</p>
                </div>
            )}
        </div>
    );
}
