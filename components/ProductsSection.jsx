"use client";

import Link from "next/link";
import { ExternalLink, ShoppingCart, Loader2 } from "lucide-react";

const sectionPadding = "py-24 px-6";
const glassCardClass =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90";

// Helper untuk format rupiah
const formatRupiah = (price) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

const ProductsSection = ({ products = [], isLoading = false }) => {
    return (
        <section id="products" className="py-24 px-6 relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="mx-auto max-w-6xl relative z-10">
                <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
                    <div>
                        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Toko Digital</span>
                        <h2 className="mt-2 text-3xl font-bold text-[#0A2540] md:text-4xl">Produk Unggulan</h2>
                    </div>
                    <Link
                        href="/products"
                        className="hidden md:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Lihat Semua Katalog <span aria-hidden="true" className="ml-1">→</span>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-500">Memuat produk...</span>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Image Area */}
                                <div className="h-48 bg-gray-100 w-full relative overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                    {/* Badge Category */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold rounded-full shadow-sm">
                                            {product.category || "Digital"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[#0A2540] font-bold text-lg">
                                            {formatRupiah(product.price)}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-[#0A2540] group-hover:text-blue-700 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Deskripsi dipotong agar rapi */}
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-2">
                                        {product.description || "Tingkatkan produktivitas Anda dengan alat digital premium ini."}
                                    </p>

                                    <a
                                        href={product.checkout_url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center rounded-lg bg-[#0A2540] py-3 text-sm font-bold text-white transition-all hover:bg-[#0052CC] hover:shadow-lg group-hover:scale-[1.02]"
                                    >
                                        Beli Sekarang
                                        <ExternalLink className="ml-2 w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        Belum ada produk yang ditampilkan.
                    </div>
                )}

                <div className="mt-8 text-center md:hidden">
                    <Link
                        href="/products"
                        className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                        Lihat Semua Katalog →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProductsSection;