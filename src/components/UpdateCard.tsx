"use client";

import React from 'react';
import { IUpdate } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Video, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface UpdateCardProps {
    update: IUpdate;
}

const topicColors: Record<string, string> = {
    factory: 'bg-orange-500 text-white',
    logistics: 'bg-blue-500 text-white',
    meeting: 'bg-purple-500 text-white',
    safety: 'bg-red-500 text-white',
    maintenance: 'bg-amber-500 text-white',
    update: 'bg-green-500 text-white',
    other: 'bg-black text-white',
};

const reportColors: Record<string, string> = {
    hourly: 'bg-yellow-400 text-black border-2 border-black',
    report: 'bg-red-500 text-white border-2 border-black animate-pulse',
    regular: 'hidden'
};

const UpdateCard: React.FC<UpdateCardProps> = ({ update }) => {
    const router = useRouter();

    const getIcon = () => {
        switch (update.mediaType) {
            case 'voice': return <Mic className="w-5 h-5 text-black" />;
            case 'video': return <Video className="w-5 h-5 text-black" />;
            case 'text': return <svg className="w-5 h-5 text-black" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
            default: return <Mic className="w-5 h-5 text-black" />;
        }
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-[8px_8px_0px_#000] border-4 border-black transition-all rounded-none bg-white p-0 relative overflow-hidden group"
            onClick={() => router.push(`/dashboard/updates/${update._id}`)}
        >
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 border-2 border-black bg-white group-hover:bg-black group-hover:text-white transition-colors">
                            {getIcon()}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                                {update.mediaType} Signal
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge className={`rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${topicColors[update.topic] || topicColors.other}`}>
                            #{update.topic}
                        </Badge>
                        {update.reportType !== 'regular' && (
                            <Badge className={`rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${reportColors[update.reportType]}`}>
                                {update.reportType === 'report' ? 'HALF DAY / EOD REPORT' : 'HOURLY COUNT'}
                            </Badge>
                        )}
                    </div>
                </div>

                <p className="text-xl font-black leading-tight tracking-tight mb-6 italic">
                    "{update.summary}"
                </p>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black pt-6 border-t-2 border-dashed border-black/10">
                    <div className="flex items-center gap-2">
                        <span className="bg-black text-white px-2 py-0.5">{update.senderName}</span>
                        <span className="opacity-20 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                    {update.durationSeconds && (
                        <div className="flex items-center gap-1 opacity-40">
                            {Math.floor(update.durationSeconds)} SEC
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default UpdateCard;
