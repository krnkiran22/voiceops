"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IUpdate } from '@/types';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mic, Video, Calendar, Clock, User as UserIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UpdateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [update, setUpdate] = useState<IUpdate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpdate = async () => {
            try {
                const response = await api.get(`/api/updates/${params.id}`);
                setUpdate(response.data);
            } catch (error) {
                toast.error('Failed to load update');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchUpdate();
    }, [params.id, router]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this update?')) return;

        try {
            await api.delete(`/api/updates/${params.id}`);
            toast.success('Update deleted');
            router.push('/dashboard');
        } catch (error) {
            toast.error('Failed to delete update');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Clock className="animate-spin" /></div>;
    if (!update) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>

            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-600 text-white">
                            {update.mediaType === 'voice' ? <Mic className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{update.topic.charAt(0).toUpperCase() + update.topic.slice(1)} Update</h1>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(update.createdAt), 'MMMM do, yyyy • h:mm a')}
                    </p>
                </div>
                <Button variant="destructive" size="icon" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg text-slate-800 font-medium leading-relaxed italic">
                            &ldquo;{update.summary}&rdquo;
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-2"><UserIcon className="w-4 h-4" /> Operator</span>
                            <span className="font-medium">{update.senderName}</span>
                        </div>
                        {update.senderTelegramUsername && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Telegram</span>
                                <span className="font-medium text-blue-600">@{update.senderTelegramUsername}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                            <span className="font-medium">{update.durationSeconds ? `${Math.floor(update.durationSeconds)} seconds` : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Full Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[200px] leading-7 text-slate-700 whitespace-pre-wrap">
                        {update.transcript}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
