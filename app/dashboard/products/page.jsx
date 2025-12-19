"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, X, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        category: "Template",
        price: "",
        description: "",
        image_url: "",
        checkout_url: "",
    });

    // --- 1. Fetch Products (READ) ---
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            alert("Gagal mengambil data: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Persiapkan data yang akan dikirim ke Supabase
            // Pastikan nama kolom sesuai dengan tabel di database
            const payload = {
                name: formData.name,
                category: formData.category,
                price: parseInt(formData.price), // Pastikan angka
                image_url: formData.image_url,
                checkout_url: formData.checkout_url,
                // description: formData.description, // Uncomment jika Anda sudah menambahkan kolom 'description' di tabel
            };

            let error;

            if (isEditing) {
                // Logic UPDATE
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', formData.id);
                error = updateError;
            } else {
                // Logic CREATE (INSERT)
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            // Jika sukses, tutup modal dan refresh data
            setIsModalOpen(false);
            fetchProducts();
            alert(isEditing ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");

        } catch (error) {
            console.error("Error submitting:", error);
            alert("Terjadi kesalahan: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. Handle Delete (DELETE) ---
    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Hapus dari state lokal agar UI langsung update tanpa loading
            setProducts(products.filter((p) => p.id !== id));
            alert("Produk berhasil dihapus.");

        } catch (error) {
            console.error("Error deleting:", error);
            alert("Gagal menghapus: " + error.message);
        }
    };

    // --- Helper Functions ---
    const handleOpenModal = (product = null) => {
        if (product) {
            setFormData(product);
            setIsEditing(true);
        } else {
            setFormData({
                id: null,
                name: "",
                category: "Template",
                price: "",
                description: "",
                image_url: "",
                checkout_url: "",
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            {/* Header Actions */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0A2540]">Manajemen Produk</h1>
                    <p className="text-gray-500">Kelola katalog produk digital Anda di sini.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-800 shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18} />
                    Tambah Produk
                </button>
            </div>

            {/* Product Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Memuat data produk...</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4">Link Checkout</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                                                    {product.image_url ? (
                                                        <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                                                            <ImageIcon size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            Rp {parseInt(product.price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 text-blue-600 truncate max-w-[150px]">
                                            {product.checkout_url && (
                                                <a href={product.checkout_url} target="_blank" className="hover:underline flex items-center gap-1">
                                                    Link <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-400">
                                        Belum ada produk. Silakan tambah produk baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Modal Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Nama Produk</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Contoh: Notion Template"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Kategori</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Template</option>
                                        <option>E-Book</option>
                                        <option>Course</option>
                                        <option>Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-gray-700">Harga (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        placeholder="150000"
                                    />
                                </div>
                            </div>

                            {/* Input URL Gambar */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <ImageIcon size={14} /> Link Gambar (URL)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://i.imgur.com/..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">Paste link gambar langsung (direct link).</p>
                            </div>

                            {/* Input URL Checkout (Lynk.id / Duitku) */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Link Checkout</label>
                                <input
                                    type="url"
                                    placeholder="https://lynk.id/username/produk..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    value={formData.checkout_url}
                                    onChange={(e) => setFormData({ ...formData, checkout_url: e.target.value })}
                                    required
                                />
                            </div>

                             {/* Input Deskripsi (Opsional, pastikan kolom 'description' ada di DB jika ingin disimpan) */}
                             <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Deskripsi Singkat</label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                    placeholder="Jelaskan produk Anda..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <p className="mt-1 text-xs text-gray-400 italic">
                                    *Catatan: Data deskripsi hanya akan tersimpan jika kolom 'description' sudah dibuat di database.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-[#0A2540] px-6 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                    {isEditing ? "Simpan Perubahan" : "Simpan Produk"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}