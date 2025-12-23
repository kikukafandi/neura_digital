"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Deteksi Scroll untuk efek border/shadow
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => setIsOpen(false);

    const navLinks = [
        { name: "Store", href: "/dashboard/products" },
        { name: "Features", href: "/features" },
        { name: "About", href: "/about" },
    ];

    return (
        <>
            {/* --- NAVBAR UTAMA (MODEL KAPSUL MELAYANG) --- */}
            <nav
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-300 ${
                    scrolled || isOpen
                        ? "bg-[#0A0F1E]/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50"
                        : "bg-transparent border border-transparent"
                } rounded-full h-14 px-6 flex items-center justify-between`}
            >
                {/* 1. LOGO */}
                <Link href="/" className="flex items-center gap-2 group" onClick={handleLinkClick}>
                    {/* Titik Kedip ala Cybernetic */}
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="font-bold text-sm tracking-wide text-white group-hover:text-cyan-400 transition-colors">
                        Simpul Nalar
                    </span>
                </Link>

                {/* 2. DESKTOP LINKS */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[11px] font-medium text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link 
                        href="/auth/register" 
                        className="text-[11px] font-bold bg-white/10 text-white px-4 py-1.5 rounded-full hover:bg-white hover:text-slate-950 transition border border-white/5"
                    >
                        Login
                    </Link>
                </div>

                {/* 3. MOBILE MENU BUTTON (HAMBURGER) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-slate-300 hover:text-white focus:outline-none"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* --- MOBILE MENU DROPDOWN (ANIMATED) --- */}
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
                            <Link
                                href="/auth/register"
                                onClick={handleLinkClick}
                                className="block w-full text-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/50 active:scale-95 transition-transform"
                            >
                                Login / Daftar
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;