import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Package, Clock, Zap, CheckCircle2,
    ArrowRight, PlayCircle, TrendingUp, AlertCircle, 
    Star, Layout
} from "lucide-react";
import { getUserTasks, getProducts } from "@/app/actions";
import InsightEngine from "@/components/InsightEngine";

export default async function DashboardPage() {
    // 1. Cek Sesi
    const session = await auth();
    if (!session) redirect("/login");
    const user = session.user;

    // 2. Greeting Logic
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

    // 3. FETCH DATA REAL
    const myTasks = await getUserTasks(); 
    const allProducts = await getProducts(); 

    // 4. HITUNG STATISTIK
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    myTasks.forEach(task => {
        if (task.subtasks) {
            totalSubtasks += task.subtasks.length;
            completedSubtasks += task.subtasks.filter(s => s.isCompleted).length;
        }
    });

    const productivityScore = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    const pendingTasksCount = myTasks.filter(task => {
        if (!task.subtasks || task.subtasks.length === 0) return true;
        return task.subtasks.some(s => !s.isCompleted);
    }).length;

    return (
        <div className="space-y-8 pb-20 font-sans text-slate-200">

            {/* --- HERO SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Ada <span className="text-white font-bold">{pendingTasksCount} misi aktif</span> menantimu. Stay focused, execute faster.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <Link href="/dashboard/tasks" className="group bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1 w-full md:w-auto">
                        <Zap size={18} className="text-yellow-300 group-hover:animate-pulse" fill="currentColor" />
                        Mulai Fokus
                    </Link>
                </div>
            </div>

            {/* --- STATS CARDS (Cybernetic Style) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Pending */}
                <div className="bg-[#0A0F1E] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} className="text-orange-500"/>
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-orange-500/10 text-orange-400 rounded-lg flex items-center justify-center mb-4 border border-orange-500/20">
                            <Clock size={20} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Pending Missions</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{pendingTasksCount}</h3>
                        <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                            Perlu atensi segera
                        </p>
                    </div>
                </div>

                {/* Card 2: Productivity */}
                <div className="bg-[#0A0F1E] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={80} className="text-emerald-500"/>
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Completion Rate</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{productivityScore}%</h3>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${productivityScore}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Library */}
                <div className="bg-[#0A0F1E] p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={80} className="text-purple-500"/>
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center mb-4 border border-purple-500/20">
                            <Package size={20} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Digital Assets</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{allProducts.length}</h3>
                        <Link href="/dashboard/library" className="text-xs text-purple-400 font-bold mt-2 inline-flex items-center gap-1 hover:text-purple-300 transition-colors">
                            Buka Library <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT SPLIT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Kolom Kiri */}
                <div className="lg:col-span-2 space-y-6">
                    <InsightEngine />
                    {/* Banner Notion Warning (Dark Mode) */}
                    {!user.notionApiKey && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 flex-shrink-0 animate-pulse border border-red-500/20">
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">Notion Disconnected!</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Sinkronisasi database mati. Hubungkan API Key agar tugas tersimpan otomatis.
                                </p>
                            </div>
                            <Link href="/dashboard/settings" className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm rounded-xl hover:bg-red-500 hover:text-white transition whitespace-nowrap">
                                Connect Notion
                            </Link>
                        </div>
                    )}

                    {/* Recent Tasks List */}
                    <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <Layout size={20} className="text-blue-500"/> Misi Terakhir
                            </h3>
                            <Link href="/dashboard/tasks" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                Lihat Semua
                            </Link>
                        </div>

                        {myTasks.length > 0 ? (
                            <div className="space-y-3">
                                {myTasks.slice(0, 3).map((item) => {
                                    const done = item.subtasks?.filter(s => s.isCompleted).length || 0;
                                    const total = item.subtasks?.length || 0;
                                    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

                                    return (
                                        <div key={item.id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-4">
                                            {/* Circular Progress */}
                                            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                    <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                    <path className="text-blue-500 transition-all duration-1000 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]" strokeDasharray={`${percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                </svg>
                                                <span className="absolute text-[8px] font-bold text-white">{percent}%</span>
                                            </div>
                                            
                                            <div className="min-w-0 flex-1">
                                                <h4 className={`font-bold text-sm truncate ${percent === 100 ? 'text-slate-500 line-through' : 'text-white group-hover:text-blue-400'}`}>{item.content}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                                                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{done}/{total} Steps</span>
                                                </div>
                                            </div>
                                            
                                            <Link href="/dashboard/tasks" className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition">
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                                <p className="text-slate-500 text-sm mb-4">Belum ada misi aktif di database.</p>
                                <Link href="/dashboard/tasks" className="text-blue-400 font-bold text-sm hover:text-blue-300">
                                    + Create New Mission
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                    {/* Widget Course */}
                    <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-6 border border-blue-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider mb-3 border border-blue-500/30">
                                Academy
                            </span>
                            <h3 className="text-lg font-bold text-white mb-2">Computational Thinking</h3>
                            <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                                Cara developer senior memecah masalah besar menjadi kode sederhana yang efisien.
                            </p>
                            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50">
                                <PlayCircle size={14} /> Tonton Materi
                            </button>
                        </div>
                    </div>

                    {/* Widget Status Langganan */}
                    <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white text-sm">Status Akun</h3>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${user.plan === 'pro' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {user.plan} Plan
                            </span>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span>Akses Dashboard System</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <CheckCircle2 size={14} className={user.plan === 'pro' ? "text-green-500" : "text-slate-600"} />
                                <span className={user.plan === 'pro' ? "" : "text-slate-500"}>Unlimited Notion Sync</span>
                            </div>
                        </div>
                        {user.plan === 'free' && (
                            <Link href="/dashboard/settings" className="block w-full py-2 border border-white/10 text-center text-slate-300 font-bold text-xs rounded-xl hover:bg-white/5 hover:text-white transition">
                                Upgrade Pro
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}