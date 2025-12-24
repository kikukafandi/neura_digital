"use client";

import { useState, useEffect } from "react";
import {
    User, Lock, Database, CreditCard, Save, Loader2,
    Key, Link as LinkIcon, ShieldAlert, CheckCircle2, Zap, TrendingUp,
    Camera, ChevronRight, Menu, Smartphone, MessageCircle
} from "lucide-react";
import {
    updateNotionSettings,
    updateIntegrationSettings,
    getIntegrationSettings,
    changePassword,
    updateProfile
} from "@/app/actions";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

// --- MAIN PAGE COMPONENT ---
export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("profile");

    if (status === "loading") {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-slate-400 text-xs font-medium tracking-wide">Memuat Data...</p>
            </div>
        );
    }

    const tabs = [
        { id: "profile", label: "Profil", icon: User, desc: "Identitas" },
        { id: "integration", label: "Integrasi", icon: Database, desc: "Notion & WA" },
        { id: "security", label: "Keamanan", icon: Lock, desc: "Password" },
        { id: "billing", label: "Paket", icon: CreditCard, desc: "Langganan" },
    ];

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-24 text-slate-200">
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', fontSize: '14px', border: '1px solid #334155' } }} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="text-cyan-400" /> Pengaturan Akun
                </h1>
                <p className="text-slate-400 mt-1">Kelola preferensi dan keamanan akun Anda.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
                {/* NAVIGASI (SIDEBAR) */}
                <aside className="w-full lg:w-72 flex-shrink-0 z-30 lg:sticky lg:top-24">
                    <nav className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-2 grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative group flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 px-2 py-3 lg:px-4 lg:py-3.5 text-center lg:text-left rounded-xl transition-all duration-300 ${isActive
                                        ? "bg-blue-600/10 text-cyan-400 border border-blue-500/20"
                                        : "text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent"
                                        }`}
                                >
                                    {isActive && <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-cyan-400/10 text-cyan-400" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs md:text-sm font-bold ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>{tab.label}</span>
                                        <span className="hidden lg:block text-[10px] text-slate-500 font-medium group-hover:text-slate-400">{tab.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 w-full min-w-0">
                    <div className="space-y-6">
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
    const { update } = useSession();
    const user = session?.user;
    const [isSaving, setIsSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState(user?.image || "");

    async function handleUpdateProfile(formData) {
        setIsSaving(true);
        const newName = formData.get("name");
        let newImage = formData.get("image");

        if (!newImage) {
            newImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=0A0F1E&color=fff`;
            formData.set("image", newImage);
        }

        const res = await updateProfile(formData);

        if (res?.error) {
            toast.error(res.error);
        } else {
            // Update session di client agar UI berubah tanpa refresh
            await update({ 
                ...session, 
                user: { ...user, name: newName, image: newImage } 
            });
            toast.success("Profil diperbarui!");
        }
        setIsSaving(false);
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            {/* Header Profil */}
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-900 to-slate-900 opacity-50"></div>

                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-10">
                    <div className="relative group/avatar flex-shrink-0">
                        <div className="w-24 h-24 rounded-full p-1 bg-[#0A0F1E] shadow-2xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 relative border border-white/10">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-center sm:text-left pb-1 flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white truncate">{user?.name}</h2>
                        <p className="text-slate-400 text-sm font-medium truncate">{user?.email}</p>
                    </div>

                    <div className="pb-2">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wide rounded-full border border-blue-500/20">
                            {user?.role || "Member"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form Edit */}
            <form action={handleUpdateProfile} className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400"><User size={18} /></div>
                    <h3 className="font-bold text-white">Informasi Dasar</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                        <input
                            name="name"
                            defaultValue={user?.name || ""}
                            required
                            className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL Foto Profil</label>
                        <div className="relative">
                            <input
                                name="image"
                                type="url"
                                placeholder="https://..."
                                defaultValue={user?.image || ""}
                                onChange={(e) => setPreviewImage(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white text-sm"
                            />
                            <Camera size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Akun</label>
                        <div className="relative">
                            <input
                                value={user?.email || ""}
                                disabled
                                className="w-full px-4 py-3 pl-10 bg-[#0F172A] border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed font-medium text-sm"
                            />
                            <CheckCircle2 size={16} className="absolute left-3.5 top-3.5 text-green-500/50" />
                        </div>
                        <p className="text-[10px] text-slate-600">Email tidak dapat diubah demi keamanan.</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <SaveButton isSaving={isSaving} text="Simpan Perubahan" />
                </div>
            </form>
        </div>
    );
}

// --- SUB-COMPONENT: INTEGRATION FORM ---
function IntegrationForm() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [formData, setFormData] = useState({ notionApiKey: "", notionDbId: "", whatsappNumber: "" });

    useEffect(() => {
        getIntegrationSettings().then((data) => {
            if (data) setFormData({ ...data });
            setIsLoadingData(false);
        });
    }, []);

    async function handleSave(e) {
        e.preventDefault();
        setIsSaving(true);
        const formPayload = new FormData(e.target);
        const res = await updateIntegrationSettings(formPayload);
        setIsSaving(false);
        if (res?.error) toast.error(res.error);
        else toast.success("Integrasi tersimpan!");
    }

    if (isLoadingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <form onSubmit={handleSave} className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* NOTION */}
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400"><Database size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">Notion Sync</h3>
                        <p className="text-xs text-slate-400">Hubungkan database Notion.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Integration Token</label>
                        <input name="notionApiKey" type="password" defaultValue={formData.notionApiKey} placeholder="secret_..." className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white text-xs transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Database ID</label>
                        <input name="notionDbId" type="text" defaultValue={formData.notionDbId} placeholder="xxxxxxxx" className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white text-xs transition-all" />
                    </div>
                </div>
            </div>

            {/* WHATSAPP */}
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><MessageCircle size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">WhatsApp Notifier</h3>
                        <p className="text-xs text-slate-400">Terima notifikasi tugas di HP Anda.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                        Kami akan mengirimkan notifikasi ringkas setiap kali Anda membuat misi baru. Pastikan nomor aktif.
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nomor WhatsApp Anda</label>
                        <div className="relative group">
                            <input
                                name="whatsappNumber"
                                type="tel"
                                defaultValue={formData.whatsappNumber}
                                placeholder="Contoh: 081234567890"
                                className="w-full px-4 py-3 pl-10 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-green-500 text-white text-sm transition-all font-medium"
                            />
                            <Smartphone className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-green-500" size={16} />
                        </div>
                        <p className="text-[10px] text-slate-500">Gunakan format angka saja (08xx atau 628xx).</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <SaveButton isSaving={isSaving} text="Simpan Semua" />
            </div>
        </form>
    );
}

// --- SUB-COMPONENT: SECURITY FORM ---
function SecurityForm({ session }) {
    const user = session?.user;
    const [isSaving, setIsSaving] = useState(false);
    const isOAuthUser = !user?.password && (user?.image?.includes("google") || user?.image?.includes("github"));

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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400"><Lock size={18} /></div>
                    <h3 className="font-bold text-white">Ubah Password</h3>
                </div>

                {isOAuthUser ? (
                    <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-2xl flex gap-4">
                        <ShieldAlert className="text-orange-500 mt-1 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-orange-400 mb-1 text-sm md:text-base">Login Pihak Ketiga</h4>
                            <p className="text-xs md:text-sm text-orange-200/70 leading-relaxed">
                                Anda login via Google/GitHub. Keamanan password diatur oleh penyedia layanan tersebut.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form id="form-password" action={handleChangePassword} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Lama</label>
                            <input name="oldPassword" type="password" required className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white transition-all text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
                            <input name="newPassword" type="password" required minLength={8} className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white transition-all text-sm" />
                        </div>
                        <div className="pt-4">
                            <button disabled={isSaving} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <ShieldAlert size={16} />}
                                Update Password
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: BILLING VIEW ---
function BillingView({ session }) {
    const user = session?.user;
    const isPro = user?.plan === 'pro';

    const usageStats = [
        { label: "Notion Syncs", used: isPro ? 1450 : 12, limit: isPro ? "∞" : 50, color: "bg-blue-500" },
        { label: "AI Requests", used: isPro ? 85 : 5, limit: isPro ? 500 : 10, color: "bg-purple-500" },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PLAN CARD */}
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#0A0F1E] border border-white/5 text-white shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[260px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/5">
                                Current Plan
                            </span>
                            {isPro && <div className="bg-yellow-500 text-[#0A0F1E] text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">PRO</div>}
                        </div>
                        <h3 className="mt-4 text-4xl font-extrabold capitalize text-white">{user?.plan || "Free"}</h3>
                        <p className="text-slate-400 mt-2 text-sm max-w-xs leading-relaxed">
                            {isPro ? "Akses penuh fitur premium." : "Upgrade untuk membuka potensi penuh."}
                        </p>
                    </div>

                    <div className="relative z-10 pt-6">
                        {isPro ? (
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                                <CheckCircle2 className="text-green-500" size={20} />
                                <div className="text-xs">
                                    <p className="font-bold text-white">Langganan Aktif</p>
                                    <p className="text-slate-400">Next billing: 20 Jan 2025</p>
                                </div>
                            </div>
                        ) : (
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 group text-sm">
                                <Zap size={16} className="text-yellow-300 fill-yellow-300 group-hover:scale-110 transition-transform" />
                                Upgrade Sekarang
                            </button>
                        )}
                    </div>
                </div>

                {/* USAGE STATS */}
                <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 flex flex-col justify-center">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2 text-sm md:text-base">
                        <TrendingUp size={18} className="text-blue-500" />
                        Penggunaan Bulan Ini
                    </h4>
                    <div className="space-y-6">
                        {usageStats.map((stat, idx) => {
                            const percentage = typeof stat.limit === 'number' ? (stat.used / stat.limit) * 100 : 15;
                            return (
                                <div key={idx}>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                        <span className="text-white">{stat.used} <span className="text-slate-500 font-normal">/ {stat.limit}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${stat.color} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
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
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[0_0_15px_-5px_rgba(37,99,235,0.5)] active:scale-95 text-sm"
        >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {text}
        </button>
    );
}