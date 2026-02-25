"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import TelegramLinkModal from '@/components/TelegramLinkModal';
import { User, Phone, Mail, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) return null;

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/api/users/me', formData);
            await refreshUser();
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-1 text-lg">Manage your profile and connected accounts.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Info */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <CardTitle className="text-xl">Profile Information</CardTitle>
                        </div>
                        <CardDescription>Update your personal details below.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleUpdateProfile}>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        className="pl-10"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="email" className="pl-10 bg-slate-50" value={user.email} disabled />
                                </div>
                                <p className="text-xs text-slate-400">Email cannot be changed.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardContent>
                    </form>
                </Card>

                {/* Telegram Linking */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            <CardTitle className="text-xl">Telegram Integration</CardTitle>
                        </div>
                        <CardDescription>Connect your Telegram to enable voice-to-text updates.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.telegramUserId ? (
                            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-900">Account Linked</p>
                                            <p className="text-sm text-green-700">Currently active and tracking</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-600 hover:bg-green-700 text-white px-3 py-1">
                                        @{user.telegramUsername}
                                    </Badge>
                                </div>
                                <p className="text-sm text-green-800 leading-relaxed">
                                    Your Telegram ID (<span className="font-mono">{user.telegramUserId}</span>) is associated with this account.
                                    Any voice or video updates you send to the bot will appear in your dashboard.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-2 bg-amber-100 rounded-full shrink-0">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-amber-900">Not Linked</h4>
                                        <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                            You haven&apos;t connected your Telegram account yet. You won&apos;t be able to log updates until this is set up.
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Link Telegram Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <TelegramLinkModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSuccess={refreshUser}
            />
        </div>
    );
}
