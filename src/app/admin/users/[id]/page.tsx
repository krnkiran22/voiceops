"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// --- INLINE SVG COMPONENTS ---

const IconChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const IconUser = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const IconClock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconTranscript = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);

const IconMic = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);

const IconVideo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
);

const IconText = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15.5a5 5 0 0 1-7 0L9 11a5 5 0 0 1 0-7l1.5-1.5" /><path d="M15.5 15.5L19 19" /></svg>
);

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
    isPresent: boolean;
    lastUpdateAt?: string;
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
                    api.get(`/api/updates?userId=${id}`)
                ]);
                setUserProfile(userRes.data);
                setUpdates(updatesRes.data.updates || updatesRes.data);
            } catch (error) {
                console.error('Failed to fetch user data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, id, router]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-black">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="font-black uppercase tracking-widest text-xs">Accessing Intel Stream...</p>
        </div>
    );

    if (!currentUser || currentUser.role !== 'admin' || !userProfile) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'voice': return <IconMic />;
            case 'video': return <IconVideo />;
            default: return <IconText />;
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12 bg-white text-black min-h-screen">

            <button
                onClick={() => router.back()}
                className="flex items-center gap-3 font-black uppercase text-xs tracking-[0.3em] hover:translate-x-[-4px] transition-transform group"
            >
                <IconChevronLeft />
                <span className="border-b-2 border-transparent group-hover:border-black">Back to Fleet</span>
            </button>

            {/* --- PROFILE HEADER --- */}
            <div className="border-4 border-black p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-black text-white flex items-center justify-center shadow-[8px_8px_0px_#ddd]">
                        <IconUser />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-2">{userProfile.name}</h1>
                        <p className="text-black/40 font-bold uppercase tracking-widest text-xs">{userProfile.email} • ID: {userProfile._id.substring(0, 8).toUpperCase()}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="bg-black text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none">
                                {userProfile.role}
                            </div>
                            {userProfile.telegramUsername && (
                                <div className="border-2 border-black px-4 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none text-black">
                                    @{userProfile.telegramUsername}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-l-4 border-black pl-10 hidden md:block">
                    <div className="text-black/30 text-[10px] font-black uppercase tracking-widest mb-2">Total Intel Points</div>
                    <div className="text-6xl font-black tabular-nums tracking-tighter leading-none">{updates.length}</div>
                </div>
            </div>

            {/* --- SOP ATTENDANCE GRID --- */}
            <div className="border-4 border-black p-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-6">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Operational SOP Timeline</h2>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">15-Minute Tactical Signal Checks (08:45 - 18:00)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest ${userProfile.isPresent ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                            {userProfile.isPresent ? 'SIGNAL: PRESENT' : 'SIGNAL: MISSING'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {(() => {
                        const slots = [];
                        let start = new Date();
                        start.setHours(8, 45, 0, 0);
                        const end = new Date();
                        end.setHours(18, 0, 0, 0);

                        while (start <= end) {
                            const timeStr = format(start, 'HH:mm');
                            const slotEnd = new Date(start.getTime() + 15 * 60000);

                            // Check if an update exists in this slot
                            const hasUpdate = updates.some(u => {
                                const uDate = new Date(u.createdAt);
                                return uDate >= start && uDate < slotEnd;
                            });

                            const isLunch = timeStr >= '13:00' && timeStr < '14:00';
                            const isReportTime = timeStr === '18:00' || timeStr === '08:45' || timeStr === '13:00';

                            slots.push(
                                <div
                                    key={timeStr}
                                    className={cn(
                                        "border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all",
                                        hasUpdate ? "bg-black text-white border-black" : "border-black/10 text-black/20",
                                        isLunch && !hasUpdate && "bg-black/5 border-dashed",
                                        isReportTime && !hasUpdate && "border-black/40 border-dashed"
                                    )}
                                >
                                    <span className="text-[9px] font-black">{timeStr}</span>
                                    {hasUpdate ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : (
                                        <div className="w-3 h-3 border border-current rounded-full opacity-20" />
                                    )}
                                    {isLunch && <span className="text-[7px] font-black opacity-40">LUNCH</span>}
                                    {timeStr === '08:45' && <span className="text-[7px] font-black opacity-40">START</span>}
                                    {timeStr === '18:00' && <span className="text-[7px] font-black opacity-40">REPORT</span>}
                                </div>
                            );
                            start = slotEnd;
                        }
                        return slots;
                    })()}
                </div>

                <div className="bg-black/5 p-4 flex flex-wrap gap-6 text-[8px] font-black uppercase tracking-widest text-black/40">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> COMPLETED SIGNAL</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 border border-black/20"></div> PENDING / MISSED</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 border border-black/40 border-dashed"></div> MILESTONE (REPORT/START)</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-black/10 border-dashed border border-black/10"></div> LUNCH BREAK</div>
                </div>
            </div>

            {/* --- LOG HISTORY --- */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b-4 border-black pb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Tactical Intel Stream</h2>
                    <span className="text-[10px] font-black opacity-30 tracking-[0.4em] uppercase">Chronological Order</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {updates.map((update) => (
                        <div key={update._id} className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors">
                                            {getIcon(update.mediaType)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">#{update.topic}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 group-hover:opacity-60">
                                                <IconClock />
                                                {format(new Date(update.createdAt), 'MMM d, yyyy • HH:mm:ss')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-lg font-black leading-tight tracking-tight italic">
                                            "{update.summary}"
                                        </p>

                                        <div className="bg-black/5 p-6 border-l-4 border-black group-hover:bg-white/10 group-hover:border-white transition-colors">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest mb-3 opacity-40 group-hover:opacity-100 italic">
                                                <IconTranscript /> Raw Transcript
                                            </div>
                                            <p className="text-sm font-bold leading-relaxed opacity-70 group-hover:opacity-100">
                                                {update.transcript}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                                    <div className="border-2 border-black group-hover:border-white px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                                        {update.mediaType}
                                    </div>
                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] opacity-20 hidden md:block">
                                        REF_{update._id.substring(18).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {updates.length === 0 && (
                    <div className="text-center py-40 border-4 border-dashed border-black/10">
                        <div className="text-8xl font-black text-black/5 opacity-50 mb-10 italic uppercase tracking-tighter">Zero Intel</div>
                        <p className="text-black/40 font-black uppercase tracking-[0.2em] text-sm italic underline">No tactical signal received from this unit.</p>
                    </div>
                )}
            </div>

            <div className="pt-20 text-center opacity-10 text-[8px] font-black uppercase tracking-[1em]">
                Secure Intel Transmission Terminal // VoiceOps Enterprise
            </div>
        </div>
    );
}
