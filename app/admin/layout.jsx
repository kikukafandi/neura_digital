"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, LogOut, ShieldAlert } from "lucide-react";
import { logout } from "@/app/actions";

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: "Admin Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Kelola Produk", href: "/admin/products", icon: Package }, // Pindah kesini
        { name: "Data User", href: "/admin/users", icon: Users },
    ];

    return (
        <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Sidebar Admin - Nuansa Gelap/Merah biar beda sama User */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 shadow-xl">
                <div className="flex h-16 items-center justify-center border-b border-white/10 px-6 bg-red-900/20">
                    <div className="flex items-center gap-2 text-white font-bold tracking-tight">
                        <ShieldAlert className="text-red-500" />
                        Admin Panel
                    </div>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                    ? "bg-red-600 text-white"
                                    : "hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 left-0 w-full px-4">
                    <form action={logout}>
                        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-white/5 hover:text-red-300 transition-all">
                            <LogOut size={20} />
                            Logout Admin
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 flex-1">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}