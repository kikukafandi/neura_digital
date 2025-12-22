import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";

export default async function LoginPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900">

            <div className="hidden lg:flex lg:w-1/2 bg-[#0A2540] relative flex-col justify-between p-12 overflow-hidden text-white">
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                {/* Content Kiri */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-lg font-bold tracking-tight">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            <img src="./icon.png" alt="simpul-nalar-icon" />
                        </div>
                        Simpul Nalar
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6">
                        Tingkatkan Produktivitas,<br /> <span className="text-blue-400">Sederhanakan Hidup.</span>
                    </h2>
                    <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
                        Bergabunglah dengan ribuan kreator dan developer yang telah menggunakan aset digital kami untuk bekerja lebih cerdas.
                    </p>
                    <div className="space-y-4">
                        {["Akses Source Code Premium", "Template Notion Siap Pakai", "Komunitas Eksklusif"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm font-medium text-blue-50">
                                <CheckCircle size={18} className="text-green-400" /> {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-xs text-blue-200/50">
                    © {new Date().getFullYear()} Simpul Nalar. All rights reserved.
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-[420px] space-y-8 animate-in slide-in-from-bottom-4 duration-700 fade-in">

                    {/* Header Mobile Only Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            <img src="./icon.png" alt="simpul-nalar-icon" />
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-[#0A2540] tracking-tight">Selamat Datang Kembali</h1>
                        <p className="mt-2 text-gray-500">Masuk ke dashboard untuk mengelola asetmu.</p>
                    </div>

                    {/* Form Email */}
                    <form
                        action={async (formData) => {
                            "use server";
                            await signIn("credentials", formData);
                        }}
                        className="space-y-5"
                    >
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Alamat Email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium placeholder:font-normal"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="Kata Sandi"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                Lupa kata sandi?
                            </Link>
                        </div>

                        <button className="w-full bg-[#0A2540] text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group">
                            Masuk Sekarang
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 font-medium">Atau masuk dengan</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4">
                        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }} className="w-full">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </form>
                        <form action={async () => { "use server"; await signIn("github", { redirectTo: "/dashboard" }); }} className="w-full">
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#24292F] text-white py-3 rounded-xl hover:bg-[#333] hover:shadow-lg transition-all font-semibold">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-gray-500 pt-4">
                        Belum memiliki akun? <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar Gratis</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}