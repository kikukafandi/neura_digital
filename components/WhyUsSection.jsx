const WhyUsSection = () => {
    const sectionPadding = "py-24 px-6";
    const glassCardClass =
        "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90";
    return (
        <section id="about" className={`${sectionPadding} bg-white relative`}>
            <div className="mx-auto max-w-5xl rounded-3xl bg-[#F8FAFC] p-8 md:p-16 border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#0A2540] mb-6">Filosofi Simpul Nalar</h2>
                    <div className="space-y-6 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                        <p>
                            Kami percaya bahwa <strong>produktivitas bukan tentang melakukan lebih banyak hal</strong>,
                            melainkan menghilangkan hal yang tidak perlu.
                        </p>
                        <p>
                            Semua produk digital yang kami buat—baik itu template, ebook, atau kursus—didesain
                            dengan prinsip <em>"Minimum Friction, Maximum Output"</em>. Kami ingin Anda menghabiskan
                            lebih sedikit waktu mengelola alat kerja, dan lebih banyak waktu untuk berkarya.
                        </p>
                    </div>
                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {[
                            { label: "Pengguna", val: "1.2k+" },
                            { label: "Produk", val: "15+" },
                            { label: "Rating", val: "4.9/5" },
                            { label: "Support", val: "24/7" }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="text-2xl font-bold text-blue-600">{stat.val}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyUsSection;