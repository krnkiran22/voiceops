"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, User, Clock, MessageSquare, Video, Mic, Hash } from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Update {
    _id: string;
    mediaType: 'voice' | 'video' | 'text';
    summary: string;
    topic: string;
    transcript: string;
    createdAt: string;
}

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: string;
    telegramUsername?: string;
}

export default function UserDetailPage() {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { id } = useParams();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [userRes, updatesRes] = await Promise.all([
                    api.get(`/api/admin/users/${id}`),
                    api.get(`/api/updates?userId=${id}`) // Assuming the existing updates API supports filtering
                ]);
                setUserProfile(userRes.data);
                setUpdates(updatesRes.data.updates || updatesRes.data); // Support both formats
            } catch (error) {
                console.error('Failed to fetch user data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, id, router]);

    if (loading) return <div>Loading...</div>;
    if (!currentUser || currentUser.role !== 'admin' || !userProfile) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'voice': return <Mic className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <Button variant="ghost" className="gap-2 mb-2" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Button>

            {/* Profile Header */}
            <Card className="border-none shadow-sm overflow-hidden bg-slate-900 text-white">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{userProfile.name}</h1>
                                <p className="text-slate-400 font-medium">{userProfile.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 capitalize">
                                        {userProfile.role}
                                    </Badge>
                                    {userProfile.telegramUsername && (
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                            @{userProfile.telegramUsername}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Updates</div>
                                <div className="text-2xl font-bold">{updates.length}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-8">
                <Hash className="w-5 h-5 text-blue-600" />
                Update Log History
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {updates.map((update) => (
                    <Card key={update._id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {getIcon(update.mediaType)}
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold capitalize">{update.topic}</CardTitle>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(update.createdAt), 'MMM d, yyyy • HH:mm')}
                                    </div>
                                </div>
                            </div>
                            <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider">
                                {update.mediaType}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-slate-700 font-medium text-sm leading-relaxed mb-3 italic">
                                "{update.summary}"
                            </p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" /> Full Transcript
                                </div>
                                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed">
                                    {update.transcript}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {updates.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium text-lg">No updates recorded for this operator yet.</p>
                </div>
            )}
        </div>
    );
}
