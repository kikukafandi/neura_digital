"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <Navbar />
            <main className="pt-32 pb-24 px-6 relative z-10">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-6">
                            Hubungi Kami
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Ada pertanyaan tentang produk atau butuh bantuan instalasi? Tim kami siap membantu.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Info Kontak */}
                        <div className="bg-[#0A2540] p-10 text-white flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Mail className="text-blue-400" />
                                        <span>simpulnalar20@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <MapPin className="text-blue-400" />
                                        <span>Surabaya, Indonesia</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12">
                                <p className="text-blue-200 text-sm">Jam Operasional:<br />Senin - Jumat, 09.00 - 17.00 WIB</p>
                            </div>
                        </div>


                        {/* Form Kontak (Visual Saja) */}
                        <div className="p-10">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Depan</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none" placeholder="Budi" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Belakang</label>
                                        <input type="text" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none" placeholder="Santoso" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none" placeholder="budi@email.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Pesan</label>
                                    <textarea rows={4} className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none" placeholder="Apa yang bisa kami bantu?"></textarea>
                                </div>
                                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    Kirim Pesan
                                </button>
                            </form>
                            <p className="text-red-600"><i>*form tidak berfungsi</i></p>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}