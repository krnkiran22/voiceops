"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { IUpdate } from '@/types';

// --- INLINE SVG COMPONENTS ---
const IconChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const IconUser = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

export default function AttendancePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [updates, setUpdates] = useState<IUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch today's updates for the current user
                const response = await api.get('/api/updates', {
                    params: {
                        userId: user?._id,
                        limit: 100 // Get many to fill the grid
                    }
                });
                setUpdates(response.data.updates || []);
            } catch (error) {
                console.error('Failed to fetch attendance data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, authLoading, router]);

    if (loading || authLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-black bg-white">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="font-black uppercase tracking-widest text-xs">Accessing Tactical Attendance...</p>
        </div>
    );

    if (!user) return null;

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12 bg-white text-black min-h-screen">

            <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-3 font-black uppercase text-xs tracking-[0.3em] hover:translate-x-[-4px] transition-transform group"
            >
                <IconChevronLeft />
                <span className="border-b-2 border-transparent group-hover:border-black">Back to Intelligence</span>
            </button>

            {/* --- PROFILE HEADER --- */}
            <div className="border-4 border-black p-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-black text-white flex items-center justify-center shadow-[8px_8px_0px_#ddd]">
                        <IconUser />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-2">{user.name}</h1>
                        <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Operator Profile // {user.email}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="bg-black text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest leading-none">
                                {user.isPresent ? 'SIGNAL: ACTIVE' : 'SIGNAL: INACTIVE'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-l-4 border-black pl-10 hidden md:block">
                    <div className="text-black/30 text-[10px] font-black uppercase tracking-widest mb-2">Today's Signals</div>
                    <div className="text-6xl font-black tabular-nums tracking-tighter leading-none">
                        {updates.filter(u => isToday(new Date(u.createdAt))).length}
                    </div>
                </div>
            </div>

            {/* --- SOP ATTENDANCE GRID --- */}
            <div className="border-4 border-black p-10 space-y-8 bg-white shadow-[12px_12px_0px_#000]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-6">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">My Tactical Signal Log</h2>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">15-Minute Frequency Required (08:45 - 18:00)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest ${user.isPresent ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                            {user.isPresent ? 'IN ATTENDANCE' : 'ABSENT / NO SIGNAL'}
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

                            // Check if an update for TODAY exists in this slot
                            const hasUpdate = updates.some(u => {
                                const uDate = new Date(u.createdAt);
                                return isToday(uDate) && uDate >= start && uDate < slotEnd;
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

                <div className="bg-black/5 p-4 flex flex-wrap gap-6 text-[8px] font-black uppercase tracking-widest text-black/40 border-l-4 border-black">
                    <div className="flex items-center gap-2 font-black"><div className="w-2 h-2 bg-black"></div> SIGNAL RECEIVED</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 border border-black/20"></div> NO INPUT</div>
                    <div className="flex items-center gap-2 font-black text-black">USE /present ON TELEGRAM TO START YOUR DAY</div>
                </div>
            </div>

            <div className="pt-20 text-center opacity-10 text-[8px] font-black uppercase tracking-[1em]">
                Secure Attendance Log // Tactical Unit Terminal
            </div>
        </div>
    );
}
