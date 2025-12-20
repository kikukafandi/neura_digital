"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "Produk", href: "/dashboard/products", icon: Package },
        { name: "User & Aktivitas", href: "/dashboard/users", icon: Users },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-slate-900">
            {/* --- Sidebar --- */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2540] text-white shadow-xl transition-transform duration-300 ease-in-out">
                <div className="flex h-16 items-center justify-center border-b border-white/10 px-6">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        Node Admin
                    </Link>
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
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 left-0 w-full px-4">
                    <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-white/5 hover:text-red-300 transition-all">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <div className="ml-64 flex-1">
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur-md">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {menuItems.find((m) => m.href === pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                            AD
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}