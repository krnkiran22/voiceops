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
    factory: 'bg-orange-100 text-orange-700',
    logistics: 'bg-blue-100 text-blue-700',
    meeting: 'bg-purple-100 text-purple-700',
    safety: 'bg-red-100 text-red-700',
    maintenance: 'bg-amber-100 text-amber-700',
    update: 'bg-green-100 text-green-700',
    other: 'bg-slate-100 text-slate-700',
};

const UpdateCard: React.FC<UpdateCardProps> = ({ update }) => {
    const router = useRouter();

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] border-slate-200"
            onClick={() => router.push(`/dashboard/updates/${update._id}`)}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-slate-100">
                            {update.mediaType === 'voice' ? (
                                <Mic className="w-5 h-5 text-slate-600" />
                            ) : (
                                <Video className="w-5 h-5 text-slate-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                {update.mediaType} update
                            </p>
                        </div>
                    </div>
                    <Badge className={topicColors[update.topic] || topicColors.other}>
                        {update.topic}
                    </Badge>
                </div>

                <p className="text-slate-800 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {update.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{update.senderName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}</span>
                    </div>
                    {update.durationSeconds && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(update.durationSeconds)}s
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default UpdateCard;
