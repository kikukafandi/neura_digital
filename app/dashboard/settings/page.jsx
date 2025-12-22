"use client";

import { useState } from "react";
import { User, Lock, Database, CreditCard, Save, Loader2, Key, Link as LinkIcon, ShieldAlert } from "lucide-react";
import { updateNotionSettings, changePassword } from "@/app/actions";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
    const { data: session } = useSession();
    const user = session?.user;

    // Default tab profil
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    // 1. Handler Integrasi Notion
    async function handleSaveNotion(formData) {
        setIsSaving(true);
        const res = await updateNotionSettings(formData);
        setIsSaving(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Koneksi Notion tersimpan!");
        }
    }

    // 2. Handler Ganti Password (FITUR BARU)
    async function handleChangePassword(formData) {
        setIsSaving(true);
        const res = await changePassword(formData);
        setIsSaving(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Password berhasil diperbarui!");
            // Reset form manual
            document.getElementById("form-password").reset();
        }
    }

    const tabs = [
        { id: "profile", label: "Profil", icon: User },
        { id: "integration", label: "Integrasi", icon: Database },
        { id: "security", label: "Keamanan", icon: Lock },
        { id: "billing", label: "Langganan", icon: CreditCard },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Toaster position="top-center" />

            <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* --- RESPONSIVE SIDEBAR --- */}
                {/* Mobile: Horizontal Scroll | Desktop: Vertical Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-hide">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap border lg:border-transparent ${isActive
                                            ? "bg-[#0A2540] text-white shadow-md border-[#0A2540]"
                                            : "bg-white lg:bg-transparent text-slate-600 hover:bg-slate-100 border-slate-200"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* --- KONTEN KANAN --- */}
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm min-h-[500px]">

                    {/* TAB: PROFIL */}
                    {activeTab === "profile" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Profil Saya</h2>
                                <p className="text-sm text-slate-500">Informasi dasar akun kamu.</p>
                            </div>
                            <div className="flex items-center gap-4 py-4 border-b border-slate-100">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold border-4 border-slate-50">
                                    {user?.image ? (
                                        <img src={user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user?.name?.charAt(0) || "U"
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-lg">{user?.name}</p>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                                <span className="font-bold">Catatan:</span> Untuk saat ini, perubahan nama & foto profil dikelola otomatis melalui akun Google/Github atau hubungi Admin.
                            </div>
                        </div>
                    )}

                    {/* TAB: INTEGRASI */}
                    {activeTab === "integration" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Integrasi Notion (BYOK)</h2>
                                <p className="text-sm text-slate-500">Hubungkan database untuk sinkronisasi tugas otomatis.</p>
                            </div>

                            <form action={handleSaveNotion} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Notion API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="apiKey"
                                            type="password"
                                            placeholder="secret_xxxxxxxx..."
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm"
                                        />
                                        <Key className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Database ID
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="dbId"
                                            type="text"
                                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-mono text-sm"
                                        />
                                        <LinkIcon className="absolute left-3 top-3.5 text-slate-400" size={16} />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        disabled={isSaving}
                                        className="bg-[#0A2540] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-900/10"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        Simpan Koneksi
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: KEAMANAN (GANTI PASSWORD - SEKARANG AKTIF) */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Keamanan Akun</h2>
                                <p className="text-sm text-slate-500">Update password Anda secara berkala untuk keamanan.</p>
                            </div>

                            {/* Cek apakah user login pake Google/Github? Kalau iya, gak bisa ganti pass */}
                            {user?.image?.includes("googleusercontent") || user?.image?.includes("githubusercontent") ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm flex gap-3">
                                    <ShieldAlert className="flex-shrink-0" />
                                    <div>
                                        <strong>Login Sosial Terdeteksi:</strong>
                                        <p>Anda login menggunakan Google/GitHub. Silakan atur password melalui penyedia layanan tersebut.</p>
                                    </div>
                                </div>
                            ) : (
                                <form id="form-password" action={handleChangePassword} className="space-y-5 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Password Lama</label>
                                        <input
                                            name="oldPassword"
                                            type="password"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Password Baru</label>
                                        <input
                                            name="newPassword"
                                            type="password"
                                            required
                                            minLength={8}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                        <p className="text-xs text-slate-400">Minimal 8 karakter.</p>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            disabled={isSaving}
                                            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-red-900/10"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" /> : <ShieldAlert size={18} />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* TAB: BILLING */}
                    {activeTab === "billing" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Status Langganan</h2>
                                <p className="text-sm text-slate-500">Kelola paket langganan Simpul Nalar kamu.</p>
                            </div>
                            <div className="p-8 border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-white text-center shadow-sm">
                                <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Paket Saat Ini</p>
                                <div className="text-4xl font-extrabold text-[#0A2540] capitalize mb-6 tracking-tight">{user?.plan || "Free"} Plan</div>

                                {user?.plan === 'free' ? (
                                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 transform hover:-translate-y-1">
                                        Upgrade ke Pro Sekarang
                                    </button>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                        Akun Pro Aktif
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}