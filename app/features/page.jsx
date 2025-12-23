"use client";

import { useRef } from "react";
import Navbar from "@/components/Navbar"; // Sesuaikan path import
import Footer from "@/components/Footer"; // Sesuaikan path import
import { Zap, Layout, BookOpen, Smartphone, Shield, Smile, Sparkles } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useInView } from "framer-motion";

export default function FeaturesPage() {
    // --- SPOTLIGHT LOGIC ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // --- DATA FEATURES ---
    const features = [
        { 
            title: "Sistem Terstruktur", 
            desc: "Logika database yang kuat namun mudah digunakan. Template kami bukan sekadar hiasan, tapi sistem kerja.", 
            icon: Layout,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/50"
        },
        { 
            title: "Instan Akses", 
            desc: "Detik ini bayar, detik ini juga masuk email. Otomatisasi penuh tanpa admin manual.", 
            icon: Zap,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
            border: "group-hover:border-yellow-500/50"
        },
        { 
            title: "Materi Terkurasi", 
            desc: "No fluff. Kami membuang materi sampah dan hanya menyajikan 'daging' untuk produktivitasmu.", 
            icon: BookOpen,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "group-hover:border-purple-500/50"
        },
        { 
            title: "Mobile Friendly", 
            desc: "Database Notion & Dashboard kami didesain responsif. Akses dari HP, Tablet, atau Laptop tetap nyaman.", 
            icon: Smartphone,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "group-hover:border-green-500/50"
        },
        { 
            title: "Jaminan Kualitas", 
            desc: "Setiap produk telah melalui uji coba ketat (Battle-tested) oleh tim internal sebelum dirilis.", 
            icon: Shield,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "group-hover:border-red-500/50"
        },
        { 
            title: "Mudah Digunakan", 
            desc: "Gaptek? Tenang. Dilengkapi panduan video tutorial dan dokumentasi langkah demi langkah.", 
            icon: Smile,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "group-hover:border-cyan-500/50"
        },
    ];

    // --- ANIMATION VARIANTS ---
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
                <div className="mx-auto max-w-6xl">
                    
                    {/* --- HEADER --- */}
                    <div className="text-center mb-20">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6"
                        >
                            <Sparkles size={12} />
                            Why Choose Us
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
                        >
                            Teknologi Canggih, <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                                Penggunaan Sederhana.
                            </span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                        >
                            Mengapa ribuan kreator dan mahasiswa memilih Simpul Nalar sebagai senjata rahasia produktivitas mereka.
                        </motion.p>
                    </div>

                    {/* --- FEATURES GRID --- */}
                    <motion.div 
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feat, idx) => {
                            const Icon = feat.icon;
                            return (
                                <motion.div 
                                    key={idx} 
                                    variants={item}
                                    className={`group relative bg-[#0A0F1E]/60 backdrop-blur-sm border border-white/5 p-8 rounded-3xl hover:bg-[#0A0F1E]/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 ${feat.border}`}
                                >
                                    {/* Icon Container */}
                                    <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`w-6 h-6 ${feat.color}`} />
                                    </div>
                                    
                                    <h3 className="font-bold text-xl text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                        {feat.title}
                                    </h3>
                                    
                                    <p className="text-slate-400 leading-relaxed text-sm">
                                        {feat.desc}
                                    </p>

                                    {/* Corner Decoration */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className={`w-2 h-2 rounded-full ${feat.bg} ${feat.color} animate-pulse`}></div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}