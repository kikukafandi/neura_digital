"use client";

import { registerUser } from "@/app/actions";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User, Mail, Lock, ArrowRight, CheckCircle,
    Loader2, AlertCircle, Eye, EyeOff, XCircle
} from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    // State Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // State UI
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isPending, setIsPending] = useState(false);

    // State Validasi Password
    const [validations, setValidations] = useState({
        minLength: false,
        hasNumber: false,
        hasSymbol: false,
        match: false
    });

    // Cek validasi setiap kali user mengetik
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

    async function handleSubmit(e) {
        e.preventDefault(); // Kita handle submit manual
        setIsPending(true);
        setError("");
        setSuccess("");

        // Cek Final di Client sebelum kirim ke server
        if (!validations.minLength || !validations.hasNumber || !validations.hasSymbol) {
            setError("Password belum memenuhi syarat keamanan.");
            setIsPending(false);
            return;
        }
        if (!validations.match) {
            setError("Konfirmasi password tidak cocok.");
            setIsPending(false);
            return;
        }

        try {
            // Kita pakai FormData object agar kompatibel dengan Server Action yang sudah ada
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("email", formData.email);
            payload.append("password", formData.password);

            const res = await registerUser(payload);

            if (res.error) {
                setError(res.error);
                setIsPending(false);
            } else {
                setSuccess(res.success);
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem.");
            setIsPending(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900">

            {/* BAGIAN KIRI (Visual - Tetap Sama) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0A2540] relative flex-col justify-between p-12 overflow-hidden text-white">
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-lg font-bold tracking-tight">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
                        Simpul Nalar
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6">
                        Keamanan Akun<br /> <span className="text-blue-400">Prioritas Kami.</span>
                    </h2>
                    <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
                        Kami menggunakan enkripsi standar industri untuk melindungi data dan aset digital Anda.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-blue-200/50">Simpul Nalar Secure Auth v2.0</div>
            </div>

            {/* BAGIAN KANAN: FORM REGISTER UPGRADED */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
                <div className="w-full max-w-[420px] space-y-6 animate-in slide-in-from-bottom-4 duration-700 fade-in py-10">

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">Buat Akun</h1>
                        <p className="mt-2 text-gray-500">Lengkapi data di bawah ini.</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 text-sm animate-in zoom-in-95">
                            <AlertCircle size={20} className="shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-100 p-3 rounded-xl text-green-700 text-sm animate-in zoom-in-95">
                            <CheckCircle size={20} className="shrink-0" />
                            <div><span className="font-bold block">Berhasil!</span> Mengalihkan...</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Nama */}
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                name="name"
                                type="text"
                                placeholder="Nama Lengkap"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                name="email"
                                type="email"
                                placeholder="Alamat Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                            <input
                                name="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Ulangi Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${formData.confirmPassword && !validations.match ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                                    }`}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Indikator Validasi Password */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Syarat Password:</p>

                            <ValidationItem isValid={validations.minLength} text="Minimal 8 Karakter" />
                            <ValidationItem isValid={validations.hasNumber} text="Minimal 1 Angka" />
                            <ValidationItem isValid={validations.hasSymbol} text="Minimal 1 Simbol (@$!%*#?&)" />
                            <ValidationItem isValid={validations.match} text="Password Cocok" />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !validations.minLength || !validations.hasNumber || !validations.hasSymbol || !validations.match}
                            className="w-full bg-[#0A2540] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isPending ? <Loader2 size={20} className="animate-spin" /> : <>Daftar <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

function ValidationItem({ isValid, text }) {
    return (
        <div className={`flex items-center gap-2 text-sm transition-colors duration-300 ${isValid ? "text-green-600 font-medium" : "text-gray-400"}`}>
            {isValid ? <CheckCircle size={14} className="shrink-0" /> : <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full shrink-0"></div>}
            {text}
        </div>
    );
}