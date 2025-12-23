"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Copy, ExternalLink, Database, Key, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function NotionSetupPage() {
    const [copied, setCopied] = useState(false);

    // Template Schema untuk user copy
    const schemaTemplate = `
Nama Kolom | Tipe Property
-----------|--------------
Name       | Title
Status     | Select (To Do, Doing, Done)
Date       | Date
    `.trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(schemaTemplate);
        setCopied(true);
        toast.success("Schema disalin!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Toaster position="top-center" />
            
            {/* Navbar Simple */}
            <div className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-30">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/dashboard/settings" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                        <ArrowLeft size={18} /> Kembali ke Settings
                    </Link>
                    <span className="text-sm font-bold text-slate-400">Dokumentasi Integrasi</span>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-6 pt-10">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Database size={32} className="text-slate-700" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Cara Menghubungkan <span className="text-blue-600">Notion</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                        Ikuti panduan 3 langkah ini untuk memberikan "otak kedua" pada Simpul Nalar. Hanya butuh waktu 2 menit.
                    </p>
                </div>

                {/* STEPS CONTAINER */}
                <div className="space-y-12 relative">
                    {/* Garis Vertikal */}
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 hidden md:block"></div>

                    {/* STEP 1: BUAT INTEGRASI */}
                    <div className="relative md:pl-20">
                        <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-white border-2 border-blue-600 text-blue-600 rounded-full items-center justify-center font-bold text-lg z-10">1</div>
                        <div className="md:hidden inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">Langkah 1</div>
                        
                        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                Dapatkan API Key (Token)
                            </h3>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    1. Buka halaman <a href="https://www.notion.so/my-integrations" target="_blank" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">Notion My Integrations <ExternalLink size={12}/></a>.
                                </p>
                                <p>
                                    2. Klik tombol <span className="font-bold text-slate-800">+ New integration</span>.
                                </p>
                                <p>
                                    3. Beri nama (contoh: <strong>"Simpul Nalar"</strong>), pilih workspace kamu, lalu klik <strong>Submit</strong>.
                                </p>
                                <p>
                                    4. Klik <span className="font-bold text-slate-800">Show</span> pada kolom <em>Internal Integration Secret</em>.
                                </p>
                            </div>
                            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                                <Key className="text-orange-500" size={20}/>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Copy Kode Ini</p>
                                    <p className="font-mono text-sm text-slate-800 font-bold truncate">secret_AbCdEfGhIjKlMnOpQrStUvWxYz123456</p>
                                </div>
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Salin</span>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: SIAPKAN DATABASE */}
                    <div className="relative md:pl-20">
                         <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-white border-2 border-slate-200 text-slate-400 rounded-full items-center justify-center font-bold text-lg z-10">2</div>
                         <div className="md:hidden inline-flex px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold mb-3">Langkah 2</div>

                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                Siapkan Database Notion
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Buat halaman baru di Notion, lalu buat Database (Table View). Pastikan kolom-kolomnya sesuai standar agar sinkronisasi lancar.
                            </p>
                            
                            {/* Visual Representation of Notion Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="ml-2 text-xs text-slate-400 font-medium">Notion Database Structure</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-lg">Name (Aa)</th>
                                                <th className="px-4 py-3">Status (Select)</th>
                                                <th className="px-4 py-3 rounded-r-lg">Date (Calendar)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-800">Contoh Tugas 1</td>
                                                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">To Do</span></td>
                                                <td className="px-4 py-3 text-slate-500">Jan 20, 2025</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STEP 3: HUBUNGKAN & AMBIL ID */}
                    <div className="relative md:pl-20">
                        <div className="hidden md:flex absolute left-0 top-0 w-12 h-12 bg-white border-2 border-slate-200 text-slate-400 rounded-full items-center justify-center font-bold text-lg z-10">3</div>
                        <div className="md:hidden inline-flex px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold mb-3">Langkah 3</div>

                        <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-4">
                                Beri Akses & Copy ID
                            </h3>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>
                                    1. Di halaman Database Notion kamu, klik menu <strong>... (titik tiga)</strong> di pojok kanan atas.
                                </p>
                                <p>
                                    2. Pilih menu <span className="font-bold text-slate-800">Connections</span>, lalu cari & pilih integrasi <strong>"Simpul Nalar"</strong> yang kamu buat tadi.
                                </p>
                                <p>
                                    3. Konfirmasi akses (Confirm).
                                </p>
                                <p>
                                    4. Sekarang, lihat URL di browser kamu. Copy kode unik di antara slash (/).
                                </p>
                            </div>

                            <div className="mt-6 bg-slate-800 text-slate-300 p-4 rounded-xl font-mono text-xs break-all leading-loose">
                                <p>https://www.notion.so/myworkspace/<span className="bg-blue-500/30 text-blue-200 px-1 rounded border border-blue-500/50 font-bold">8a2b3c4d5e6f...</span>?v=...</p>
                                <p className="mt-2 text-slate-500 text-[10px] uppercase tracking-widest font-sans font-bold">^ COPY BAGIAN YANG DI-HIGHLIGHT SAJA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA FOOTER */}
                <div className="mt-16 text-center pb-10">
                    <p className="text-slate-500 mb-6">Sudah punya API Key & Database ID?</p>
                    <Link 
                        href="/dashboard/settings" 
                        className="inline-flex items-center gap-2 bg-[#0A2540] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl hover:-translate-y-1"
                    >
                        <CheckCircle2 /> Masukkan di Settings
                    </Link>
                </div>

            </main>
        </div>
    );
}