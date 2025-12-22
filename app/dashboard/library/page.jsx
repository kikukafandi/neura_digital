"use client";

import { Package, Download, ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
    // Dummy Data (Nanti diganti fetch real dari DB pembelian)
    const assets = [
        { id: 1, name: "SaaS Starter Kit v2", category: "Source Code", type: "code", version: "2.1.0", update: "20 Des 2024" },
        { id: 2, name: "Ultimate Second Brain", category: "Notion Template", type: "notion", version: "1.0", update: "18 Des 2024" },
        { id: 3, name: "Finance Tracker Pro", category: "Notion Template", type: "notion", version: "3.5", update: "10 Des 2024" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Library Aset</h1>
                    <p className="text-slate-500 text-sm">Akses dan unduh semua tools digital yang kamu miliki.</p>
                </div>

                {/* Search Bar Mobile Friendly */}
                <div className="w-full md:w-auto flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input
                        placeholder="Cari aset..."
                        className="bg-transparent outline-none text-sm w-full md:w-48 text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Grid Library */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                        {/* Icon Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${item.type === 'code' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                <Package size={28} />
                            </div>
                            <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {item.category}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="mb-6 flex-1">
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2">
                                {item.name}
                            </h3>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Versi {item.version}
                                </p>
                                <p className="text-xs text-slate-400">Update terakhir: {item.update}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 transition">
                                <ExternalLink size={14} /> Panduan
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A2540] text-white font-bold text-xs hover:bg-slate-800 transition shadow-lg shadow-blue-900/10">
                                <Download size={14} /> Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}