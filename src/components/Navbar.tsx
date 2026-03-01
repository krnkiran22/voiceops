"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// --- INLINE SVG COMPONENTS ---

const IconMic = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
);

const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
);

const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);

const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const IconLogout = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // HIDE NAVBAR ON AUTH PAGES
    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
    const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAuthPage) return null;
    if (!user && !isAdminPage) return null;

    const navItems = [
        { name: 'DASHBOARD', href: '/dashboard', icon: IconDashboard },
        { name: 'SEARCH', href: '/search', icon: IconSearch, adminOnly: true },
        { name: 'ATTENDANCE', href: '/attendance', icon: IconClock, operatorOnly: true },
        { name: 'PROFILE', href: '/profile', icon: IconUser },
        { name: 'ADMIN', href: '/admin', icon: IconShield, adminOnly: true },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-white border-b-4 border-black">
            <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* BRAND */}
                <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform">
                    <div className="bg-black text-white p-2 flex items-center justify-center">
                        <IconMic />
                    </div>
                    <span className="font-black text-2xl tracking-tighter uppercase leading-none">VoiceOps</span>
                </Link>

                {/* LINKS */}
                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        // Role-based filtering
                        if (item.adminOnly && user?.role !== 'admin') return null;
                        if (item.operatorOnly && user?.role !== 'operator') return null;

                        // Don't show Dashboard/Profile if not logged in (fallback)
                        if (!user && (item.name === 'DASHBOARD' || item.name === 'PROFILE')) return null;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all",
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-black/40 hover:text-black hover:bg-black/5"
                                )}
                            >
                                <item.icon />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* USER ACTIONS */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <div className="hidden sm:flex flex-col items-end border-r-2 border-black/10 pr-6">
                                <span className="text-xs font-black uppercase tracking-tight">{user.name}</span>
                                <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest leading-none">{user.role}</span>
                            </div>

                            <button
                                onClick={logout}
                                className="group flex items-center justify-center w-12 h-12 border-2 border-black hover:bg-black hover:text-white transition-all active:scale-90"
                                title="TERMINATE SESSION"
                            >
                                <IconLogout />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="border-2 border-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                        >
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
