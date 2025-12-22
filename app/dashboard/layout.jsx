"use client";

import { useState } from "react"; // Tambah useState
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    CheckSquare,
    Settings,
    LogOut,
    User as UserIcon,
    Sparkles,
    Menu, // Icon Hamburger
    X     // Icon Close
} from "lucide-react";
import { logout } from "@/app/actions";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;

    // State untuk Mobile Menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Library Aset", href: "/dashboard/library", icon: Package },
        { name: "Tugas & Fokus", href: "/dashboard/tasks", icon: CheckSquare },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-slate-900">

            {/* --- MOBILE OVERLAY (Hitam Transparan saat menu buka) --- */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                />
            )}

            {/* --- SIDEBAR (Responsive) --- */}
            {/* Logic: 
                - Mobile: Default hidden (-translate-x-full), muncul jika state open (translate-x-0)
                - Desktop (lg): Selalu muncul (lg:translate-x-0)
            */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0A2540] text-white shadow-2xl 
                transform transition-transform duration-300 ease-in-out flex flex-col
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0
            `}>

                {/* Brand Logo & Close Button (Mobile) */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Sparkles size={18} fill="currentColor" className="text-white/90" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight leading-none">Simpul Nalar</span>
                            <span className="text-[10px] text-blue-200/60 uppercase tracking-widest mt-1 font-medium">Workspace</span>
                        </div>
                    </Link>
                    {/* Tombol Tutup di Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)} // Tutup menu saat klik link di HP
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative ${isActive
                                        ? "bg-white/10 text-white shadow-inner"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                                )}
                                <Icon size={20} className={`transition-colors ${isActive ? "text-blue-400" : "text-slate-500 group-hover:text-blue-300"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/10 bg-[#081F36]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 p-[2px] flex-shrink-0">
                            <div className="h-full w-full rounded-full bg-[#0A2540] flex items-center justify-center overflow-hidden">
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-sm text-blue-200">{user?.name?.charAt(0) || "U"}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || "Member"}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all">
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            {/* Logic: Margin kiri 0 di mobile, 72 (18rem) di Desktop */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 lg:ml-72">

                {/* Header Mobile & Desktop */}
                <header className="sticky top-0 z-40 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 bg-[#F3F4F6]/80 backdrop-blur-md border-b border-slate-200/50">

                    <div className="flex items-center gap-4">
                        {/* Tombol Hamburger (Hanya muncul di Mobile) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-lg lg:hidden"
                        >
                            <Menu size={24} />
                        </button>

                        <h2 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight truncate">
                            {menuItems.find((m) => m.href === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>

                    {/* Status Indikator (Hidden di HP kecil banget) */}
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100/50 border border-emerald-200 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-700">Sistem Aktif</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}