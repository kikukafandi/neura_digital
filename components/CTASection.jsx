import Link from "next/link";

const CTASection = () => {
    return (
        <section id="contact" className="py-24 px-6">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#0A2540] relative shadow-2xl">
                {/* Abstract shapes overlay */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
                    <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-purple-500 blur-3xl"></div>
                </div>

                <div className="relative z-10 px-6 py-20 text-center md:px-20">
                    <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">
                        Upgrade Cara Kerja Anda Hari Ini
                    </h2>
                    <p className="mb-10 text-lg text-blue-100 max-w-2xl mx-auto">
                        Dapatkan akses instan ke alat-alat digital yang akan mengubah kekacauan menjadi keteraturan.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="products" className="rounded-lg bg-white px-8 py-4 text-base font-bold text-[#0A2540] transition-transform hover:scale-105 hover:bg-gray-100">
                            Lihat Katalog Produk
                        </Link>
                        <a href="mailto:neuradigitial@gmail.com" className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-colors hover:bg-white/20">
                            Hubungi Support
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;