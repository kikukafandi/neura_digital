"use client";

import { login } from "@/app/actions";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail, Lock, ArrowRight, Loader2, AlertCircle, Zap, Eye, EyeOff, CheckCircle
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();

    // --- SPOTLIGHT LOGIC (Biar sama kayak Landing Page) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // --- STATE ---
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleSubmit(formDataPayload) {
        setIsPending(true);
        setError("");

        try {
            // Panggil Server Action
            const result = await login(formDataPayload);
            
            if (result?.error) {
                setError(result.error);
                setIsPending(false);
            }
            // Jika sukses, NextAuth akan otomatis redirect
        } catch (err) {
            setError("Terjadi kesalahan jaringan.");
            setIsPending(false);
        }
    }

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden relative group"
            onMouseMove={handleMouseMove}
        >
            {/* --- BACKGROUND SPOTLIGHT --- */}
            <div className="pointer-events-none fixed inset-0 z-0 transition duration-300 lg:absolute">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                600px circle at ${mouseX}px ${mouseY}px,
                                rgba(56, 189, 248, 0.1),
                                transparent 80%
                            )
                        `,
                    }}
                />
            </div>

            <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 relative z-10 p-4">
                
                {/* --- BAGIAN KIRI (VISUAL / MARKETING) --- */}
                <div className="hidden lg:flex flex-col justify-between p-10 bg-[#0A0F1E]/60 backdrop-blur-md border border-white/5 border-r-0 rounded-l-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
                    
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 mb-12">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20">
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Simpul Nalar</span>
                        </Link>

                        <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                            Selamat Datang <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Kreator.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Masuk ke dashboard untuk mengelola tugas, aset digital, dan bot produktivitasmu.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><CheckCircle size={14}/></div>
                            Dashboard Real-time
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                             <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><CheckCircle size={14}/></div>
                            Sinkronisasi Notion Otomatis
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                             <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20"><CheckCircle size={14}/></div>
                            Akses Komunitas Premium
                        </div>
                    </div>

                    <div className="mt-12 text-xs text-slate-600">
                        © {new Date().getFullYear()} Simpul Nalar System.
                    </div>
                </div>

                {/* --- BAGIAN KANAN (FORM LOGIN) --- */}
                <div className="w-full bg-[#0A0F1E] border border-white/10 lg:rounded-r-3xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                     {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20">
                            <Zap size={24} fill="currentColor"/>
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-2xl font-bold text-white">Login Akun</h1>
                        <p className="text-slate-400 text-sm mt-2">Masukkan kredensial Anda untuk melanjutkan.</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-in zoom-in-95">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-slate-500 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder:text-slate-600 outline-none transition-all"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between ml-1">
                                <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                                <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Lupa Password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder:text-slate-600 outline-none transition-all"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isPending ? <Loader2 size={20} className="animate-spin" /> : <>Masuk <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-slate-500">
                            Belum punya akun? <Link href="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Daftar Sekarang</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}