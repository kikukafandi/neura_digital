"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ExternalLink, CheckCircle, ShieldCheck, Star, ArrowLeft, Lock, Clock, AlertTriangle, ChevronDown, ChevronUp, XCircle, Check, FileText } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown'; // Import Markdown

// --- KOMPONEN PENDUKUNG ---

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(900);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedEndTime = localStorage.getItem("promo_end_time");
        const now = Math.floor(Date.now() / 1000);

        if (savedEndTime && parseInt(savedEndTime) > now) {
            setTimeLeft(parseInt(savedEndTime) - now);
        } else {
            const endTime = now + 900;
            localStorage.setItem("promo_end_time", endTime.toString());
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    const newEnd = Math.floor(Date.now() / 1000) + 900;
                    localStorage.setItem("promo_end_time", newEnd.toString());
                    return 900;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-bold sticky top-0 z-[60] shadow-md flex justify-center items-center gap-2 animate-in slide-in-from-top duration-500">
            <Clock size={16} className="animate-pulse" />
            <span>Penawaran Spesial Berakhir: <span className="bg-white text-red-600 px-1.5 py-0.5 rounded mx-1 font-mono text-base">{formatTime(timeLeft)}</span></span>
        </div>
    );
};

const SimpleHeader = () => (
    <div className="w-full flex justify-center py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-[40px] z-40">
         <div className="text-lg font-bold tracking-tight text-[#0A2540] flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
            Simpul Nalar
        </div>
    </div>
);

const SimpleFooter = () => (
    <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 mt-12 bg-gray-50">
        <div className="flex justify-center items-center gap-2 mb-2">
            <Lock size={14} />
            <span>256-bit SSL Secure Payment</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Simpul Nalar. All rights reserved.</p>
    </footer>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-4 flex justify-between items-center text-left font-semibold text-[#0A2540] hover:text-blue-600 transition-colors">
                {question}
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isOpen && <div className="text-gray-600 pb-4 text-sm leading-relaxed animate-in slide-in-from-top-2">{answer}</div>}
        </div>
    );
}

const formatRupiah = (price) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};

// --- HALAMAN UTAMA ---

export default function ProductDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const supabase = createClient();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLandingPage = searchParams.get('source') === 'ads';

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('slug', params.slug)
                    .single();

                if (error) throw error;
                setProduct(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchProduct();
    }, [params.slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!product) return <div className="p-10 text-center">Produk tidak ditemukan</div>;

    // --- SETUP DATA ---
    const adsRaw = product.ads_content || {};

    // Konten Header (Judul/Subtitle)
    const headerContent = {
        title: isLandingPage ? (adsRaw.title || product.name) : product.name,
        subtitle: isLandingPage ? (adsRaw.subtitle || product.category) : product.category,
        // Di Ads Mode: Tagline Emosional. Di Normal Mode: Kosongkan deskripsi di atas (pindah ke bawah)
        heroText: isLandingPage ? (adsRaw.tagline || product.description) : null,
        cta: isLandingPage ? (adsRaw.cta || "Ambil Promo Sekarang") : "Beli Sekarang"
    };

    const benefitIcons = [CheckCircle, ExternalLink, Star, ShieldCheck];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900">
            
            {/* Header & Timer */}
            {isLandingPage && <CountdownTimer />}
            {isLandingPage ? <SimpleHeader /> : <Navbar />}
            
            <main className={`${isLandingPage ? 'pt-8' : 'pt-32'} pb-24 px-4 md:px-6 relative z-10`}>
                <div className="mx-auto max-w-5xl">
                    
                    {!isLandingPage && (
                        <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-[#0A2540] mb-8 transition-colors">
                            <ArrowLeft size={18} className="mr-2" /> Kembali ke Katalog
                        </Link>
                    )}

                    {/* --- BAGIAN 1: HERO SECTION (LAYOUT SHOPEE) --- */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                            
                            {/* Kolom Kiri: Gambar */}
                            <div className={`relative ${isLandingPage ? 'order-1' : 'order-1'}`}>
                                <div className="aspect-square w-full rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                    )}
                                    {isLandingPage && (
                                        <div className="absolute top-4 left-4 bg-yellow-400 text-[#0A2540] px-3 py-1 text-xs font-bold rounded shadow-md flex items-center gap-1">
                                            <Star size={12} fill="currentColor" /> Best Seller
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kolom Kanan: Info & Harga & CTA */}
                            <div className={`space-y-6 ${isLandingPage ? 'order-2' : 'order-2'}`}>
                                <div>
                                    <span className={`inline-block py-1 px-3 rounded-full text-xs font-bold tracking-wide mb-3 uppercase 
                                        ${isLandingPage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {headerContent.subtitle}
                                    </span>
                                    
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2540] leading-tight mb-4">
                                        {headerContent.title}
                                    </h1>
                                    
                                    {/* Jika Mode Iklan, Tampilkan Tagline di sini. Jika Normal, Sembunyikan (Pindah Bawah) */}
                                    {isLandingPage && (
                                        <div className="text-base text-gray-600 font-medium leading-relaxed border-l-4 border-blue-500 pl-4 bg-blue-50/50 py-2 rounded-r-lg mb-4">
                                            "{headerContent.heroText}"
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <div className="flex text-yellow-400">
                                            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                        </div>
                                        <span>4.9 (1.2k Terjual)</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Harga Saat Ini:</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-extrabold text-[#0A2540]">
                                            {formatRupiah(product.price)}
                                        </span>
                                        {isLandingPage && (
                                            <span className="text-lg text-gray-400 line-through decoration-red-400 decoration-2">
                                                {formatRupiah(product.price * 1.8)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <a 
                                        href={product.checkout_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={`
                                            group w-full inline-flex justify-center items-center gap-2 text-center
                                            ${isLandingPage ? 'py-4 text-lg bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'py-3.5 text-base bg-[#0A2540] hover:bg-blue-800'} 
                                            text-white font-bold rounded-xl transition-all shadow-xl hover:-translate-y-1
                                        `}
                                    >
                                        {headerContent.cta} 
                                        <ExternalLink size={20} className="group-hover:rotate-12 transition-transform shrink-0"/>
                                    </a>
                                    
                                    {isLandingPage && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-center animate-pulse-slow">
                                            <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                                                <AlertTriangle size={14} /> Peringatan: Harga naik saat timer habis.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Fitur Singkat (Icon) */}
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-2">
                                    <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Akses Instan</div>
                                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-blue-500"/> Pembayaran Aman</div>
                                    <div className="flex items-center gap-2"><FileText size={14} className="text-purple-500"/> Format Digital</div>
                                    <div className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Garansi Update</div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* --- BAGIAN 2: DESKRIPSI PRODUK (FULL WIDTH - MENDUKUNG MARKDOWN) --- */}
                    {/* Hanya tampil di Mode Normal, atau jika di Ads mode kita mau menampilkan detail di bawah */}
                    {!isLandingPage && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-[#0A2540] mb-6 border-b border-gray-100 pb-4">
                                Rincian Produk
                            </h2>
                            {/* CLASS PROSE DARI TAILWIND TYPOGRAPHY PLUGIN */}
                            <article className="prose prose-slate prose-lg max-w-none prose-headings:text-[#0A2540] prose-a:text-blue-600">
                                <ReactMarkdown>{product.description}</ReactMarkdown>
                            </article>
                        </div>
                    )}


                    {/* --- BAGIAN 3: KONTEN SALES PAGE (KHUSUS ADS) --- */}
                    {isLandingPage && (
                        <div className="space-y-24 animate-in slide-in-from-bottom duration-700 delay-100 mt-12">
                            
                            {/* SECTION: PROBLEM vs SOLUTION */}
                            {adsRaw.problems && adsRaw.solutions && (
                                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none -ml-20 -mb-20"></div>

                                    <div className="relative z-10 grid md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                                                <XCircle size={28} /> Masalah Anda
                                            </h3>
                                            <div className="space-y-4">
                                                {adsRaw.problems.map((problem, i) => (
                                                    <div key={i} className="flex gap-4 items-start p-4 bg-red-50/50 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
                                                        <div className="mt-1 text-red-500 font-bold shrink-0">✕</div>
                                                        <p className="text-gray-700 font-medium">{problem}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                                                <CheckCircle size={28} /> Solusi Kami
                                            </h3>
                                            <div className="space-y-4">
                                                {adsRaw.solutions.map((solution, i) => (
                                                    <div key={i} className="flex gap-4 items-start p-4 bg-green-50/50 rounded-xl border border-green-100 hover:bg-green-50 transition-colors shadow-sm">
                                                        <div className="mt-1 bg-green-500 text-white rounded-full p-0.5 shrink-0"><Check size={12} strokeWidth={4} /></div>
                                                        <p className="text-gray-800 font-bold">{solution}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION: BENEFITS */}
                            {adsRaw.benefits && (
                                <div className="text-center">
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A2540] mb-3">Apa yang Anda Dapatkan?</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                        {adsRaw.benefits.map((benefit, i) => {
                                            const Icon = benefitIcons[i % benefitIcons.length];
                                            return (
                                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all flex flex-col items-center gap-4 group">
                                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Icon size={24} />
                                                    </div>
                                                    <span className="font-bold text-gray-800">{benefit}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* SECTION: FAQ */}
                            {adsRaw.faqs && (
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-2xl font-bold text-center text-[#0A2540] mb-8">Pertanyaan Umum</h2>
                                    <div className="bg-white rounded-2xl border border-gray-200 p-2 md:p-6 shadow-sm">
                                        {adsRaw.faqs.map((faq, i) => (
                                            <FAQItem key={i} question={faq.q} answer={faq.a} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECTION: FINAL CTA */}
                            <div className="relative overflow-hidden bg-[#0A2540] rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-full bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Siap Mengubah Hasil Anda?</h2>
                                    <div className="pt-4">
                                        <a href={product.checkout_url} target="_blank" rel="noreferrer" className="inline-block w-full md:w-auto px-8 py-5 bg-white text-[#0A2540] font-bold text-lg rounded-xl hover:bg-gray-100 hover:scale-105 transition-all shadow-xl">
                                            {headerContent.cta}
                                        </a>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>
            
            {isLandingPage ? <SimpleFooter /> : <Footer />}
        </div>
    );
}