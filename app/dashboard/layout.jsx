"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard, Package, CheckSquare, Settings, LogOut,
    User as UserIcon, Zap, Menu, X, ChevronRight, ChevronLeft
} from "lucide-react";
import { logout } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // Mode Desktop Lipat

    // Tutup menu mobile saat pindah halaman
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const menuItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Tugas Saya", href: "/dashboard/tasks", icon: CheckSquare },
        { name: "Library Aset", href: "/dashboard/library", icon: Package },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] font-sans text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0F1E] border-b border-white/5 z-40 flex items-center justify-between px-4 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-white">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <span>Simpul Nalar</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg active:scale-95 transition"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* --- MOBILE OVERLAY --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* --- SIDEBAR (Responsive & Collapsible) --- */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-[#0A0F1E] border-r border-white/5 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"} 
                md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-72"}`}
            >
                {/* Header Sidebar */}
                <div className={`h-20 flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-6"} border-b border-white/5 bg-blue-950/10 shrink-0 transition-all overflow-hidden`}>
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] shrink-0">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <div className={`flex flex-col transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
                            <span className="text-lg font-bold text-white tracking-tight leading-none">Simpul Nalar</span>
                            <span className="text-[10px] text-blue-400 uppercase tracking-widest mt-1 font-medium">Workspace</span>
                        </div>
                    </Link>

                    {/* Close Button Mobile */}
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Desktop Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-24 bg-[#0A0F1E] text-slate-400 border border-white/10 p-1 rounded-full shadow-lg hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.name : ""}
                                className={`group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                                    } ${isActive
                                        ? "text-white bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeStripUser"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"
                                    />
                                )}

                                <Icon size={20} className={`shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`} />

                                {!isCollapsed && (
                                    <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/5 bg-[#050B14]">
                    <div className={`flex items-center gap-3 mb-4 px-1 transition-all duration-300 ${isCollapsed ? "justify-center" : ""}`}>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shrink-0">
                            <div className="h-full w-full rounded-full bg-[#0A0F1E] flex items-center justify-center overflow-hidden">
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-sm text-cyan-400">{user?.name?.charAt(0) || "U"}</span>
                                )}
                            </div>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.name || "Member"}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    <form action={logout}>
                        <button className={`flex w-full items-center rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? "justify-center px-0" : "gap-2 px-4 justify-center"
                            }`}>
                            <LogOut size={16} className="shrink-0" />
                            {!isCollapsed && <span>Sign Out</span>}
                        </button>
                    </form>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className={`flex-1 relative transition-all duration-300 pt-16 md:pt-0 ${isCollapsed ? "md:ml-20" : "md:ml-72"}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>

                <main className="relative z-10 p-6 md:p-8 overflow-y-auto min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}