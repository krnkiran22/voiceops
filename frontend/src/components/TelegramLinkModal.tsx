"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TelegramLinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const TelegramLinkModal: React.FC<TelegramLinkModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [code, setCode] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = async () => {
        setLoading(true);
        try {
            const response = await api.post('/api/users/generate-link-code');
            setCode(response.data.code);
            setTimeLeft(600);
        } catch (error) {
            toast.error('Failed to generate code');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            generateCode();
        }
    }, [open]);

    useEffect(() => {
        if (!open || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [open, timeLeft]);

    // Polling for status
    useEffect(() => {
        if (!open) return;
        const interval = setInterval(async () => {
            try {
                const response = await api.get('/api/users/me');
                if (response.data.telegramUserId) {
                    toast.success('Telegram account linked successfully!');
                    onSuccess();
                    onOpenChange(false);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [open, onOpenChange, onSuccess]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`/link ${code}`);
        setCopied(true);
        toast.success('Command copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Link Telegram Account</DialogTitle>
                    <DialogDescription>
                        Follow these steps to connect your Telegram to VoiceOps.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center py-10">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="mt-4 text-slate-500">Generating secure code...</p>
                        </div>
                    ) : timeLeft > 0 ? (
                        <>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full text-center">
                                <span className="text-5xl font-mono font-bold tracking-[0.2em] text-blue-600">
                                    {code}
                                </span>
                                <p className="mt-4 text-sm text-slate-500 font-medium">
                                    Expires in <span className="text-orange-600 font-bold">{formatTime(timeLeft)}</span>
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                <p className="text-sm font-medium text-slate-700">
                                    1. Open Telegram and search for <span className="text-blue-600">@VoiceOpsBot</span>
                                </p>
                                <p className="text-sm font-medium text-slate-700">
                                    2. Send this exact command to the bot:
                                </p>
                                <div className="flex items-center gap-2 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-sm relative group">
                                    <span className="flex-1">/link {code}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                </div>
                                <p className="text-xs text-blue-700 font-medium leading-tight">
                                    Waiting for you to send the command... This window will close automatically once linked.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-orange-600 font-bold text-lg mb-4">Code expired</p>
                            <Button onClick={generateCode}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Generate New Code
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TelegramLinkModal;
