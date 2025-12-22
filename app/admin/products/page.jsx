"use client";

import { useState, useEffect, useRef } from "react";
import { addProduct, getProducts } from "@/app/actions"; // Menggunakan Server Actions kita
import {
    Plus, Edit2, Trash2, X, FileText,
    Code, AlignLeft, AlertTriangle, Loader2, Package
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function ProductsPage() {
    // State untuk data & UI
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Fetch data saat halaman dimuat
    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            toast.error("Gagal memuat produk");
        } finally {
            setIsLoading(false);
        }
    }

    // Handle Submit Form Tambah Produk
    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.target);

        try {
            await addProduct(formData);
            toast.success("Produk berhasil ditambahkan!");
            setShowModal(false);
            e.target.reset();
            loadProducts(); // Refresh data
        } catch (error) {
            toast.error("Gagal menambah produk");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <Toaster position="bottom-right" />

            {/* Header Page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Produk Digital</h1>
                    <p className="text-slate-500">Kelola aset digital yang Anda jual di Simpul Nalar.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-[#0A2540] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : products.length === 0 ? (
                // Empty State
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Belum ada produk</h3>
                    <p className="text-slate-500 mb-6">Mulai tambahkan aset digital pertama Anda.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Tambah Sekarang
                    </button>
                </div>
            ) : (
                // Product List Table
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Nama Produk</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Harga</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {product.name}
                                            <div className="text-xs text-slate-400 font-normal mt-0.5 truncate max-w-[200px]">
                                                /{product.slug}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">
                                            Rp {product.price?.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Tambah Produk */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">Tambah Produk Baru</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FileText size={14} className="text-blue-600" /> Nama Produk
                                </label>
                                <input
                                    name="name"
                                    required
                                    placeholder="Contoh: Template Notion Second Brain"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <AlignLeft size={14} className="text-blue-600" /> Kategori
                                    </label>
                                    <select
                                        name="category"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition appearance-none"
                                    >
                                        <option value="template">Notion Template</option>
                                        <option value="source_code">Source Code</option>
                                        <option value="course">Course</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Code size={14} className="text-blue-600" /> Harga (IDR)
                                    </label>
                                    <input
                                        name="price"
                                        type="number"
                                        required
                                        placeholder="0"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#0A2540] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-900/10 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Simpan Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}