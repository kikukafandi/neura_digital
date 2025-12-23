"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/app/actions";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ExternalLink, Search, Star, ShoppingCart, Filter, X, Zap, Download } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";

// --- HELPERS ---
const formatRupiah = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

export default function ProductsPage() {
    // --- SPOTLIGHT EFFECT LOGIC (Sama seperti Landing Page) ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    // --- STATES ---
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // 1. Fetch Data
    useEffect(() => {
        const fetchAllProducts = async () => {
            setIsLoading(true);
            try {
                const data = await getProducts();
                if (data) {
                    setAllProducts(data);
                    setFilteredProducts(data);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    // 2. Filter Logic
    useEffect(() => {
        let result = allProducts;
        if (searchQuery) {
            result = result.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCategory !== "Semua") {
            result = result.filter((p) => p.category === selectedCategory);
        }
        setFilteredProducts(result);
    }, [searchQuery, selectedCategory, allProducts]);

    const categories = ["Semua", ...new Set(allProducts.map((p) => p.category).filter(Boolean))];

    return (
        <div
            className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative group"
            onMouseMove={handleMouseMove}
        >

            {/* --- BACKGROUND SPOTLIGHT (Konsisten dengan Landing Page) --- */}
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

            <div className="relative z-10">
                <Navbar />

                {/* --- HEADER STORE --- */}
                <div className="pt-32 pb-10 px-6 text-center border-b border-white/5 bg-[#020617]/50 backdrop-blur-sm">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Arsenal</span>
                        </h1>
                        <p className="text-slate-400 mb-8">
                            Senjata rahasia untuk mempercepat kerjamu. Template, E-book, dan Source Code premium.
                        </p>

                        {/* Search Bar Cybernetic */}
                        <div className="relative max-w-xl mx-auto group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center bg-[#0A0F1E] border border-white/10 rounded-xl overflow-hidden">
                                <div className="pl-4 text-slate-500">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari asset (e.g. Notion Template)..."
                                    className="w-full bg-transparent border-none py-3.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* --- SIDEBAR FILTER (Dark Mode) --- */}
                        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
                            <div className="bg-[#0A0F1E]/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <Filter size={16} className="text-cyan-400" /> Filter
                                </h3>

                                {/* Kategori */}
                                <div className="space-y-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${selectedCategory === cat
                                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Banner Kecil (Opsional) */}
                            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6 text-center">
                                <Zap size={24} className="text-cyan-400 mx-auto mb-3" />
                                <h4 className="text-white font-bold text-sm mb-1">Butuh Custom App?</h4>
                                <p className="text-xs text-slate-400 mb-3">Kami bisa buatkan solusi khusus untukmu.</p>
                                <button className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition">
                                    Hubungi Kami
                                </button>
                            </div>
                        </aside>

                        {/* --- MOBILE FILTER TOGGLE --- */}
                        <div className="lg:hidden flex items-center justify-between w-full">
                            <span className="text-slate-400 text-sm font-mono">{filteredProducts.length} ASSETS FOUND</span>
                            <button
                                onClick={() => setShowMobileFilter(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#0A0F1E] border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/5"
                            >
                                <Filter size={16} /> Filter
                            </button>
                        </div>

                        {/* --- PRODUCT GRID (Dark Cards) --- */}
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-white/5 rounded-2xl h-80 animate-pulse border border-white/5"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                whileHover={{ y: -5 }}
                                                className="group bg-[#0A0F1E]/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative hover:border-blue-500/50 hover:shadow-[0_0_30px_-10px_rgba(37,99,235,0.3)] transition-all duration-300 flex flex-col"
                                            >

                                                {/* Gambar Produk */}
                                                <Link href={`/products/${product.slug || product.id}`} className="relative aspect-square bg-[#020617] overflow-hidden block">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-[linear-gradient(45deg,#0A0F1E_25%,transparent_25%,transparent_75%,#0A0F1E_75%,#0A0F1E),linear-gradient(45deg,#0A0F1E_25%,transparent_25%,transparent_75%,#0A0F1E_75%,#0A0F1E)] bg-[size:20px_20px] opacity-20">
                                                            <Search size={32} />
                                                        </div>
                                                    )}

                                                    {/* Badge Category */}
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur border border-white/10 text-[10px] font-bold uppercase tracking-wide text-cyan-400 rounded-md">
                                                        {product.category}
                                                    </div>
                                                </Link>

                                                {/* Info Produk */}
                                                <div className="p-5 flex flex-col flex-grow">
                                                    <Link href={`/products/${product.slug || product.id}`}>
                                                        <h3 className="text-sm md:text-base font-bold text-slate-200 line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>

                                                    <div className="flex items-center gap-1 mb-4">
                                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                        <span className="text-xs text-slate-500">5.0 (24)</span>
                                                    </div>

                                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-500 line-through">
                                                                {formatRupiah(product.price * 1.3)}
                                                            </span>
                                                            <span className="text-sm md:text-base font-bold text-white">
                                                                {formatRupiah(product.price)}
                                                            </span>
                                                        </div>
                                                        <button className="w-9 h-9 rounded-xl bg-white/5 text-slate-300 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all">
                                                            <ShoppingCart size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                                            <Search className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                                            <h3 className="text-lg font-bold text-white">Data Kosong</h3>
                                            <p className="text-slate-500">Produk yang kamu cari tidak ada di dimensi ini.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* --- MOBILE FILTER DRAWER (Dark) --- */}
                <AnimatePresence>
                    {showMobileFilter && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setShowMobileFilter(false)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
                            />
                            <motion.div
                                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed inset-y-0 right-0 w-80 bg-[#0A0F1E] border-l border-white/10 z-50 p-6 shadow-2xl lg:hidden flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-bold text-white">Filter Assets</h2>
                                    <button onClick={() => setShowMobileFilter(false)}><X size={24} className="text-slate-400" /></button>
                                </div>

                                <div className="space-y-8 flex-1 overflow-y-auto">
                                    <div>
                                        <h3 className="font-bold text-slate-300 mb-4 text-sm uppercase tracking-wider">Category</h3>
                                        <div className="space-y-3">
                                            {categories.map((cat) => (
                                                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCategory === cat ? "border-cyan-500" : "border-slate-600"}`}>
                                                        {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                                                    </div>
                                                    <span className={selectedCategory === cat ? "text-cyan-400" : "text-slate-400"}>{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => setShowMobileFilter(false)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)]"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <Footer />
            </div>
        </div>
    );
}