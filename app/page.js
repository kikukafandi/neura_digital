"use client";

import Link from "next/link";
import { ArrowRight, Bot, Zap, ShoppingBag, MessageCircle, Sparkles, Terminal, Download, LayoutGrid, Database } from "lucide-react"; // Import Database
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- KOMPONEN TYPING EFFECT ---
const Typewriter = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i === text.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

// --- SHIMMER BUTTON ---
const ShimmerButton = ({ children, href }) => {
  return (
    <Link href={href} className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]">
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-300/30 to-transparent z-10" />
      <div className="relative flex items-center justify-center gap-2">{children}</div>
    </Link>
  );
};

export default function LandingPage() {
  // Spotlight Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Checklist Animation Variants
  const checklistVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.5 + 1.5, duration: 0.4 }, // Delay setelah typing selesai
    }),
  };

  return (
    <div
      className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative group"
      onMouseMove={handleMouseMove}
    >
      {/* --- BACKGROUND SPOTLIGHT --- */}
      <div className="pointer-events-none fixed inset-0 z-0 transition duration-300 lg:absolute">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                500px circle at ${mouseX}px ${mouseY}px,
                rgba(56, 189, 248, 0.1),
                transparent 80%
              )
            `,
          }}
        />
      </div>

      {/* --- NAVBAR --- */}
      <Navbar/>

      {/* --- HERO SECTION (REVISED) --- */}
      <section className="relative z-10 pt-44 pb-24 px-6 text-center max-w-5xl mx-auto flex flex-col items-center">

        {/* 1. Animated Typing Headline */}
        <div className="min-h-[120px] sm:min-h-[160px] flex items-center justify-center">
          <h1 className="text-4xl sm:text-6xl font-medium text-white tracking-tight leading-[1.2]">
            <span className="text-slate-500">Stop Wacana.</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
              <Typewriter text="Start Executing." delay={500} />
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-1 h-8 sm:h-12 bg-blue-500 ml-1 translate-y-1 sm:translate-y-2"
            />
          </h1>
        </div>

        {/* 2. Minimalist Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto mt-6 mb-10 leading-relaxed font-light"
        >
          Platform produktivitas berbasis AI yang mengubah ide abstrak menjadi rencana konkret. <span className="text-slate-200 font-medium">Chat di WA, bereskan di sini.</span>
        </motion.p>

        {/* 3. Elegant Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <ShimmerButton href="/auth/register">
            Mulai Sekarang <ArrowRight size={16} />
          </ShimmerButton>

          <a href="#store" className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 px-6 py-3 transition-colors">
            <ShoppingBag size={16} /> Digital Store
          </a>
        </motion.div>

        {/* --- LIVE MOCKUP (Minimalist Glass) --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="mt-24 w-full max-w-3xl relative"
        >
          {/* Glow Effect di belakang mockup */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-2xl opacity-50"></div>

          <div className="relative bg-[#0A0F1E]/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Browser Header */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50"></div>
              </div>
              <div className="ml-auto text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Terminal size={10} /> AI_PROCESSOR_RUNNING
              </div>
            </div>

            <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
              {/* Left: Chat UI */}
              <div className="flex-1 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mt-1 border border-blue-500/30">
                    <Bot size={16} />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/5 border border-white/5 rounded-lg rounded-tl-none p-3 text-sm text-slate-300">
                      Target: "Rilis Produk Digital" <br />
                      <span className="text-xs text-slate-500">Analyzing task complexity...</span>
                    </div>

                    {/* Staggered Checklist */}
                    <div className="space-y-2 pt-2">
                      {[
                        "Riset Pasar (2 Jam)",
                        "Buat Konten (1 Hari)",
                        "Setup Payment (30 Menit)"
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          custom={i}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          variants={checklistVariants}
                          className="flex items-center gap-3 p-2.5 rounded hover:bg-white/5 transition-colors group cursor-default"
                        >
                          <div className="w-4 h-4 rounded border border-slate-600 group-hover:border-cyan-500 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.5 + 1.8 }}
                              className="w-2.5 h-2.5 bg-cyan-400 rounded-sm"
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Notification */}
              <div className="hidden sm:block w-64">
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 3.5, duration: 0.5 }}
                  className="bg-[#121826] border border-white/10 p-4 rounded-xl shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={14} className="text-green-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    "Tugas <span className="text-white">Riset Pasar</span> sudah lewat deadline! 🚨"
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- BENTO GRID (FEATURE + STORE) --- */}
      <section id="features" className="py-24 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[280px]">

          {/* Card 1: Atomizer */}
          <div className="md:col-span-2 row-span-1 bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:bg-slate-900/60 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Bot size={180} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20"><Sparkles size={20} /></div>
                <h3 className="text-xl font-medium text-white mb-2">The Atomizer Engine</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">Otakmu capek mikir? Serahkan ke AI. Tulis tujuan besarmu, AI yang akan memecahnya jadi langkah-langkah kecil.</p>
              </div>
            </div>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:bg-slate-900/60 transition-colors">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-400 mb-4 border border-green-500/20"><MessageCircle size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Bot Anti Mager</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Input tugas via WA. Diingatkan via WA. Bereskan via WA. Simple.</p>
          </div>

          {/* Card 3: Notion */}
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:bg-slate-900/60 transition-colors">
            <div className="w-10 h-10 bg-slate-700/30 rounded-lg flex items-center justify-center text-slate-300 mb-4 border border-slate-600/30"><Database size={20} /></div>
            <h3 className="text-lg font-medium text-white mb-2">Sync Notion</h3>
            <p className="text-slate-400 text-xs leading-relaxed">Backup otakmu ke Notion secara otomatis. Data aman, pikiran tenang.</p>
          </div>

          {/* Card 4: DIGITAL STORE */}
          <div id="store" className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="text-left relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><ShoppingBag size={20} className="text-purple-400" /> Digital Asset Store</h3>
              <p className="text-slate-400 text-sm max-w-sm">Butuh jalan pintas? Kami sediakan Template Notion, E-book Koding, dan Source Code siap pakai. Langsung download, langsung guna.</p>
              <Link href="/dashboard/products" className="mt-4 inline-flex items-center text-sm font-bold text-purple-400 hover:text-purple-300">
                Lihat Katalog <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="flex gap-3 relative z-10">
              {/* Mini Product Cards */}
              <div className="w-24 h-32 bg-slate-950 rounded-lg border border-slate-700 flex flex-col items-center justify-center p-2 transform rotate-[-6deg] hover:rotate-0 transition-transform shadow-lg">
                <Download size={20} className="text-blue-500 mb-2" />
                <div className="h-2 w-12 bg-slate-800 rounded mb-1"></div>
                <div className="h-2 w-8 bg-slate-800 rounded"></div>
              </div>
              <div className="w-24 h-32 bg-slate-950 rounded-lg border border-slate-700 flex flex-col items-center justify-center p-2 transform rotate-[6deg] hover:rotate-0 transition-transform shadow-lg z-20">
                <Download size={20} className="text-green-500 mb-2" />
                <div className="h-2 w-12 bg-slate-800 rounded mb-1"></div>
                <div className="h-2 w-8 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* --- CTA FINAL (BARU DITAMBAHKAN) --- */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-slate-900/50 to-slate-950/50 border border-white/5 p-12 rounded-3xl text-center relative overflow-hidden">
          {/* Glow Effect Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 relative z-10">
            Mulai Upgrade Hidupmu.
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10 text-sm sm:text-base leading-relaxed">
            Satu akun untuk semua kebutuhan produktivitas dan aset digitalmu. Tanpa kartu kredit.
          </p>

          <div className="flex justify-center relative z-10">
            <ShimmerButton href="/auth/register">
              Buat Akun Gratis <ArrowRight size={16} />
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* --- FOOTER (Minimalist) --- */}
      <Footer/>


    </div>
  );
}