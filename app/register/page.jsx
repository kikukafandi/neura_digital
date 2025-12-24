"use client";

import { register } from "@/app/actions"; // Pastikan import 'register' sesuai nama fungsi di actions.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User, Mail, Lock, ArrowRight, CheckCircle,
    Loader2, AlertCircle, Eye, EyeOff, Zap
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export default function RegisterPage() {
    const router = useRouter();

    // --- SPOTLIGHT LOGIC (Sama seperti Login/Landing) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, setIsPending] = useState(false);

    // --- VALIDATION LOGIC ---
    const [validations, setValidations] = useState({
        minLength: false,
        hasNumber: false,
        hasSymbol: false,
        match: false
    });

    useEffect(() => {
        const { password, confirmPassword } = formData;
        setValidations({
            minLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSymbol: /[@$!%*#?&]/.test(password),
            match: password && confirmPassword && password === confirmPassword
        });
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- SUBMIT HANDLER ---
    async function handleSubmit(e) {
        e.preventDefault();
        setIsPending(true);
        setError("");
        setSuccess("");

        // Client-side Validation
        if (!validations.minLength || !validations.hasNumber || !validations.hasSymbol) {
            setError("Password belum memenuhi standar keamanan.");
            setIsPending(false);
            return;
        }
        if (!validations.match) {
            setError("Konfirmasi password tidak cocok.");
            setIsPending(false);
            return;
        }

        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("email", formData.email);
            payload.append("password", formData.password);

            const res = await register(payload);

            if (res?.error) {
                setError(res.error);
                setIsPending(false);
            } else {
                setSuccess("Registrasi berhasil! Mengalihkan...");
                setTimeout(() => router.push("/login"), 2000);
            }
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
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                    <div>
                        <div className="inline-flex items-center gap-2 mb-12">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20">
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Simpul Nalar</span>
                        </div>

                        <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                            Mulai Perjalanan<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Produktivitasmu.</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Satu akun untuk akses ke semua aset premium, template, dan komunitas eksklusif Simpul Nalar.
                        </p>
                        
                        <div className="space-y-4">
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20"><CheckCircle size={14}/></div>
                                Gratis Akses Starter Template
                             </div>
                             <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20"><CheckCircle size={14}/></div>
                                Update Aset Seumur Hidup
                             </div>
                        </div>
                    </div>

                    <div className="mt-12 text-xs text-slate-600">
                        © {new Date().getFullYear()} Simpul Nalar. Secure Registration.
                    </div>
                </div>

                {/* --- BAGIAN KANAN (FORM REGISTER) --- */}
                <div className="w-full bg-[#0A0F1E] border border-white/10 lg:rounded-r-3xl rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    
                    {/* Header Mobile Only */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-cyan-400 border border-blue-500/20">
                            <Zap size={24} fill="currentColor"/>
                        </div>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-2xl font-bold text-white">Buat Akun Baru</h1>
                        <p className="text-slate-400 text-sm mt-2">Lengkapi data untuk bergabung.</p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-in zoom-in-95">
                            <AlertCircle size={18} className="shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-green-400 text-sm animate-in zoom-in-95">
                            <CheckCircle size={18} className="shrink-0" />
                            <div><span className="font-bold">Berhasil!</span> Mengalihkan...</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Nama */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Nama Lengkap"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder:text-slate-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Alamat Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder:text-slate-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Kata Sandi"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-[#020617] border border-white/10 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 text-white placeholder:text-slate-600 outline-none transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                                <input
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Ulangi Kata Sandi"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full pl-11 pr-12 py-3 bg-[#020617] border rounded-xl focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all text-white placeholder:text-slate-600 ${
                                        formData.confirmPassword && !validations.match ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-cyan-500"
                                    }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors">
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Indikator Validasi Password */}
                        <div className="bg-[#020617]/50 p-4 rounded-xl border border-white/5 space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Keamanan Password</p>
                            <ValidationItem isValid={validations.minLength} text="Minimal 8 Karakter" />
                            <ValidationItem isValid={validations.hasNumber} text="Minimal 1 Angka" />
                            <ValidationItem isValid={validations.hasSymbol} text="Minimal 1 Simbol (@$!%*#?&)" />
                            <ValidationItem isValid={validations.match} text="Password Cocok" />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !validations.minLength || !validations.hasNumber || !validations.hasSymbol || !validations.match}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isPending ? <Loader2 size={20} className="animate-spin" /> : <>Daftar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Sudah punya akun? <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Masuk di sini</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Komponen Kecil untuk Indikator Validasi
function ValidationItem({ isValid, text }) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${isValid ? "text-green-400 font-medium" : "text-slate-600"}`}>
            {isValid ? <CheckCircle size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 border border-slate-600 rounded-full shrink-0"></div>}
            {text}
        </div>
    );
}