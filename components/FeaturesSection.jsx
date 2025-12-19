const sectionPadding = "py-24 px-6";
const glassCardClass =
    "bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white/90";

const FeaturesSection = () => {
    const features = [
        {
            title: "Berpikir Terstruktur",
            desc: "Kerangka kerja mental untuk memecah masalah kompleks menjadi langkah taktis.",
            color: "bg-blue-100 text-blue-600",
            path: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        },
        {
            title: "Aset Siap Pakai",
            desc: "Template Notion, spreadsheet, dan dokumen yang langsung bisa digunakan.",
            color: "bg-indigo-100 text-indigo-600",
            path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        },
        {
            title: "Fokus Esensial",
            desc: "Materi pembelajaran tanpa basa-basi. Hanya apa yang benar-benar bernilai.",
            color: "bg-teal-100 text-teal-600",
            path: "M13 10V3L4 14h7v7l9-11h-7z"
        }
    ];

    return (
        <section id="features" className={sectionPadding}>
            <div className="mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#0A2540]">Pilar Utama Kami</h2>
                    <p className="mt-4 text-gray-600">Fondasi dari setiap produk digital yang kami buat.</p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {features.map((item, i) => (
                        <div key={i} className={`${glassCardClass} p-8 group`}>
                            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} transition-transform group-hover:scale-110 duration-300`}>
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.path} />
                                </svg>
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-[#0A2540]">{item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;