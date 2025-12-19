"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link"; // Jangan lupa import Link

// --- Styles ---
const customStyles = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-enter {
    animation: fade-in-up 0.8s ease-out forwards;
  }
  .bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  }
`;

const glassCardClass =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90";

export default function ProductsPage() {
    const supabase = createClient();
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data dari Supabase
    useEffect(() => {
        const fetchAllProducts = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setAllProducts(data);
                    setFilteredProducts(data);
                }
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    // Handle Filter Kategori
    useEffect(() => {
        if (activeCategory === "Semua") {
            setFilteredProducts(allProducts);
        } else {
            setFilteredProducts(allProducts.filter(p => p.category === activeCategory));
        }
    }, [activeCategory, allProducts]);

    // Ambil Kategori Unik dari Data
    const categories = ["Semua", ...new Set(allProducts.map((p) => p.category).filter(Boolean))];

    return (
        <>
            <style jsx global>{customStyles}</style>

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans relative overflow-x-hidden">

                {/* Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.6]"></div>
                    <div className="absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-200/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
                    <div className="absolute bottom-[20%] left-[-10%] w-[35vw] h-[35vw] bg-indigo-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
                </div>

                <Navbar />

                <main className="relative z-10 pt-32 pb-24 px-6">
                    <div className="mx-auto max-w-6xl">

                        {/* Header */}
                        <div className="text-center mb-16">
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-100/50 text-blue-700 text-xs font-bold tracking-wide mb-4 border border-blue-200 animate-enter opacity-0">
                                Katalog Lengkap
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-6 animate-enter delay-100 opacity-0">
                                Alat Digital untuk <span className="text-blue-600">Upgrade Karir</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg text-gray-600 animate-enter delay-200 opacity-0">
                                Temukan template, e-book, dan course yang siap pakai.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="mb-12 flex flex-wrap justify-center gap-2 animate-enter delay-300 opacity-0">
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

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="text-center py-20 animate-pulse text-gray-400">
                                Memuat katalog produk...
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-enter delay-300 opacity-0">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        // PERBAIKAN 1: Gunakan 'div' sebagai pembungkus utama (bukan Link)
                                        <div key={product.id} className={`${glassCardClass} flex flex-col group h-full relative`}>

                                            {/* PERBAIKAN 2: Bungkus Gambar dengan Link ke detail */}
                                            <Link href={`/products/${product.slug}`} className="block h-56 w-full bg-gray-50 relative overflow-hidden rounded-t-2xl flex items-center justify-center cursor-pointer">
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#0A2540] text-xs font-bold rounded-full shadow-sm">
                                                        {product.category}
                                                    </span>
                                                </div>

                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="opacity-40">
                                                        <Search size={48} />
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Content Area */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="mb-2">
                                                    {/* PERBAIKAN 3: Bungkus Judul dengan Link ke detail */}
                                                    <Link href={`/products/${product.slug}`} className="cursor-pointer">
                                                        <h3 className="text-xl font-bold text-[#0A2540] leading-tight group-hover:text-blue-700 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                </div>

                                                {product.description && (
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                                        {product.short_description || product.description || "Tingkatkan produktivitas Anda dengan alat digital premium ini."}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                    <span className="text-lg font-bold text-[#0A2540]">
                                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
                                                    </span>

                                                    {/* Tombol Beli (Tag <a> Terpisah, Aman dari nesting error) */}
                                                    <a
                                                        href={product.checkout_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold transition-all hover:bg-blue-600 hover:text-white"
                                                    >
                                                        Beli
                                                        <ExternalLink className="ml-1.5 w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-gray-500 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                                        <p>Tidak ada produk di kategori ini.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                <div className="relative z-10">
                    <Footer />
                </div>
            </div>
        </>
    );
}