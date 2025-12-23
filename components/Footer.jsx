import Link from "next/link";
import { Zap, Instagram, Twitter, Linkedin, Github, Mail } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#020617] border-t border-white/5 pt-20 pb-10 relative overflow-hidden text-slate-400 font-sans">

            {/* --- BACKGROUND DECORATION --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-10"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[100px] bg-blue-600/20 blur-[100px]"></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* 1. BRAND INFO */}
                    <div className="md:col-span-2 pr-0 md:pr-12">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                                {/* Kalau mau pakai icon.png, uncomment baris bawah dan hapus <Zap/> */}
                                {/* <img src="/icon.png" alt="Icon" className="w-5 h-5" /> */}
                                <Zap size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Simpul Nalar</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 mb-6 max-w-sm">
                            Membangun ekosistem digital yang lebih bersih, terstruktur, dan produktif untuk kreator Indonesia. Dari ide abstrak menjadi eksekusi nyata.
                        </p>

                        {/* Newsletter Input (Opsional - Pemanis) */}
                        <div className="flex items-center gap-2 max-w-sm">
                            <div className="relative flex-1">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="Email kamu..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition"
                                />
                            </div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition border border-slate-700">
                                Join
                            </button>
                        </div>
                    </div>

                    {/* 2. LINKS COLUMN 1 */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Produk</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/dashboard/products" className="hover:text-cyan-400 transition-colors">Digital Store</Link></li>
                            <li><Link href="/dashboard/tasks" className="hover:text-cyan-400 transition-colors">Task Manager</Link></li>
                            <li><Link href="/features" className="hover:text-cyan-400 transition-colors">Atomizer AI</Link></li>
                            <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Harga</Link></li>
                        </ul>
                    </div>

                    {/* 3. LINKS COLUMN 2 */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Perusahaan</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="hover:text-cyan-400 transition-colors">Tentang Kami</Link></li>
                            <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                            <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Use</Link></li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                    <p>&copy; {new Date().getFullYear()} Simpul Nalar Labs. All rights reserved.</p>

                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                            <Instagram size={14} />
                        </a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                            <Twitter size={14} />
                        </a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                            <Linkedin size={14} />
                        </a>
                        <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all">
                            <Github size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;