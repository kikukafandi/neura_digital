import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative z-10 flex min-h-screen flex-col justify-center pt-24 pb-12 md:pt-32 lg:pt-0">
            <div className="mx-auto max-w-4xl px-6 text-center">

                {/* Badge Kecil di atas Judul */}
                <div className="animate-enter opacity-0 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 mb-6 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                    Solusi Digital Produktif
                </div>

                <h1 className="animate-enter delay-100 opacity-0 mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2540] md:text-7xl">
                    Kejernihan dalam <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-[#0052CC] to-[#2563EB] bg-clip-text text-transparent">
                        Pemikiran Digital
                    </span>
                </h1>

                <p className="animate-enter delay-200 opacity-0 mb-10 mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
                    Hentikan kekacauan informasi. Kami menyediakan kerangka kerja dan alat digital premium untuk meningkatkan fokus dan hasil kerja Anda.
                </p>

                <div className="animate-enter delay-300 opacity-0 flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Link
                        href="#products"
                        className="inline-flex h-14 items-center justify-center rounded-full bg-[#0A2540] px-8 text-base font-bold text-white transition-all hover:bg-[#0052CC] hover:shadow-[0_0_20px_rgba(0,82,204,0.3)] hover:-translate-y-1"
                    >
                        Lihat Produk
                    </Link>
                    <Link
                        href="#about"
                        className="inline-flex h-14 items-center justify-center rounded-full border border-gray-200 bg-white/60 px-8 text-base font-bold text-gray-800 backdrop-blur-sm transition-all hover:bg-white hover:border-gray-300 hover:shadow-md"
                    >
                        Pelajari Konsep
                    </Link>
                </div>

                {/* Social Proof Kecil (Optional Visual Enhancer) */}
                <div className="animate-enter delay-300 opacity-0 mt-12 text-sm text-gray-400 font-medium">
                    Dipercaya oleh profesional yang ingin bekerja lebih cerdas.
                </div>
            </div>
        </section>
    );
};
export default HeroSection;