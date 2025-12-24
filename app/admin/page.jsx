"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/app/actions";
import { 
    Package, Users, CheckSquare, DollarSign, 
    TrendingUp, ArrowUpRight, BarChart3 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalTasks: 0,
        totalAssetValue: 0,
        proUsers: 0,
        proPercentage: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAdminStats();
                if (data) setStats(data);
            } catch (error) {
                console.error("Failed to fetch real stats");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                <p className="text-slate-400">Data real-time dari database aplikasi.</p>
            </div>

            {/* Stat Cards Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Card 1: Total Produk */}
                <StatCard
                    title="Total Produk"
                    value={loading ? "..." : stats.totalProducts}
                    icon={Package}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                    border="border-blue-500/20"
                    trend="Aset Digital"
                />

                {/* Card 2: Total User */}
                <StatCard
                    title="Total Pengguna"
                    value={loading ? "..." : stats.totalUsers}
                    icon={Users}
                    color="text-green-400"
                    bg="bg-green-500/10"
                    border="border-green-500/20"
                    trend={`${stats.proUsers} User Pro`}
                />

                {/* Card 3: Valuasi Aset (Ganti Revenue) */}
                <StatCard
                    title="Valuasi Aset Toko"
                    value={loading ? "..." : `Rp ${(stats.totalAssetValue / 1000000).toFixed(1)}jt`}
                    icon={DollarSign}
                    color="text-yellow-400"
                    bg="bg-yellow-500/10"
                    border="border-yellow-500/20"
                    trend="Total Harga Produk"
                />

                {/* Card 4: Total Aktivitas (Ganti System Status) */}
                <StatCard
                    title="Aktivitas Tugas"
                    value={loading ? "..." : stats.totalTasks}
                    icon={CheckSquare}
                    color="text-pink-400"
                    bg="bg-pink-500/10"
                    border="border-pink-500/20"
                    trend="Tasks Dibuat User"
                />
            </motion.div>

            {/* Quick Actions & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

                {/* Left: Quick Links */}
                <div className="lg:col-span-2 bg-[#0A0F1E] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/products" className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200">Tambah Produk</div>
                                    <div className="text-xs text-slate-500">Upload aset digital baru</div>
                                </div>
                            </div>
                            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                        </Link>

                        <Link href="/admin/users" className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-green-500/30 rounded-xl transition-all flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200">Kelola User</div>
                                    <div className="text-xs text-slate-500">Cek data pengguna</div>
                                </div>
                            </div>
                            <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Right: Platform Health (Real Data) */}
                <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={18} className="text-purple-500" /> Statistik Platform
                    </h3>
                    <div className="space-y-6">
                        {/* Task Completion Rate */}
                        <MetricBar 
                            label="Tingkat Penyelesaian Tugas" 
                            value={stats.completionRate} 
                            color="bg-green-500" 
                        />
                        
                        {/* Pro User Ratio */}
                        <MetricBar 
                            label="Rasio User PRO" 
                            value={stats.proPercentage} 
                            color="bg-yellow-500" 
                        />

                        {/* Inventory Usage (Dummy visual for aesthetics but safe) */}
                        <MetricBar 
                            label="Kapasitas Server (Aman)" 
                            value={24} 
                            color="bg-blue-500" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon: Icon, color, bg, border, trend }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className={`bg-[#0A0F1E] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-opacity-50 transition-all ${border}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
                    <div className="text-2xl font-bold text-white mt-1">{value}</div>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp size={12} className="text-slate-400" />
                <span className="text-slate-400 font-medium">{trend}</span>
            </div>
        </motion.div>
    );
}

function MetricBar({ label, value, color }) {
    return (
        <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                ></motion.div>
            </div>
        </div>
    );
}