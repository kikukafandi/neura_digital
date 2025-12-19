"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Pastikan path ini benar
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

// Komponen Kartu Statistik
const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">{change}</span>
            <span className="ml-2 text-gray-400">vs bulan lalu</span>
        </div>
    </div>
);

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({ users: 0, products: 0, revenue: 0 });
    const [activities, setActivities] = useState([]);

    // --- Fetch Data Awal & Setup Realtime ---
    useEffect(() => {
        // 1. Fetch Data Awal (Mocking logic, ganti dengan query Supabase asli Anda)
        // const fetchInitialData = async () => {
        //    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact' });
        //    setStats(prev => ({ ...prev, users: userCount }));
        // }
        // fetchInitialData();

        // Mock Data untuk Demo Visual
        setStats({ users: 1240, products: 15, revenue: "Rp 15.2jt" });
        setActivities([
            { id: 1, user: "Budi Santoso", action: "Membeli Template Notion", time: "Baru saja" },
            { id: 2, user: "Siti Aminah", action: "Mendaftar akun baru", time: "5 menit lalu" },
            { id: 3, user: "Rudi H.", action: "Melihat produk E-Book", time: "12 menit lalu" },
        ]);

        // 2. Realtime Subscription (Untuk memantau tabel 'activities' atau 'orders')
        const channel = supabase
            .channel('realtime-dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
                // Jika ada aktivitas baru masuk ke database, update state secara langsung
                setActivities((current) => [payload.new, ...current].slice(0, 5));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard
                    title="Total User Aktif"
                    value={stats.users}
                    change="+12%"
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    title="Total Pendapatan"
                    value={stats.revenue}
                    change="+8.2%"
                    icon={DollarSign}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    title="Produk Terjual"
                    value="342"
                    change="+14%"
                    icon={Activity}
                    color="bg-purple-50 text-purple-600"
                />
            </div>

            {/* Realtime Activity Feed & Charts Placeholder */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* Kolom Kiri: Chart (Bisa integrasi Recharts nanti) */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-6 text-lg font-bold text-gray-900">Analitik Penjualan</h3>
                    <div className="flex h-64 items-end justify-between gap-2 px-4">
                        {/* Visualisasi dummy chart bar menggunakan CSS */}
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full rounded-t-lg bg-blue-100 transition-all hover:bg-blue-600 relative group">
                                <div
                                    className="absolute bottom-0 w-full rounded-t-lg bg-blue-600 opacity-80"
                                    style={{ height: `${h}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                                    {h * 10} Sales
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-gray-400">
                        <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
                    </div>
                </div>

                {/* Kolom Kanan: Live Activity Feed */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Aktivitas Live
                    </h3>
                    <div className="space-y-6">
                        {activities.map((act, idx) => (
                            <div key={idx} className="flex items-start gap-3 relative pb-6 last:pb-0">
                                {/* Garis konektor */}
                                {idx !== activities.length - 1 && (
                                    <div className="absolute left-[15px] top-8 h-full w-px bg-gray-100"></div>
                                )}

                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                                    <Users size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {act.user} <span className="font-normal text-gray-500">{act.action}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}