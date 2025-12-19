import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Zap, Layout, BookOpen, Smartphone, Shield, Smile } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        { title: "Sistem Terstruktur", desc: "Setiap template dibangun dengan logika database yang kuat namun mudah digunakan.", icon: Layout },
        { title: "Instan Akses", desc: "Tidak perlu menunggu pengiriman. Produk digital langsung masuk ke email Anda.", icon: Zap },
        { title: "Materi Terkurasi", desc: "Kami membuang materi sampah dan hanya menyajikan daging.", icon: BookOpen },
        { title: "Mobile Friendly", desc: "Semua aset kami dioptimalkan untuk tampil sempurna di HP dan Tablet.", icon: Smartphone },
        { title: "Jaminan Kualitas", desc: "Setiap produk telah melalui uji coba ketat sebelum dirilis.", icon: Shield },
        { title: "Mudah Digunakan", desc: "Dilengkapi panduan video dan teks langkah demi langkah.", icon: Smile },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <Navbar />
            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-6">
                            Keunggulan Kami
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Mengapa ribuan orang memilih Neura Digital sebagai partner produktivitas mereka.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx} className="bg-white/60 backdrop-blur-md border border-white/60 p-8 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                                    <Icon className="w-10 h-10 text-blue-600 mb-4" />
                                    <h3 className="font-bold text-xl text-[#0A2540] mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}