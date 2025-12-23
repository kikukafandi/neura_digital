"use client";

import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { Users, Target, Heart, Sparkles, Zap } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export default function AboutPage() {
    // --- SPOTLIGHT LOGIC ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // --- ANIMATION VARIANTS ---
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div 
            className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative group"
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

            <Navbar />

            <main className="pt-40 pb-24 px-6 relative z-10">
                <div className="mx-auto max-w-5xl">
                    
                    {/* --- HEADER STORY --- */}
                    <div className="text-center mb-20">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-8 border border-blue-500/20"
                        >
                            <Zap size={32} fill="currentColor" />
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight"
                        >
                            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Simpul Nalar</span>
                        </motion.h1>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-3xl mx-auto bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm"
                        >
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-light">
                                "Kami adalah studio digital yang berfokus pada satu hal obsesif: <b className="text-white">Mengubah kekacauan menjadi kejelasan.</b>"
                            </p>
                            <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto my-6 rounded-full"></div>
                            <p className="text-slate-400 leading-relaxed">
                                Simpul Nalar lahir dari rasa frustrasi. Kami lelah dengan tools produktivitas yang justru menambah pekerjaan baru. Kami membangun ekosistem ini untuk para <b>Doers</b>—mereka yang lebih suka eksekusi daripada sekadar berencana.
                            </p>
                        </motion.div>
                    </div>

                    {/* --- CARDS GRID --- */}
                    <motion.div 
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-6"
                    >
                        {/* Card 1 */}
                        <motion.div variants={item} className="bg-[#0A0F1E]/60 border border-white/5 p-8 rounded-3xl hover:bg-[#0A0F1E] transition-all hover:border-cyan-500/30 group">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Target size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-3">Misi Kami</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Menyediakan "Senjata Digital" (Tools & Aset) yang terbukti bisa menghemat waktu kerja minimal 10 jam per minggu.
                            </p>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div variants={item} className="bg-[#0A0F1E]/60 border border-white/5 p-8 rounded-3xl hover:bg-[#0A0F1E] transition-all hover:border-purple-500/30 group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-3">Siapa Kami</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Tim kecil (Indie Hackers) yang terdiri dari desainer sistem, engineer, dan penulis yang benci ribet.
                            </p>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div variants={item} className="bg-[#0A0F1E]/60 border border-white/5 p-8 rounded-3xl hover:bg-[#0A0F1E] transition-all hover:border-pink-500/30 group">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-6 border border-pink-500/20 group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-white mb-3">Nilai Kami</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                <i>Eat your own dog food.</i> Kami hanya merilis alat yang kami gunakan sendiri setiap hari untuk bisnis kami.
                            </p>
                        </motion.div>

                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}