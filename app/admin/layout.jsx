"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, Package, Users, LogOut, ShieldAlert, 
    Menu, X, ChevronLeft, ChevronRight 
} from "lucide-react";
import { logout } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // State untuk Desktop Collapse

    // Otomatis tutup sidebar mobile saat pindah halaman
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Kelola Produk", href: "/admin/products", icon: Package },
        { name: "Data Pengguna", href: "/admin/users", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] font-sans text-slate-200 selection:bg-red-500/30 selection:text-red-200">

            {/* --- MOBILE HEADER (Hanya Muncul di HP) --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0F1E] border-b border-white/5 z-40 flex items-center justify-between px-4 shadow-lg">
                <div className="flex items-center gap-2 font-bold text-white">
                     <ShieldAlert className="text-red-500" size={20} />
                     <span>Admin Panel</span>
                </div>
                <button 
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg active:scale-95 transition"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* --- OVERLAY GELAP (Mobile Only) --- */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* --- SIDEBAR ADMIN (Responsive & Collapsible) --- */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 bg-[#0A0F1E] border-r border-white/5 shadow-2xl flex flex-col transition-all duration-300 ease-in-out
                ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
                md:translate-x-0 ${isCollapsed ? "md:w-20" : "md:w-64"}`}
            >
                {/* Header Sidebar */}
                <div className={`h-20 flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-6"} border-b border-white/5 bg-red-950/10 shrink-0 transition-all overflow-hidden`}>
                    <div className="flex items-center gap-3 text-white font-bold tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
                            <ShieldAlert size={18} />
                        </div>
                        {/* Sembunyikan Teks saat Collapsed */}
                        <span className={`text-lg whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
                            Admin Panel
                        </span>
                    </div>
                    
                    {/* Tombol Close (Mobile) */}
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* DESKTOP TOGGLE BUTTON (COLLAPSE) */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-24 bg-[#0A0F1E] text-slate-400 border border-white/10 p-1 rounded-full shadow-lg hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all z-50"
                >
                    {isCollapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
                </button>

                {/* Menu Navigasi */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.name : ""} // Tooltip native saat collapsed
                                className={`group flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                                    isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                                } ${isActive
                                        ? "text-white bg-gradient-to-r from-red-600/20 to-transparent border border-red-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeStrip"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"
                                    />
                                )}

                                <Icon size={20} className={`shrink-0 ${isActive ? "text-red-500" : "text-slate-500 group-hover:text-slate-300"}`} />
                                
                                {/* Label Text */}
                                {!isCollapsed && (
                                    <span className="whitespace-nowrap opacity-100 transition-opacity duration-300">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar (Logout) */}
                <div className="p-4 border-t border-white/5">
                    <form action={logout}>
                        <button className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border hover:border-red-500/20 transition-all group ${
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        }`}>
                            <LogOut size={20} className="group-hover:text-red-500 transition-colors shrink-0" />
                            {!isCollapsed && <span className="whitespace-nowrap">Keluar</span>}
                        </button>
                    </form>
                    {!isCollapsed && (
                        <div className="mt-4 text-[10px] text-center text-slate-600 font-mono whitespace-nowrap overflow-hidden">
                            v2.4.0 • Secure
                        </div>
                    )}
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* Margin Kiri otomatis menyesuaikan lebar sidebar */}
            <div className={`flex-1 relative transition-all duration-300 pt-16 md:pt-0 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>

                <main className="relative z-10 p-6 md:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}