"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X, User, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react"; // 1. Import Session

const Navbar = () => {
    const { data: session } = useSession(); // 2. Ambil data session
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Deteksi Scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => setIsOpen(false);

    const navLinks = [
        { name: "Store", href: "/dashboard/products" }, // Arahkan ke catalog publik nanti jika ada
        { name: "Features", href: "/features" },
        { name: "About", href: "/about" },
    ];

    return (
        <>
            {/* --- NAVBAR UTAMA (KAPSUL MELAYANG) --- */}
            <nav
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-300 ${
                    scrolled || isOpen
                        ? "bg-[#0A0F1E]/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50"
                        : "bg-transparent border border-transparent"
                } rounded-full h-14 px-6 flex items-center justify-between`}
            >
                {/* 1. LOGO */}
                <Link href="/" className="flex items-center gap-2 group" onClick={handleLinkClick}>
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="font-bold text-sm tracking-wide text-white group-hover:text-cyan-400 transition-colors">
                        Simpul Nalar
                    </span>
                </Link>

                {/* 2. DESKTOP LINKS & AUTH */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Menu Links */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[11px] font-medium text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* LOGIKA AUTH DESKTOP */}
                    {session ? (
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-[11px] font-bold bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-500 transition shadow-lg shadow-blue-900/50 hover:shadow-blue-600/50"
                        >
                            <LayoutDashboard size={14} />
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-[11px] font-bold bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white hover:text-slate-950 transition border border-white/5"
                        >
                            <User size={14} />
                            Login
                        </Link>
                    )}
                </div>

                {/* 3. MOBILE MENU BUTTON */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-slate-300 hover:text-white focus:outline-none"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* --- MOBILE MENU DROPDOWN --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-40 bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 shadow-2xl md:hidden"
                    >
                        <div className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    className="block px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            
                            <div className="h-px bg-white/5 my-2"></div>

                            {/* LOGIKA AUTH MOBILE */}
                            {session ? (
                                <>
                                    <div className="px-4 py-2 text-xs text-slate-500 uppercase tracking-widest font-bold">
                                        Halo, {session.user?.name?.split(" ")[0]}
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        onClick={handleLinkClick}
                                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/50 active:scale-95 transition-transform"
                                    >
                                        <LayoutDashboard size={16} />
                                        Buka Dashboard
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={handleLinkClick}
                                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 py-3 text-sm font-bold text-white hover:bg-white hover:text-slate-900 active:scale-95 transition-all"
                                >
                                    <User size={16} />
                                    Masuk / Daftar
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;