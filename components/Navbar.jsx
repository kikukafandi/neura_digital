"use client"; // Wajib karena ada useState

import { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = () => setIsOpen(false);

    const navLinks = [
        { name: "Produk", href: "#products" },
        { name: "Tentang", href: "#about" },
        { name: "Keunggulan", href: "#features" },
    ];

    return (
        <nav
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled || isOpen
                    ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
                    : "bg-transparent border-transparent"
                }`}
        >
            <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tight text-[#0A2540] flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
                    Neura Digital
                </Link>

                {/* Desktop Links */}
                <div className="hidden space-x-8 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-[#0052CC] transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA Button Desktop */}
                <div className="hidden md:block">
                    <Link
                        href="#contact"
                        className="rounded-full bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0052CC] hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        Hubungi Kami
                    </Link>
                </div>

                {/* Mobile Menu Button (Hamburger) */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-gray-800 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            // Icon X (Close)
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            // Icon Hamburger
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {/* Menggunakan absolute positioning agar menimpa konten di bawahnya */}
            <div
                className={`md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out origin-top ${isOpen ? "max-h-screen opacity-100 py-6" : "max-h-0 opacity-0 py-0"
                    }`}
            >
                <div className="flex flex-col space-y-4 px-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleLinkClick}
                            className="block text-lg font-medium text-gray-700 hover:text-[#0052CC]"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-gray-100" />
                    <Link
                        href="#contact"
                        onClick={handleLinkClick}
                        className="block w-full text-center rounded-lg bg-[#0A2540] py-3 text-base font-bold text-white shadow-md active:scale-95"
                    >
                        Hubungi Kami
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;