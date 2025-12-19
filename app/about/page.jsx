import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <Navbar />
            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-6">
                        Tentang <span className="text-blue-600">Neura Digital</span>
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed mb-16">
                        Kami adalah studio digital yang berfokus pada satu hal: <b>Mengubah kekacauan menjadi kejelasan.</b> 
                         Neura Digital lahir dari frustrasi terhadap alat kerja yang terlalu rumit.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <Target size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-[#0A2540] mb-2">Misi Kami</h3>
                            <p className="text-gray-600 text-sm">Menyediakan aset digital yang membantu profesional menghemat waktu 10 jam per minggu.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-[#0A2540] mb-2">Siapa Kami</h3>
                            <p className="text-gray-600 text-sm">Tim kecil yang terdiri dari desainer sistem, pengembang, dan penulis produktivitas.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4">
                                <Heart size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-[#0A2540] mb-2">Nilai Kami</h3>
                            <p className="text-gray-600 text-sm">Kejelasan di atas segalanya. Kami hanya membuat alat yang kami gunakan sendiri.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}