import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">

                    {/* Brand Info */}
                    <div className="max-w-sm">
                        <Link href="/" className="text-xl font-bold text-[#0A2540] flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                                <img src="icon.png" alt="neura-icon" />
                            </div>
                            Neura Digital
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Membangun ekosistem digital yang lebih bersih, terstruktur, dan produktif untuk kreator Indonesia.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="flex gap-12 text-sm">
                        <div>
                            <h4 className="font-bold text-[#0A2540] mb-4">Menu</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><Link href="#products" className="hover:text-blue-600">Produk</Link></li>
                                <li><Link href="#about" className="hover:text-blue-600">Tentang</Link></li>
                                <li><Link href="#features" className="hover:text-blue-600">Fitur</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0A2540] mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-500">
                                <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-blue-600">Terms of Use</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Neura Digital. All rights reserved.</p>
                    <div className="mt-2 md:mt-0 flex gap-4">
                        <span className="hover:text-gray-600 cursor-pointer">Instagram</span>
                        <span className="hover:text-gray-600 cursor-pointer">Twitter / X</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;