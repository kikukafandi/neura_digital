"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ExternalLink, CheckCircle, ShieldCheck, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formatRupiah = (price) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

export default function ProductDetailPage() {
    const params = useParams(); // Ambil ID dari URL
    const supabase = createClient();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Ambil 1 produk berdasarkan ID
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', params.id)
                    .single(); // .single() memastikan hanya 1 data yang diambil

                if (error) throw error;
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="h-10 w-10 animate-spin text-[#0A2540]" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h1>
                <Link href="/products" className="text-blue-600 hover:underline">Kembali ke Katalog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <Navbar />

            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="mx-auto max-w-6xl">

                    {/* Breadcrumb / Back */}
                    <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-[#0A2540] mb-8 transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Kembali ke Katalog
                    </Link>

                    <div className="grid md:grid-cols-2 gap-12 items-start">

                        {/* --- Kolom Kiri: Gambar --- */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl p-4 overflow-hidden relative">
                            <div className="aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden relative">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                        </div>

                        {/* --- Kolom Kanan: Detail --- */}
                        <div className="space-y-8">
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-4xl font-extrabold text-[#0A2540] leading-tight mb-2">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={16} fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="text-gray-400">(4.9/5 dari Pengguna)</span>
                                </div>
                            </div>

                            <div className="text-3xl font-bold text-blue-600">
                                {formatRupiah(product.price)}
                            </div>

                            <div className="prose prose-blue text-gray-600 leading-relaxed">
                                <p>{product.description || "Deskripsi produk belum tersedia. Namun produk ini dirancang untuk meningkatkan produktivitas digital Anda secara signifikan."}</p>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                                <a
                                    href={product.checkout_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex justify-center items-center px-8 py-4 bg-[#0A2540] text-white font-bold rounded-xl hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1"
                                >
                                    Beli Sekarang <ExternalLink size={18} className="ml-2" />
                                </a>
                            </div>

                            {/* Fitur / Jaminan */}
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span>Akses Instan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-blue-500" />
                                    <span>Pembayaran Aman</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span>Support Update</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span>Dokumentasi Lengkap</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}