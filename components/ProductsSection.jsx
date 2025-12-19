const ProductsSection = () => {
    const sectionPadding = "py-24 px-6";
    const glassCardClass =
        "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90"; 
    const products = [
        {
            name: "Sistem Manajemen Freelance",
            tag: "Template Notion",
            desc: "Dashboard lengkap untuk mengatur klien, invoice, dan proyek dalam satu tempat. Tidak ada lagi file tercecer.",
            price: "Rp 149.000",
            link: "https://lynk.id/username/produk1", // Placeholder Lynk.id
        },
        {
            name: "Panduan Digital Declutter",
            tag: "E-Book PDF",
            desc: "Langkah demi langkah membersihkan 'sampah digital' di laptop dan HP Anda agar performa kerja meningkat.",
            price: "Rp 99.000",
            link: "https://lynk.id/username/produk2",
        },
        {
            name: "Focus Planner 2024",
            tag: "Printable",
            desc: "Planner harian minimalis yang dirancang khusus untuk metode Deep Work. Cetak dan gunakan segera.",
            price: "Rp 49.000",
            link: "https://lynk.id/username/produk3",
        },
    ];

    return (
        <section id="products" className={`${sectionPadding} relative overflow-hidden`}>
            {/* Dekorasi Background Tambahan */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="mx-auto max-w-6xl relative z-10">
                <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
                    <div>
                        <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">Toko Digital</span>
                        <h2 className="mt-2 text-3xl font-bold text-[#0A2540] md:text-4xl">Produk Unggulan</h2>
                    </div>
                    <p className="mt-4 md:mt-0 max-w-md text-gray-600 text-sm md:text-right">
                        Transaksi aman & instan via Lynk.id. <br /> Akses produk langsung dikirim ke email Anda.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product, idx) => (
                        <div key={idx} className={`${glassCardClass} flex flex-col justify-between overflow-hidden group`}>
                            {/* Image Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 w-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#0A2540]/5 group-hover:bg-[#0A2540]/10 transition-colors"></div>
                                <span className="text-gray-400 font-medium text-sm flex flex-col items-center gap-2">
                                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Preview Image
                                </span>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{product.tag}</span>
                                    <span className="text-gray-900 font-bold">{product.price}</span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#0A2540] group-hover:text-blue-700 transition-colors">{product.name}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{product.desc}</p>

                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#0A2540] py-3 text-sm font-bold text-white transition-all hover:bg-[#0052CC] hover:shadow-lg group-hover:scale-[1.02]"
                                >
                                    Beli Sekarang
                                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductsSection;