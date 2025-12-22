"use client";

import { useState, useEffect } from "react";
import {
    User, Lock, Database, CreditCard, Save, Loader2,
    Key, Link as LinkIcon, ShieldAlert, CheckCircle2, Zap, TrendingUp,
    Camera, ChevronRight, Menu
} from "lucide-react";
import { 
    updateNotionSettings, 
    getNotionSettings, 
    changePassword, 
    updateProfile 
} from "@/app/actions";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// --- MAIN PAGE COMPONENT ---
export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("profile");

    // LOADING STATE
    if (status === "loading") {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-slate-400 text-xs font-medium tracking-wide">Memuat...</p>
            </div>
        );
    }

    const tabs = [
        { id: "profile", label: "Profil", icon: User, desc: "Identitas" },
        { id: "integration", label: "Integrasi", icon: Database, desc: "Koneksi" },
        { id: "security", label: "Keamanan", icon: Lock, desc: "Akses" },
        { id: "billing", label: "Paket", icon: CreditCard, desc: "Langganan" },
    ];

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-24 px-4 pt-4 md:pt-8">
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', fontSize: '14px' } }} />

            {/* HEADER SECTION */}
            <div className="mb-6 md:mb-10">
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Pengaturan</h1>
                <p className="text-slate-500 mt-1 text-sm md:text-lg">Kelola akun dan preferensi sistem.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">

                {/* --- NAVIGATION (Grid di HP, Sidebar di Desktop) --- */}
                <aside className="w-full lg:w-72 flex-shrink-0 z-30 lg:sticky lg:top-24">
                    <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 grid grid-cols-2 gap-2 lg:flex lg:flex-col lg:gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative group flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 px-2 py-3 lg:px-4 lg:py-3.5 text-center lg:text-left rounded-xl transition-all duration-300 ${isActive
                                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 lg:ring-0"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                                    )}
                                    
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm"}`}>
                                        <Icon size={18} />
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className={`text-xs md:text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>{tab.label}</span>
                                        <span className="hidden lg:block text-[10px] text-slate-400 font-medium">{tab.desc}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* --- CONTENT AREA --- */}
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
            newImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=0A2540&color=fff`;
            formData.set("image", newImage);
        }

        const res = await updateProfile(formData);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Profil diperbarui!");
            await update({ ...session, user: { ...user, name: newName, image: newImage } });
        }
        setIsSaving(false);
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 md:space-y-6">
            
            {/* Kartu Header Profil */}
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-20 md:h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 md:gap-6 pt-8 md:pt-10">
                    <div className="relative group/avatar flex-shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center sm:text-left pb-1 flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{user?.name}</h2>
                        <p className="text-slate-500 text-xs md:text-sm font-medium truncate">{user?.email}</p>
                    </div>

                    <div className="pb-1">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-full border border-blue-100">
                            {user?.role || "Member"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Kartu Form Edit */}
            <form action={handleUpdateProfile} className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><User size={18} /></div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">Informasi Dasar</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                        <input
                            name="name"
                            defaultValue={user?.name || ""}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800 text-sm"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">URL Foto Profil</label>
                        <div className="relative">
                            <input
                                name="image"
                                type="url"
                                placeholder="https://..."
                                defaultValue={user?.image || ""}
                                onChange={(e) => setPreviewImage(e.target.value)}
                                className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                            <Camera size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Email Akun</label>
                        <div className="relative">
                            <input
                                value={user?.email || ""}
                                disabled
                                className="w-full px-4 py-3 pl-10 bg-slate-100/50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium text-sm"
                            />
                            <CheckCircle2 size={16} className="absolute left-3.5 top-3.5 text-green-500" />
                        </div>
                        <p className="text-[10px] text-slate-400">Email tidak dapat diubah.</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
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
    const [formData, setFormData] = useState({ apiKey: "", dbId: "" });
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        getNotionSettings().then((data) => {
            if (data) {
                setFormData({ apiKey: data.notionApiKey || "", dbId: data.notionDbId || "" });
                if (data.notionApiKey && data.notionDbId) setIsConnected(true);
            }
            setIsLoadingData(false);
        });
    }, []);

    async function handleSaveNotion(form) {
        setIsSaving(true);
        const res = await updateNotionSettings(form);
        setIsSaving(false);
        if (res?.error) toast.error(res.error);
        else {
            toast.success("Koneksi berhasil!");
            setIsConnected(true);
        }
    }

    if (isLoadingData) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-300"/></div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 md:space-y-6">
            
            {/* Status Card - Mobile Optimized */}
            <div className={`p-5 rounded-2xl md:rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors ${isConnected ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${isConnected ? "bg-emerald-500 text-white" : "bg-white text-slate-400"}`}>
                    <Database size={24} />
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold text-base md:text-lg ${isConnected ? "text-emerald-900" : "text-slate-700"}`}>
                        {isConnected ? "Notion Terhubung" : "Belum Terhubung"}
                    </h3>
                    <p className={`text-xs md:text-sm ${isConnected ? "text-emerald-700" : "text-slate-500"}`}>
                        {isConnected ? "Sinkronisasi aktif." : "Hubungkan API Key untuk mulai."}
                    </p>
                </div>
            </div>

            <form action={handleSaveNotion} className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Key size={18}/></div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">Kredensial API</h3>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Notion Integration Token</label>
                        <div className="relative group">
                            <input 
                                name="apiKey" 
                                type="password" 
                                defaultValue={formData.apiKey}
                                placeholder="secret_..." 
                                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs md:text-sm transition-all" 
                            />
                            <Key className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={16} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Database ID</label>
                        <div className="relative group">
                            <input 
                                name="dbId" 
                                type="text" 
                                defaultValue={formData.dbId}
                                placeholder="xxxxxxxxxxxxxxxx" 
                                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs md:text-sm transition-all" 
                            />
                            <LinkIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500" size={16} />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <SaveButton isSaving={isSaving} text="Simpan Koneksi" />
                </div>
            </form>
        </div>
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
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Lock size={18}/></div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">Ubah Password</h3>
                </div>

                {isOAuthUser ? (
                    <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex gap-4">
                        <ShieldAlert className="text-orange-600 mt-1 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-orange-900 mb-1 text-sm md:text-base">Login Pihak Ketiga</h4>
                            <p className="text-xs md:text-sm text-orange-800/80 leading-relaxed">
                                Anda login via Google/GitHub. Keamanan password diatur oleh penyedia layanan tersebut.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form id="form-password" action={handleChangePassword} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Password Lama</label>
                            <input name="oldPassword" type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Password Baru</label>
                            <input name="newPassword" type="password" required minLength={8} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                        </div>
                        <div className="pt-4">
                            <button disabled={isSaving} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* PLAN CARD */}
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-[#0A2540] text-white shadow-xl p-6 md:p-8 flex flex-col justify-between min-h-[260px] md:min-h-[280px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-10"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-100 border border-white/10">
                                Current Plan
                            </span>
                            {isPro && <div className="bg-yellow-400 text-[#0A2540] text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">PRO</div>}
                        </div>
                        <h3 className="mt-4 text-3xl md:text-4xl font-extrabold capitalize">{user?.plan || "Free"}</h3>
                        <p className="text-blue-200 mt-2 text-xs md:text-sm max-w-xs leading-relaxed">
                            {isPro ? "Akses penuh fitur premium." : "Upgrade untuk membuka potensi penuh."}
                        </p>
                    </div>

                    <div className="relative z-10 pt-6">
                        {isPro ? (
                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
                                <CheckCircle2 className="text-green-400" size={20} />
                                <div className="text-xs">
                                    <p className="font-bold text-white">Langganan Aktif</p>
                                    <p className="text-blue-200">Next billing: 20 Jan 2025</p>
                                </div>
                            </div>
                        ) : (
                            <button className="w-full py-3 bg-white text-[#0A2540] font-bold rounded-xl hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2 group text-sm">
                                <Zap size={16} className="text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" /> 
                                Upgrade Sekarang
                            </button>
                        )}
                    </div>
                </div>

                {/* USAGE STATS */}
                <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col justify-center">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm md:text-base">
                        <TrendingUp size={18} className="text-blue-600" />
                        Penggunaan Bulan Ini
                    </h4>
                    <div className="space-y-5">
                        {usageStats.map((stat, idx) => {
                             const percentage = typeof stat.limit === 'number' ? (stat.used / stat.limit) * 100 : 15;
                             return (
                                <div key={idx}>
                                    <div className="flex justify-between text-[10px] md:text-xs font-bold mb-2">
                                        <span className="text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                        <span className="text-slate-900">{stat.used} <span className="text-slate-300 font-normal">/ {stat.limit}</span></span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 md:h-3 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${stat.color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
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
            className="w-full sm:w-auto px-6 py-3 bg-[#0A2540] text-white rounded-xl font-bold hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/10 active:scale-95 text-sm"
        >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {text}
        </button>
    );
}