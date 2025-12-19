import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Dekorasi Latar Belakang (Opsional - agar senada dengan halaman lain) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] left-[10%] w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl mix-blend-multiply"></div>
            </div>

            <div className="relative z-10 max-w-lg mx-auto">
                {/* Ilustrasi Ikon Besar */}
                <div className="mb-8 flex justify-center relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <FileQuestion size={120} className="text-[#0A2540] relative z-10" strokeWidth={1.5} />
                    {/* Aksen kecil */}
                    <Search size={32} className="text-blue-500 absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm" />
                </div>

                {/* Teks Utama */}
                <h1 className="text-6xl md:text-8xl font-extrabold text-[#0A2540] tracking-tight mb-2">
                    404
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0A2540] mb-4">
                    Aset Digital Tidak Ditemukan
                </h2>
                <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                    Ups! Sepertinya halaman atau produk yang Anda cari telah dipindahkan, dihapus, atau link-nya rusak.
                </p>

                {/* Tombol Navigasi */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Tombol Kembali (Primary CTA) */}
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#0A2540] text-white font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:-translate-y-1 transition-all gap-2 group"
                    >
                        <Home size={18} className="group-hover:scale-110 transition-transform" />
                        Kembali ke Beranda
                    </Link>

                    {/* Tombol Katalog (Secondary CTA) */}
                    <Link
                        href="/products"
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white text-[#0A2540] font-bold border-2 border-[#0A2540]/10 hover:border-[#0A2540] hover:bg-gray-50 transition-all gap-2"
                    >
                        <Search size={18} />
                        Lihat Katalog Produk
                    </Link>
                </div>
            </div>

            {/* Footer Minimalis */}
            <div className="absolute bottom-8 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Neura Digital. Error Code: 404_NOT_FOUND
            </div>
        </div>
    );
}