"use client";

import { useState, useEffect } from "react";
import {
    User, Lock, Database, CreditCard, Save, Loader2,
    Key, Link as LinkIcon, ShieldAlert, Camera,  CheckCircle2, Zap, TrendingUp,
    FileText, AlertCircle, ArrowUpRight
} from "lucide-react";
import { updateNotionSettings, changePassword, updateProfile } from "@/app/actions";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// --- MAIN PAGE COMPONENT ---
export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("profile");

    // LOADING STATE (PENTING: Mencegah error input undefined)
    if (status === "loading") {
        return (
            <div className="max-w-6xl mx-auto p-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <Loader2 className="animate-spin text-slate-300" size={40} />
                <p className="text-slate-400 text-sm font-medium">Memuat data akun...</p>
            </div>
        );
    }

    const tabs = [
        { id: "profile", label: "Profil", icon: User },
        { id: "integration", label: "Integrasi", icon: Database },
        { id: "security", label: "Keamanan", icon: Lock },
        { id: "billing", label: "Langganan", icon: CreditCard },
    ];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
            <Toaster position="top-center" />

            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Pengaturan</h1>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Kelola preferensi akun dan konfigurasi sistem.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">

                {/* --- SIDEBAR NAVIGATION --- */}
                <aside className="w-full lg:w-72 flex-shrink-0 bg-white lg:bg-transparent z-30 sticky top-16 lg:top-24 shadow-sm lg:shadow-none border-b lg:border-none border-slate-200 -mx-4 px-4 lg:mx-0 lg:px-0 py-2 lg:py-0">
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-1 lg:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap border ${isActive
                                        ? "bg-[#0A2540] text-white border-[#0A2540] shadow-md"
                                        : "bg-slate-50 lg:bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* --- CONTENT AREA --- */}
                <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 z-0 opacity-50 pointer-events-none"></div>

                    <div className="relative z-10 p-5 md:p-8 lg:p-10">
                        {/* Kita pass 'session' ke child component biar tidak perlu panggil useSession lagi */}
                        {activeTab === "profile" && <ProfileForm session={session} />}
                        {activeTab === "integration" && <IntegrationForm />}
                        {activeTab === "security" && <SecurityForm session={session} />}
                        {activeTab === "billing" && <BillingView session={session} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: PROFILE FORM ---
function ProfileForm({ session }) {
    const { update } = useSession(); // Hanya ambil method update
    const user = session?.user;

    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.image || "");

    async function handleUpdateProfile(formData) {
        setIsSaving(true);
        const newName = formData.get("name");

        let newImage = formData.get("image");
        if (!newImage) {
            newImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=0A2540&color=fff`;
            formData.set("image", newImage);
        }

        const res = await updateProfile(formData);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profil diperbarui!");
            await update({
                ...session,
                user: { ...user, name: newName, image: newImage }
            });
        }
        setIsSaving(false);
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Profil & Identitas</h2>
                <p className="text-sm text-slate-500">Sesuaikan tampilan publik Anda.</p>
            </div>

            <form action={handleUpdateProfile} className="space-y-6 md:space-y-8 max-w-xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                    <div className="relative group flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-300" />
                            )}
                        </div>
                    </div>

                    <div className="w-full text-center sm:text-left space-y-3">
                        <div>
                            <label className="text-sm font-bold text-slate-700 block mb-2">URL Foto Profil</label>
                            <input
                                name="image"
                                type="url"
                                placeholder="https://..."
                                // FIX: Gunakan fallback || "" untuk menghindari undefined
                                defaultValue={user?.image || ""}
                                onChange={(e) => setPreviewImage(e.target.value)}
                                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                Paste link gambar (Google Photos, LinkedIn, dll). Biarkan kosong untuk Avatar inisial otomatis.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                        <input
                            name="name"
                            // FIX: DefaultValue harus ada fallback string kosong
                            defaultValue={user?.name || ""}
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            Email <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full uppercase tracking-wider">Read Only</span>
                        </label>
                        <input
                            // FIX UTAMA: Gunakan fallback || "" agar input selalu Controlled
                            value={user?.email || ""}
                            disabled
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <SaveButton isSaving={isSaving} text="Simpan Perubahan" />
                </div>
            </form>
        </div>
    );
}

// --- SUB-COMPONENT: INTEGRATION FORM ---
function IntegrationForm() {
    const [isSaving, setIsSaving] = useState(false);

    async function handleSaveNotion(formData) {
        setIsSaving(true);
        const res = await updateNotionSettings(formData);
        setIsSaving(false);
        if (res?.error) toast.error(res.error);
        else toast.success("Integrasi Notion berhasil disimpan!");
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Integrasi Notion (BYOK)</h2>
                <p className="text-sm text-slate-500 mt-1">Hubungkan database Notion untuk sinkronisasi.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm w-fit h-fit text-blue-600">
                    <Database size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Privasi Terjamin</h4>
                    <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                        API Key Anda disimpan terenkripsi. Simpul Nalar hanya membaca data tugas Anda sendiri.
                    </p>
                </div>
            </div>

            <form action={handleSaveNotion} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Notion API Key</label>
                    <div className="relative">
                        <input name="apiKey" type="password" placeholder="secret_..." className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm" />
                        <Key className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Database ID</label>
                    <div className="relative">
                        <input name="dbId" type="text" placeholder="32 chars ID..." className="w-full px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm" />
                        <LinkIcon className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                </div>
                <SaveButton isSaving={isSaving} text="Simpan Koneksi" />
            </form>
        </div>
    );
}

// --- SUB-COMPONENT: SECURITY FORM ---
function SecurityForm({ session }) {
    const user = session?.user;
    const [isSaving, setIsSaving] = useState(false);

    // Cek apakah login via OAuth
    const isOAuthUser = user?.image?.includes("googleusercontent") || user?.image?.includes("githubusercontent");

    async function handleChangePassword(formData) {
        setIsSaving(true);
        const res = await changePassword(formData);
        setIsSaving(false);
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Password diperbarui!");
            document.getElementById("form-password").reset();
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Keamanan Akun</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola password akses Anda.</p>
            </div>

            {isOAuthUser ? (
                <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
                    <ShieldAlert className="text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-orange-900">Login Eksternal Terdeteksi</h4>
                        <p className="text-sm text-orange-800/80 mt-2 leading-relaxed">
                            Anda masuk menggunakan Google/GitHub. Keamanan password dikelola langsung oleh penyedia layanan tersebut.
                        </p>
                    </div>
                </div>
            ) : (
                <form id="form-password" action={handleChangePassword} className="space-y-5 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Password Lama</label>
                        <input name="oldPassword" type="password" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Password Baru</label>
                        <input name="newPassword" type="password" required minLength={8} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                        <p className="text-xs text-slate-400">Minimal 8 karakter.</p>
                    </div>
                    <div className="pt-2">
                        <button disabled={isSaving} className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-red-900/10">
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />} Update Password
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function BillingView({ session }) {
    const user = session?.user;
    const isPro = user?.plan === 'pro';

    // Mockup data penggunaan (Bisa diganti real data nanti)
    const usageStats = [
        { label: "Notion Syncs", used: isPro ? 1450 : 50, limit: isPro ? "Unlimited" : 100, color: "bg-blue-500" },
        { label: "AI Atomizer", used: isPro ? 85 : 5, limit: isPro ? 500 : 10, color: "bg-purple-500" },
        { label: "Aset Library", used: 3, limit: isPro ? 50 : 5, color: "bg-emerald-500" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Status Langganan</h2>
                    <p className="text-sm text-slate-500 mt-1">Kelola paket aktif, kuota penggunaan, dan tagihan.</p>
                </div>
                {!isPro && (
                    <button className="hidden md:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition">
                        <FileText size={16} /> Download Invoice
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- KARTU VISUAL (Gradient Card) --- */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-[#0A2540] text-white shadow-xl group">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/30 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-10 group-hover:bg-purple-500/30 transition-all duration-700"></div>

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>

                    <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full min-h-[220px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">Current Plan</p>
                                <h3 className="text-3xl md:text-4xl font-extrabold capitalize tracking-tight flex items-center gap-3">
                                    {user?.plan || "Free"}
                                    {isPro && <span className="bg-yellow-400 text-[#0A2540] text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider shadow-lg shadow-yellow-400/50">PRO</span>}
                                </h3>
                            </div>
                            <div className="w-12 h-8 bg-white/10 backdrop-blur-md rounded-md border border-white/20 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-white/20"></div>
                                <div className="w-6 h-6 rounded-full bg-white/20 -ml-3"></div>
                            </div>
                        </div>

                        <div className="mt-8">
                            {isPro ? (
                                <div className="flex items-center gap-3 text-sm font-medium text-blue-100">
                                    <CheckCircle2 className="text-green-400" size={18} />
                                    <span>Pembaruan otomatis pada <span className="text-white font-bold">20 Jan 2025</span></span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-blue-100/80">
                                        <AlertCircle size={16} />
                                        <span>Fitur Anda terbatas. Upgrade untuk akses penuh.</span>
                                    </div>
                                    <button className="w-full sm:w-auto px-6 py-3 bg-white text-[#0A2540] font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] duration-200">
                                        <Zap size={16} className="text-yellow-500 fill-yellow-500" /> Upgrade ke Pro
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- USAGE TRACKER (Sidebar Kanan) --- */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Penggunaan Bulan Ini
                    </h4>

                    <div className="space-y-5">
                        {usageStats.map((stat, idx) => {
                            // Hitung persentase dummy
                            const percentage = typeof stat.limit === 'number'
                                ? (stat.used / stat.limit) * 100
                                : 15; // Kalau unlimited anggap aja 15% visualnya

                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-slate-600">{stat.label}</span>
                                        <span className="text-slate-900">{stat.used} <span className="text-slate-400">/ {stat.limit}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${stat.color} transition-all duration-1000`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- PAYMENT METHOD & HISTORY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">

                {/* Payment Method */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900">Metode Pembayaran</h4>
                    <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div className="w-12 h-8 bg-slate-200 rounded-md border border-slate-300 flex items-center justify-center text-slate-400">
                            <CreditCard size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-700">•••• •••• •••• 4242</p>
                            <p className="text-xs text-slate-500">Exp 12/28</p>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline">Ganti</button>
                    </div>
                </div>

                {/* Invoice History (Mockup) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-slate-900">Riwayat Tagihan</h4>
                        <button className="text-xs text-slate-500 hover:text-blue-600">Lihat Semua</button>
                    </div>
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex justify-between items-center text-sm p-3 hover:bg-slate-50 rounded-lg transition cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-green-100 text-green-700 rounded-md">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <span className="text-slate-600">Inv-2024-00{i}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-slate-900">Rp {isPro ? '99.000' : '0'}</span>
                                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600 transition" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENT ---
function SaveButton({ isSaving, text }) {
    return (
        <button
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#0A2540] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex justify-center items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/10"
        >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {text}
        </button>
    );
}