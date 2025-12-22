import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Package, Clock, Zap, CheckCircle2,
    Database, ArrowRight, PlayCircle, TrendingUp, AlertCircle
} from "lucide-react";
import { getUserTasks, getProducts } from "@/app/actions"; // Import Action Database

export default async function DashboardPage() {
    // 1. Cek Sesi
    const session = await auth();
    if (!session) redirect("/login");
    const user = session.user;

    // 2. Greeting Time Logic
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

    // 3. FETCH DATA REAL (Server Side Fetching)
    // Kita ambil data tugas user untuk menghitung statistik
    const myTasks = await getUserTasks(); 
    // Ambil produk (sementara ambil semua produk sebagai contoh library)
    const allProducts = await getProducts(); 

    // 4. HITUNG STATISTIK (Logic)
    // a. Hitung Produktivitas (Berdasarkan Subtask yang dicentang)
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    myTasks.forEach(task => {
        if (task.subtasks) {
            totalSubtasks += task.subtasks.length;
            completedSubtasks += task.subtasks.filter(s => s.isCompleted).length;
        }
    });

    const productivityScore = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    // b. Hitung Pending Tasks (Tugas Induk yang belum 100%)
    // Definisi pending: Jika masih ada subtask yang belum selesai
    const pendingTasksCount = myTasks.filter(task => {
        if (!task.subtasks || task.subtasks.length === 0) return true; // Kalau ga ada subtask dianggap pending
        return task.subtasks.some(s => !s.isCompleted);
    }).length;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* --- HERO SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name?.split(' ')[0]}!</span> 👋
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm lg:text-lg leading-relaxed">
                        Kamu punya <span className="font-bold text-slate-800">{pendingTasksCount} misi aktif</span> hari ini. Fokus pada sistem, biarkan hasil mengikuti.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <Link href="/dashboard/tasks" className="group bg-[#0A2540] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1 w-full md:w-auto">
                        <Zap size={18} className="text-yellow-400 group-hover:animate-pulse" />
                        Mulai Fokus
                    </Link>
                </div>
            </div>

            {/* --- STATS CARDS (REAL DATA) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Card 1: Pending Tasks */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                            <Clock size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Pending Missions</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingTasksCount} Tugas</h3>
                        <p className="text-xs text-orange-400 mt-3 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                            Perlu diselesaikan
                        </p>
                    </div>
                </div>

                {/* Card 2: Productivity Score */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Score Produktivitas</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{productivityScore}%</h3>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${productivityScore}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Assets (Library) */}
                <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                            <Package size={20} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Katalog Aset</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{allProducts.length} Item</h3>
                        <Link href="/dashboard/library" className="text-xs text-blue-600 font-bold mt-3 inline-flex items-center gap-1 hover:underline">
                            Buka Library <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT SPLIT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Kolom Kiri: Integrasi & Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Banner Notion (Hanya muncul jika user belum connect API Key) */}
                    {!user.notionApiKey && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 bg-red-500 h-full"></div>
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0 animate-pulse">
                                <AlertCircle size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800">Notion Belum Terhubung!</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Agar tugas yang kamu buat di sini tersimpan ke Notion, silakan atur koneksi terlebih dahulu.
                                </p>
                            </div>
                            <Link href="/dashboard/settings" className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition shadow-md whitespace-nowrap">
                                Hubungkan Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Quick Access / Recent Tasks View */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-slate-800 text-lg">Misi Terakhir</h3>
                            <Link href="/dashboard/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                Lihat Semua
                            </Link>
                        </div>

                        {myTasks.length > 0 ? (
                            <div className="grid gap-3">
                                {myTasks.slice(0, 3).map((item) => { // Tampilkan 3 task terbaru saja
                                    // Hitung progress per task
                                    const done = item.subtasks?.filter(s => s.isCompleted).length || 0;
                                    const total = item.subtasks?.length || 0;
                                    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

                                    return (
                                        <div key={item.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 w-full">
                                                {/* Icon Progress Bulat */}
                                                <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                                        <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-blue-600 transition-all duration-1000" strokeDasharray={`${percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                    </svg>
                                                    <span className="absolute text-[10px] font-bold text-slate-700">{percent}%</span>
                                                </div>
                                                
                                                <div className="min-w-0">
                                                    <h4 className={`font-bold transition-colors truncate ${percent === 100 ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.content}</h4>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full">
                                                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="text-xs text-slate-400">• {done}/{total} Langkah</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href="/dashboard/tasks" className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-50 items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
                                <p className="text-slate-500 text-sm mb-3">Belum ada misi aktif.</p>
                                <Link href="/dashboard/tasks" className="text-blue-600 font-bold text-sm hover:underline">
                                    + Buat Misi Baru
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Academy & Status */}
                <div className="space-y-6">
                    {/* Widget Course */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-2 py-1 bg-white/20 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                                Academy
                            </span>
                            <h3 className="text-lg font-bold mb-2">Computational Thinking</h3>
                            <p className="text-blue-100 text-xs mb-4 leading-relaxed opacity-90">
                                Cara developer senior memecah masalah besar menjadi kode sederhana.
                            </p>
                            <button className="w-full py-2.5 bg-white text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2">
                                <PlayCircle size={14} /> Tonton Materi
                            </button>
                        </div>
                    </div>

                    {/* Widget Status Langganan */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 text-sm">Status Akun</h3>
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
                            <Link href="/dashboard/settings" className="mt-4 block w-full py-2 border border-slate-900 text-center text-slate-900 font-bold text-xs rounded-lg hover:bg-slate-900 hover:text-white transition">
                                Upgrade Pro
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}