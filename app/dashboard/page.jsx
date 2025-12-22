import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Package, Clock, Zap, CheckCircle2,
    Database, ArrowRight, PlayCircle, TrendingUp
} from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/login");
    const user = session.user;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

    const myProducts = [
        { id: 1, name: "SaaS Starter Kit v2", type: "Source Code", date: "20 Des 2024", color: "bg-blue-600" },
        { id: 2, name: "Ultimate Life Planner", type: "Notion Template", date: "18 Des 2024", color: "bg-slate-800" }
    ];

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- HERO SECTION (Responsive Flex) --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm lg:text-lg leading-relaxed">
                        Fokus pada sistem, biarkan hasil mengikuti.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <Link href="/dashboard/tasks" className="group bg-[#0A2540] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1 w-full md:w-auto">
                        <Zap size={18} className="text-yellow-400 group-hover:animate-pulse" />
                        Mulai Fokus
                    </Link>
                </div>
            </div>

            {/* --- STATS CARDS (Responsive Grid) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Card 1 */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                            <Clock size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Pending Tasks</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">0 Tugas</h3>
                        <p className="text-xs text-orange-400 mt-3 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                            Sinkronisasi tertunda
                        </p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Produktivitas</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">0%</h3>
                        <p className="text-xs text-slate-400 mt-3">Belum ada data mingguan</p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Package size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Aset Dimiliki</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{myProducts.length} Item</h3>
                        <Link href="/dashboard/library" className="text-xs text-blue-600 font-bold mt-3 inline-flex items-center gap-1 hover:underline">
                            Lihat Library <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT SPLIT (Responsive Grid) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Kolom Kiri */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Banner Notion */}
                    {!user.notionApiKey && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 flex-shrink-0">
                                <Database size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800">Hubungkan Otak Kedua</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Integrasikan Notion Database kamu agar sistem bisa membaca dan mengatur tugasmu secara otomatis.
                                </p>
                            </div>
                            <Link href="/dashboard/settings" className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition shadow-md">
                                Setup Integrasi
                            </Link>
                        </div>
                    )}

                    {/* Quick Access */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-slate-800 text-lg">Library Terbaru</h3>
                            <Link href="/dashboard/library" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                Semua Aset
                            </Link>
                        </div>

                        {myProducts.length > 0 ? (
                            <div className="grid gap-4">
                                {myProducts.map((item) => (
                                    <div key={item.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${item.color}`}>
                                                <Package size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{item.name}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full whitespace-nowrap">
                                                        {item.type}
                                                    </span>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">• {item.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
                                <p className="text-slate-500 text-sm">Belum ada aset digital.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                    {/* Widget Course */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                                Academy
                            </span>
                            <h3 className="text-lg font-bold mb-2">Computational Thinking</h3>
                            <p className="text-blue-100 text-xs mb-4 leading-relaxed opacity-90">
                                Pelajari cara memecah masalah besar menjadi langkah kecil yang logis.
                            </p>
                            <button className="w-full py-2.5 bg-white text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
                                <PlayCircle size={14} /> Tonton Materi
                            </button>
                        </div>
                    </div>

                    {/* Widget Status Langganan */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 text-sm">Langganan</h3>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${user.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                {user.plan} Plan
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span>Akses Dashboard System</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                <CheckCircle2 size={14} className={user.plan === 'pro' ? "text-green-500" : "text-slate-300"} />
                                <span className={user.plan === 'pro' ? "" : "text-slate-400"}>Unlimited Notion Sync</span>
                            </div>
                        </div>
                        {user.plan === 'free' && (
                            <button className="mt-4 w-full py-2 border border-slate-900 text-slate-900 font-bold text-xs rounded-lg hover:bg-slate-900 hover:text-white transition">
                                Upgrade Pro
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}