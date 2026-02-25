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

export default function DashboardPage() {
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
                    limit: 10
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
    }, [topic]); // Refetch on topic change

    // Debounced search
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 self-start">Your Feed</h1>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search transcripts..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={topic} onValueChange={setTopic}>
                        <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2 text-slate-400" />
                            <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent>
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
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                </div>
            ) : updates.length > 0 ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {updates.map((update) => (
                            <UpdateCard key={update._id} update={update} />
                        ))}
                    </div>

                    {page < totalPages && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={loadMore}
                                disabled={fetchingMore}
                                className="w-40"
                            >
                                {fetchingMore ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : 'Load More'}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                        <Mic className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No updates found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-center">
                        Send a voice or video message in the Telegram group to see it appear here instantly.
                    </p>
                </div>
            )}
        </div>
    );
}
