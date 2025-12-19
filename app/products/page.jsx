"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar"; // Pastikan path ini sesuai struktur folder Anda
import Footer from "../../components/Footer"; // Pastikan path ini sesuai struktur folder Anda

// --- Styles & Animations (Sama dengan Landing Page) ---
const customStyles = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-enter {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  }
`;

// --- Utility Classes ---
const glassCardClass =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90";

// --- Data Produk (Mock Data) ---
const allProducts = [
    {
        id: 1,
        category: "Template",
        name: "Sistem Manajemen Freelance",
        desc: "Dashboard Notion lengkap untuk mengatur klien, invoice, dan proyek. Lupakan spreadsheet yang berantakan.",
        price: "Rp 149.000",
        imageColor: "bg-blue-50",
        link: "https://lynk.id/demo",
        featured: true,
    },
    {
        id: 2,
        category: "E-Book",
        name: "Panduan Digital Declutter",
        desc: "E-book PDF 50 halaman tentang cara membersihkan sampah digital di laptop & HP untuk performa maksimal.",
        price: "Rp 99.000",
        imageColor: "bg-indigo-50",
        link: "https://lynk.id/demo",
        featured: true,
    },
    {
        id: 3,
        category: "Printable",
        name: "Focus Planner 2024",
        desc: "Planner harian minimalis siap cetak (A4/A5). Desain bersih untuk mendukung metode Deep Work.",
        price: "Rp 49.000",
        imageColor: "bg-teal-50",
        link: "https://lynk.id/demo",
        featured: false,
    },
    {
        id: 4,
        category: "Template",
        name: "Second Brain OS",
        desc: "Sistem pencatat digital terintegrasi berdasarkan metode PARA (Projects, Areas, Resources, Archives).",
        price: "Rp 199.000",
        imageColor: "bg-purple-50",
        link: "https://lynk.id/demo",
        featured: false,
    },
    {
        id: 5,
        category: "Course",
        name: "Mastering Focus",
        desc: "Video course singkat (60 menit) tentang teknik mengelola atensi di era distraksi digital.",
        price: "Rp 249.000",
        imageColor: "bg-orange-50",
        link: "https://lynk.id/demo",
        featured: false,
    },
    {
        id: 6,
        category: "E-Book",
        name: "Minimalist Tech Stack",
        desc: "Panduan memilih aplikasi yang tepat dan berhenti berlangganan tools yang tidak perlu.",
        price: "Rp 79.000",
        imageColor: "bg-gray-100",
        link: "https://lynk.id/demo",
        featured: false,
    },
];

// Kategori unik untuk Filter
const categories = ["Semua", ...new Set(allProducts.map((p) => p.category))];

export default function ProductsPage() {
    const [activeCategory, setActiveCategory] = useState("Semua");

    // Filter logika
    const filteredProducts =
        activeCategory === "Semua"
            ? allProducts
            : allProducts.filter((product) => product.category === activeCategory);

    return (
        <>
            <style jsx global>{customStyles}</style>

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans relative overflow-x-hidden">

                {/* --- Background Decorative Layer (Sama dengan Home) --- */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.6]"></div>
                    {/* Posisi blob sedikit digeser agar variatif */}
                    <div className="absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
                    <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
                </div>

                {/* Panggil Komponen Navbar */}
                <Navbar />

                <main className="relative z-10 pt-32 pb-24 px-6">
                    <div className="mx-auto max-w-6xl">

                        {/* --- Header Section --- */}
                        <div className="text-center mb-16">
                            <span className="animate-enter opacity-0 inline-block py-1 px-3 rounded-full bg-blue-100/50 text-blue-700 text-xs font-bold tracking-wide mb-4 border border-blue-200">
                                Katalog Lengkap
                            </span>
                            <h1 className="animate-enter delay-100 opacity-0 text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-6">
                                Alat Digital untuk <span className="text-blue-600">Upgrade Karir</span>
                            </h1>
                            <p className="animate-enter delay-200 opacity-0 max-w-2xl mx-auto text-lg text-gray-600">
                                Koleksi template, e-book, dan course yang dirancang untuk efisiensi.
                                Pilih alat yang sesuai dengan kebutuhan produktivitas Anda.
                            </p>
                        </div>

                        {/* --- Filter Tabs --- */}
                        <div className="animate-enter delay-300 opacity-0 mb-12 flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat
                                            ? "bg-[#0A2540] text-white shadow-lg scale-105"
                                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* --- Products Grid --- */}
                        <div className="animate-enter delay-300 opacity-0 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <div key={product.id} className={`${glassCardClass} flex flex-col group h-full`}>

                                        {/* Image Area */}
                                        <div className={`h-56 w-full ${product.imageColor} relative overflow-hidden rounded-t-2xl flex items-center justify-center`}>
                                            {/* Badge Kategori */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#0A2540] text-xs font-bold rounded-full shadow-sm">
                                                    {product.category}
                                                </span>
                                            </div>

                                            {/* Mockup Icon/Illustration */}
                                            <div className="transform transition-transform duration-500 group-hover:scale-110 opacity-60">
                                                {/* Placeholder Icon SVG */}
                                                <svg className="w-20 h-20 text-[#0A2540]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>

                                            {/* Overlay saat hover */}
                                            <div className="absolute inset-0 bg-[#0A2540]/0 group-hover:bg-[#0A2540]/5 transition-colors duration-300"></div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="mb-2 flex justify-between items-start">
                                                <h3 className="text-xl font-bold text-[#0A2540] leading-tight group-hover:text-blue-700 transition-colors">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                                {product.desc}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                <span className="text-lg font-bold text-[#0A2540]">{product.price}</span>
                                                <a
                                                    href={product.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold transition-all hover:bg-blue-600 hover:text-white"
                                                >
                                                    Beli
                                                    <svg className="ml-1.5 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-500">
                                    <p>Belum ada produk untuk kategori ini.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>

                <div className="relative z-10">
                    <Footer />
                </div>
            </div>
        </>
    );
}