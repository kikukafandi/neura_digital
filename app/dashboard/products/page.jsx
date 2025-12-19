"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, X, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
        image_url: "", // Input URL gambar
        checkout_url: "", // Input Lynk.id / Duitku
    });

    // --- Fetch Products ---
    const fetchProducts = async () => {
        setIsLoading(true);
        // Ganti dengan: const { data, error } = await supabase.from('products').select('*');
        // Mock Data untuk Demo:
        setTimeout(() => {
            setProducts([
                { id: 1, name: "Notion Freelance OS", category: "Template", price: 149000, image_url: "https://placehold.co/600x400/0A2540/FFF", checkout_url: "https://lynk.id/demo" },
                { id: 2, name: "Digital Declutter Guide", category: "E-Book", price: 99000, image_url: "https://placehold.co/600x400/0052CC/FFF", checkout_url: "https://lynk.id/demo" },
            ]);
            setIsLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- Handlers ---
    const handleOpenModal = (product = null) => {
        if (product) {
            setFormData(product);
            setIsEditing(true);
        } else {
            setFormData({ id: null, name: "", category: "Template", price: "", description: "", image_url: "", checkout_url: "" });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            // Logic Supabase: await supabase.from('products').delete().eq('id', id);
            setProducts(products.filter(p => p.id !== id));
            alert("Produk dihapus (Simulasi)");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi sederhana
        if (!formData.name || !formData.price) return alert("Mohon lengkapi data");

        // Logic Supabase:
        /*
        if (isEditing) {
           await supabase.from('products').update(formData).eq('id', formData.id);
        } else {
           await supabase.from('products').insert([formData]);
        }
        */

        // Simulasi Update UI
        if (isEditing) {
            setProducts(products.map(p => p.id === formData.id ? formData : p));
        } else {
            setProducts([...products, { ...formData, id: Date.now() }]);
        }

        setIsModalOpen(false);
        alert(isEditing ? "Produk diperbarui!" : "Produk ditambahkan!");
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
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
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
                                    <a href={product.checkout_url} target="_blank" className="hover:underline flex items-center gap-1">
                                        Link <ExternalLink size={12} />
                                    </a>
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
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && !isLoading && (
                    <div className="p-12 text-center text-gray-400">Belum ada produk.</div>
                )}
            </div>

            {/* --- Modal Form --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
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
                                    placeholder="https://imgur.com/..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-400">Gunakan link langsung ke gambar (Direct Link).</p>
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
                                <p className="mt-1 text-xs text-gray-400">
                                    Saat ini menggunakan Lynk.id. Bisa diganti ke Duitku Payment Gateway nanti.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-[#0A2540] px-6 py-2 text-sm font-bold text-white hover:bg-blue-800"
                                >
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