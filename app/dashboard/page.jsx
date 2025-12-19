"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, Globe, Smartphone, Laptop, Activity, RefreshCw, Filter, ListFilter } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
    // --- STATE ---
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, mobile: 0, desktop: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // State Filter & Limit Baru
    const [rowLimit, setRowLimit] = useState(100); // Default ambil 100 data
    const [startHour, setStartHour] = useState(0);   // Default jam 00:00
    const [endHour, setEndHour] = useState(23);      // Default jam 23:00

    const supabase = createClient();

    // --- FUNGSI FETCH DATA ---
    // Kita masukkan rowLimit sebagai parameter atau ambil dari state
    const fetchAnalytics = async () => {
        setIsRefreshing(true);

        const { data } = await supabase
            .from('traffic_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(rowLimit); // Gunakan limit dinamis

        if (data) {
            processLogs(data);
        }

        setTimeout(() => setIsRefreshing(false), 500);
    };

    // --- USE EFFECT (Polling) ---
    // Ditambahkan dependency [rowLimit] agar saat limit diganti, data langsung di-refresh
    useEffect(() => {
        fetchAnalytics();

        const intervalId = setInterval(() => {
            fetchAnalytics();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [rowLimit]);

    // Helper hitung statistik
    const processLogs = (data) => {
        setLogs(data);
        const mobile = data.filter(l => l.device_type === 'Mobile').length;
        setStats({
            total: data.length,
            mobile: mobile,
            desktop: data.length - mobile
        });
    };

    // --- LOGIKA FILTER JAM (CLIENT SIDE) ---
    // Kita filter 'logs' (data mentah) menjadi 'filteredLogs' (data tampil)
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const logDate = new Date(log.created_at);
            const logHour = logDate.getHours(); // Mengambil jam lokal (0-23)
            return logHour >= startHour && logHour <= endHour;
        });
    }, [logs, startHour, endHour]);

    // --- DATA GRAFIK (Menggunakan data MENTAH/logs agar statistik tetap global) ---
    const deviceData = useMemo(() => [
        { name: 'Mobile', value: stats.mobile },
        { name: 'Desktop', value: stats.desktop },
    ], [stats]);

    const trendData = useMemo(() => {
        const grouped = {};
        logs.forEach(log => {
            const date = new Date(log.created_at);
            const timeLabel = `${date.getHours()}:00`;
            grouped[timeLabel] = (grouped[timeLabel] || 0) + 1;
        });
        return Object.keys(grouped).map(key => ({
            time: key,
            visitors: grouped[key]
        })).reverse();
    }, [logs]);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* HEADER */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Traffic Analytics</h1>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : "text-slate-400"} />
                        {isRefreshing ? "Mengambil data..." : "Auto-refresh setiap 5 detik"}
                    </p>
                </div>

                {/* TOOLBAR LIMIT (Database Fetch) */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                    <ListFilter size={16} className="text-slate-500 ml-2" />
                    <span className="text-sm text-slate-600 font-medium">Ambil Data:</span>
                    <select
                        className="bg-slate-100 border-none text-sm rounded-md py-1 px-3 font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
                        value={rowLimit}
                        onChange={(e) => setRowLimit(Number(e.target.value))}
                    >
                        <option value="50">50 Terakhir</option>
                        <option value="100">100 Terakhir</option>
                        <option value="500">500 Terakhir</option>
                        <option value="1000">1000 Terakhir</option>
                    </select>
                </div>
            </div>

            {/* KARTU STATISTIK (Global) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:-translate-y-1">
                    <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Users size={28} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Kunjungan</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:-translate-y-1">
                    <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600"><Smartphone size={28} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Dari Mobile</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.mobile}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:-translate-y-1">
                    <div className="p-4 bg-purple-50 rounded-xl text-purple-600"><Laptop size={28} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Dari Desktop</p>
                        <p className="text-3xl font-bold text-slate-800">{stats.desktop}</p>
                    </div>
                </div>
            </div>

            {/* GRAFIK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={18} /> Tren Trafik (Realtime)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0A2540" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0A2540" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="visitors" stroke="#0A2540" fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-slate-800 mb-2 w-full text-left">Perangkat</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                    <Cell key="mobile" fill="#10B981" />
                                    <Cell key="desktop" fill="#8B5CF6" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
                            <span className="text-xs text-slate-400">Kunjungan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL LIVE LOG */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">

                    {/* Judul & Status */}
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800">Log Aktivitas</h3>
                        <div className={`px-2 py-1 rounded text-xs font-mono transition-colors ${isRefreshing ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                            {isRefreshing ? "Syncing..." : "Live"}
                        </div>
                    </div>

                    {/* TOOLBAR FILTER JAM (Client Side Filter) */}
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Filter size={14} />
                            <span className="font-bold text-xs uppercase">Filter Jam:</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0" max="23"
                                value={startHour}
                                onChange={(e) => setStartHour(Number(e.target.value))}
                                className="w-12 text-center border rounded bg-slate-50 text-sm py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                min="0" max="23"
                                value={endHour}
                                onChange={(e) => setEndHour(Number(e.target.value))}
                                className="w-12 text-center border rounded bg-slate-50 text-sm py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Lokasi</th>
                                <th className="px-6 py-4">Device</th>
                                <th className="px-6 py-4">Halaman</th>
                                <th className="px-6 py-4">IP</th>
                                <th className="px-6 py-4">Sumber</th>
                                <th className="px-6 py-4">Load (ms)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* KITA MAPPING filteredLogs (BUKAN logs MENTAH) */}
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Globe size={14} className="text-slate-400" />
                                            {log.city !== 'Unknown' ? `${log.city}, ${log.country}` : 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.device_type === 'Mobile' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {log.device_type === 'Mobile' ? <Smartphone size={12} /> : <Laptop size={12} />}
                                            {log.device_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs bg-slate-50 rounded w-fit px-2">
                                        {log.path_url}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{log.ip_address}</td>

                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-[150px] truncate" title={log.referrer}>
                                        {log.referrer === 'Direct' ? 'Langsung' : (log.referrer || '-').replace('https://', '').replace('http://', '').split('/')[0]}
                                    </td>

                                    <td className="px-6 py-4 text-xs font-mono">
                                        <span className={log.duration > 800 ? "text-red-500 font-bold" : "text-green-600"}>
                                            {log.duration ? `${log.duration}ms` : '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada data pada rentang jam {startHour}:00 - {endHour}:59
                                        <br />
                                        <span className="text-xs text-slate-300">(Total Data Mentah: {logs.length})</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}