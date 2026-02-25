"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Mic, User, LogOut, Search, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    if (user.role === 'admin') {
        navItems.push({ name: 'Admin', href: '/admin', icon: Mic });
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Mic className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">VoiceOps</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-2",
                                pathname === item.href ? "text-blue-600" : "text-slate-600"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout}>
                        <LogOut className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
