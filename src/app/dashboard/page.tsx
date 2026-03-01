"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { IUpdate } from '@/types';
import api from '@/lib/api';
import UpdateCard from '@/components/UpdateCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, Mic } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const [updates, setUpdates] = useState<IUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [topic, setTopic] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [fetchingMore, setFetchingMore] = useState(false);

    const fetchUpdates = useCallback(async (isNewSearch = false) => {
        const currentPage = isNewSearch ? 1 : page;
        if (isNewSearch) setLoading(true);
        else setFetchingMore(true);

        try {
            const response = await api.get('/api/updates', {
                params: {
                    search,
                    topic,
                    page: currentPage,
                    limit: 20
                }
            });

            if (isNewSearch) {
                setUpdates(response.data.updates);
            } else {
                setUpdates(prev => [...prev, ...response.data.updates]);
            }
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            setLoading(false);
            setFetchingMore(false);
        }
    }, [search, topic, page]);

    useEffect(() => {
        fetchUpdates(true);
    }, [topic]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUpdates(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const loadMore = () => {
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (page > 1) {
            fetchUpdates(false);
        }
    }, [page]);

    // Group updates by date
    const groupedUpdates = updates.reduce((acc: Record<string, IUpdate[]>, update) => {
        const date = format(new Date(update.createdAt), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(update);
        return acc;
    }, {});

    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Today's Intelligence";
        if (isYesterday(date)) return "Yesterday's Operation";
        return format(date, 'MMMM do, yyyy').toUpperCase();
    };

    return (
        <div className="max-w-screen-2xl mx-auto px-6 py-12 space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between border-b-8 border-black pb-8">
                <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-2">Tactical Intelligence</h1>
                    <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-30">On-Ground Operational Feed // Real-Time Signal</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {user?.role === 'operator' && (
                        <Link href="/attendance">
                            <Button className="rounded-none bg-black text-white font-black uppercase tracking-widest px-8 py-6 hover:shadow-[6px_6px_0px_#ddd] transition-all">
                                My Attendance
                            </Button>
                        </Link>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black opacity-30" />
                                <Input
                                    placeholder="SEARCH INTEL..."
                                    className="pl-12 rounded-none border-4 border-black font-black uppercase placeholder:opacity-20 h-12 text-xs tracking-widest"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={topic} onValueChange={setTopic}>
                                <SelectTrigger className="w-48 rounded-none border-4 border-black font-black uppercase h-12 text-[10px] tracking-widest">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="TOPIC" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-4 border-black font-black uppercase text-[10px]">
                                    <SelectItem value="All">All Topics</SelectItem>
                                    <SelectItem value="factory">Factory</SelectItem>
                                    <SelectItem value="logistics">Logistics</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-none border-4 border-black/5" />
                        </div>
                    ))}
                </div>
            ) : updates.length > 0 ? (
                <div className="space-y-24">
                    {Object.entries(groupedUpdates).map(([date, updates]) => (
                        <div key={date} className="space-y-12 relative">
                            {/* Date Header / Divider */}
                            <div className="flex items-center gap-6">
                                <h2 className="text-2xl font-black uppercase tracking-tighter bg-black text-white px-6 py-2 italic flex-shrink-0">
                                    {getDateLabel(date)}
                                </h2>
                                <div className="h-1 bg-black w-full translate-y-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {updates.map((update) => (
                                    <UpdateCard key={update._id} update={update} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {page < totalPages && (
                        <div className="flex justify-center pt-12">
                            <Button
                                variant="outline"
                                onClick={loadMore}
                                disabled={fetchingMore}
                                className="rounded-none border-4 border-black font-black uppercase tracking-widest px-12 py-8 hover:bg-black hover:text-white transition-all text-sm shadow-[8px_8px_0px_#ddd]"
                            >
                                {fetchingMore ? (
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                ) : 'Access More Logs'}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border-8 border-dashed border-black/10">
                    <div className="bg-black text-white p-8 rounded-none mb-8">
                        <Mic className="w-12 h-12" />
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter">Zero Intel Signal</h3>
                    <p className="text-black/40 font-bold mt-4 max-w-sm text-center uppercase tracking-widest text-xs italic underline">
                        Awaiting on-ground signal transmission. No tactical data received for current parameters.
                    </p>
                </div>
            )}

            <div className="pt-20 text-center opacity-10 text-[8px] font-black uppercase tracking-[1em]">
                Secure Intelligence Management Interface // VoiceOps Tactical
            </div>
        </div>
    );
}
