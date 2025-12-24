"use client";

import { useState, useEffect } from "react";
import {
    User, Lock, Database, CreditCard, Save, Loader2,
    Key, Link as LinkIcon, ShieldAlert, CheckCircle2, Zap, TrendingUp,
    Camera, ChevronRight, Menu, Smartphone, MessageCircle, QrCode, LogOut, RefreshCw, CheckCircle
} from "lucide-react";
import {
    updateNotionSettings,
    updateIntegrationSettings,
    getIntegrationSettings,
    changePassword,
    updateProfile,
    createConnection,   // Pastikan ini sudah diexport dari actions/index.js
    deleteConnection    // Pastikan ini sudah diexport dari actions/index.js
} from "@/app/actions";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

// --- MAIN PAGE COMPONENT ---
export default function SettingsPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState("integration");

    if (status === "loading") {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
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
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="text-cyan-400" /> Pengaturan Akun
                </h1>
                <p className="text-slate-400 mt-1">Kelola preferensi dan integrasi sistem.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
                {/* SIDEBAR NAV */}
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
                                        ? "bg-cyan-900/10 text-cyan-400 border border-cyan-500/20"
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

                {/* CONTENT AREA */}
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

// --- 1. INTEGRATION FORM (PERBAIKAN LOGIC QR) ---
function IntegrationForm() {
    const [formData, setFormData] = useState({ notionApiKey: "", notionDbId: "" });
    const [isSavingNotion, setIsSavingNotion] = useState(false);
    
    // State WhatsApp
    const [waStatus, setWaStatus] = useState("IDLE"); 
    const [qrCode, setQrCode] = useState(null);
    const [waNumber, setWaNumber] = useState(null);
    const [waMessage, setWaMessage] = useState(""); // Tambahan untuk pesan status

    useEffect(() => {
        getIntegrationSettings().then((data) => {
            if (data) setFormData({ notionApiKey: data.notionApiKey || "", notionDbId: data.notionDbId || "" });
        });
        handleCheckWaConnection();
    }, []);

    async function handleSaveNotion(e) {
        e.preventDefault();
        setIsSavingNotion(true);
        const formPayload = new FormData(e.target);
        const res = await updateIntegrationSettings(formPayload);
        setIsSavingNotion(false);
        if (res?.error) toast.error(res.error);
        else toast.success("Konfigurasi Notion disimpan!");
    }

    // --- FIX: Logic WhatsApp Handle Response ---
    const handleCheckWaConnection = async () => {
        setWaStatus("LOADING");
        setWaMessage(""); // Reset pesan
        
        try {
            const res = await createConnection();
            
            if (res.error) {
                toast.error(res.error);
                setWaStatus("IDLE");
            } else if (res.status === "CONNECTED") {
                setWaStatus("CONNECTED");
                setWaNumber(res.phone);
            } else if (res.status === "SCAN_NEEDED") {
                setWaStatus("SCAN_NEEDED");
                setQrCode(res.qr || null); // Bisa jadi null kalau masih preparing
                setWaMessage(res.message || "Menyiapkan QR Code..."); // Ambil pesan dari backend
            } else if (res.status === "RETRY_RESET") {
                // Instance sedang direset, instruksikan user tunggu & coba lagi
                toast.info(res.message || "Instance sedang direset...");
                setWaStatus("LOADING");
                setWaMessage(res.message || "Sedang mereset koneksi...");
                
                // Auto-retry setelah 3 detik
                setTimeout(() => {
                    handleCheckWaConnection();
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            setWaStatus("IDLE");
            toast.error("Gagal terhubung ke gateway.");
        }
    };

    const handleLogoutWa = async () => {
        if(confirm("Putuskan koneksi WhatsApp? Automasi akan berhenti berjalan.")) {
            setWaStatus("LOADING");
            await deleteConnection();
            setWaStatus("IDLE");
            setQrCode(null);
            setWaNumber(null);
            toast.success("Koneksi diputus.");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

            {/* A. NOTION CONFIGURATION */}
            <form onSubmit={handleSaveNotion} className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400"><Database size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">Notion Database</h3>
                        <p className="text-xs text-slate-400">Sinkronisasi tugas ke Notion.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Integration Token</label>
                        <input name="notionApiKey" type="password" defaultValue={formData.notionApiKey} placeholder="secret_..." className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-white text-xs transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Database ID</label>
                        <input name="notionDbId" type="text" defaultValue={formData.notionDbId} placeholder="xxxxxxxx" className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-white text-xs transition-all" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <SaveButton isSaving={isSavingNotion} text="Simpan Notion" />
                </div>
            </form>

            {/* B. WHATSAPP DEVICE LINKING */}
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Smartphone size={20} /></div>
                    <div>
                        <h3 className="font-bold text-white">WhatsApp Device</h3>
                        <p className="text-xs text-slate-400">Scan QR untuk menghubungkan nomor Anda.</p>
                    </div>
                </div>

                <div className="bg-[#050B14] rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] border border-white/5 relative">
                    
                    {/* STATUS 1: LOADING */}
                    {waStatus === "LOADING" && (
                        <div className="flex flex-col items-center animate-pulse">
                            <RefreshCw className="animate-spin text-cyan-400 mb-4" size={40} />
                            <p className="text-slate-400 text-sm">Menghubungkan ke Server WA...</p>
                        </div>
                    )}

                    {/* STATUS 2: CONNECTED */}
                    {waStatus === "CONNECTED" && (
                        <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Terhubung!</h3>
                            <p className="text-slate-400 mb-6 font-mono text-sm bg-white/5 py-1 px-3 rounded-full inline-block">
                                {waNumber ? `+${waNumber.split('@')[0]}` : "Device Aktif"}
                            </p>
                            <div className="flex justify-center">
                                <button onClick={handleLogoutWa} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 text-sm">
                                    <LogOut size={16} /> Putuskan Koneksi
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS 3a: QR READY */}
                    {waStatus === "SCAN_NEEDED" && qrCode && (
                        <div className="text-center animate-in fade-in duration-500">
                            <p className="text-white mb-4 font-bold animate-pulse text-sm">Scan QR via WhatsApp (Linked Devices)</p>
                            <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-2xl">
                                <img src={qrCode} alt="Scan QR" className="w-64 h-64 object-contain" />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleCheckWaConnection} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                    <RefreshCw size={12} /> Refresh QR
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS 3b: QR PREPARING (INI YANG HILANG SEBELUMNYA) */}
                    {waStatus === "SCAN_NEEDED" && !qrCode && (
                        <div className="flex flex-col items-center animate-pulse">
                            <RefreshCw className="animate-spin text-yellow-400 mb-4" size={40} />
                            <p className="text-yellow-200 text-sm font-bold">{waMessage}</p>
                            <p className="text-slate-500 text-xs mt-2">Sedang menyiapkan sesi...</p>
                            <button onClick={handleCheckWaConnection} className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white">
                                Cek Lagi
                            </button>
                        </div>
                    )}

                    {/* STATUS 4: IDLE */}
                    {waStatus === "IDLE" && (
                        <div className="text-center">
                            <p className="text-slate-400 mb-6 max-w-md text-sm leading-relaxed">
                                Klik tombol di bawah untuk membuat sesi baru. Sistem akan men-generate QR Code untuk Anda scan.
                            </p>
                            <button onClick={handleCheckWaConnection} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 transition flex items-center gap-2 mx-auto hover:-translate-y-1">
                                <QrCode size={20} /> Hubungkan WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- 2. PROFILE FORM ---
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
            <div className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-cyan-900/50 to-slate-900 opacity-50"></div>
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-10">
                    <div className="relative group/avatar flex-shrink-0">
                        <div className="w-24 h-24 rounded-full p-1 bg-[#0A0F1E] shadow-2xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 relative border border-white/10">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600"><User size={32} /></div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-center sm:text-left pb-1 flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white truncate">{user?.name}</h2>
                        <p className="text-slate-400 text-sm font-medium truncate">{user?.email}</p>
                    </div>
                    <div className="pb-2">
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wide rounded-full border border-cyan-500/20">
                            {user?.role || "Member"}
                        </span>
                    </div>
                </div>
            </div>

            <form action={handleUpdateProfile} className="bg-[#0A0F1E] rounded-2xl border border-white/5 shadow-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400"><User size={18} /></div>
                    <h3 className="font-bold text-white">Informasi Dasar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                        <input name="name" defaultValue={user?.name || ""} required className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-white text-sm" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">URL Foto Profil</label>
                        <input name="image" type="url" defaultValue={user?.image || ""} onChange={(e) => setPreviewImage(e.target.value)} className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-white text-sm" />
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                    <SaveButton isSaving={isSaving} text="Simpan Profil" />
                </div>
            </form>
        </div>
    );
}

// --- 3. SECURITY FORM ---
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
                            <h4 className="font-bold text-orange-400 mb-1">Login Pihak Ketiga</h4>
                            <p className="text-xs text-orange-200/70">Keamanan password diatur oleh penyedia login (Google/GitHub).</p>
                        </div>
                    </div>
                ) : (
                    <form id="form-password" action={handleChangePassword} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Password Lama</label>
                            <input name="oldPassword" type="password" required className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Password Baru</label>
                            <input name="newPassword" type="password" required minLength={8} className="w-full px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-xl text-white text-sm" />
                        </div>
                        <div className="pt-4">
                            <SaveButton isSaving={isSaving} text="Update Password" />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

// --- 4. BILLING VIEW ---
function BillingView({ session }) {
    const user = session?.user;
    const isPro = user?.plan === 'pro';
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-[#0A0F1E] border border-white/5 text-white shadow-2xl p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10">
                    <h3 className="mt-4 text-4xl font-extrabold capitalize text-white">{user?.plan || "Free"} Plan</h3>
                    <p className="text-slate-400 mt-2 text-sm max-w-xs">
                        {isPro ? "Akses penuh fitur premium." : "Upgrade untuk membuka potensi penuh automasi."}
                    </p>
                </div>
            </div>
        </div>
    );
}

// --- HELPER BUTTON ---
function SaveButton({ isSaving, text }) {
    return (
        <button
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-lg shadow-cyan-900/20"
        >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {text}
        </button>
    );
}