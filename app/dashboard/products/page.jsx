"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, X, FileText, Code, AlignLeft, AlertTriangle, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast'; // Import Toast

const generateSlug = (text) => {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
};

export default function ProductsPage() {
    const supabase = createClient();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("write");

    // Modal Delete States (NEW)
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, productName: "" });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        slug: "",
        category: "Template",
        price: "",
        short_description: "",
        description: "",
        image_url: "",
        checkout_url: "",
        ads_content: ""
    });

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data produk");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleOpenModal = (product = null) => {
        setActiveTab("write");
        if (product) {
            let adsString = "";
            try { if (product.ads_content) adsString = JSON.stringify(product.ads_content, null, 2); } catch (e) { }

            setFormData({
                ...product,
                short_description: product.short_description || "",
                ads_content: adsString
            });
            setIsEditing(true);
        } else {
            const defaultJson = JSON.stringify({ title: "", subtitle: "", tagline: "", problems: ["Masalah 1"], solutions: ["Solusi 1"], benefits: ["Benefit 1"], faqs: [{ q: "Q", a: "A" }], cta: "Beli" }, null, 2);
            setFormData({ id: null, name: "", slug: "", category: "Template", price: "", short_description: "", description: "", image_url: "", checkout_url: "", ads_content: defaultJson });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        if (!isEditing) setFormData(prev => ({ ...prev, name: val, slug: generateSlug(val) }));
        else setFormData(prev => ({ ...prev, name: val }));
    };

    // --- NEW DELETE LOGIC ---
    const handleDeleteClick = (product) => {
        setDeleteModal({ isOpen: true, productId: product.id, productName: product.name });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        const toastId = toast.loading("Menghapus...");

        try {
            const { error } = await supabase.from('products').delete().eq('id', deleteModal.productId);
            if (error) throw error;

            setProducts(products.filter(p => p.id !== deleteModal.productId));
            toast.success("Produk berhasil dihapus", { id: toastId });
            setDeleteModal({ isOpen: false, productId: null, productName: "" });
        } catch (error) {
            toast.error("Gagal menghapus: " + error.message, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading("Menyimpan data...");

        try {
            let parsedAds = null;
            if (formData.ads_content) {
                try { parsedAds = JSON.parse(formData.ads_content); } catch (err) {
                    toast.error("Format JSON Iklan Salah!", { id: toastId });
                    setIsSaving(false);
                    return;
                }
            }

            const payload = {
                name: formData.name,
                slug: formData.slug,
                category: formData.category,
                price: formData.price,
                short_description: formData.short_description,
                description: formData.description,
                image_url: formData.image_url,
                checkout_url: formData.checkout_url,
                ads_content: parsedAds
            };

            let error;
            if (isEditing) {
                const { error: upErr } = await supabase.from('products').update(payload).eq('id', formData.id);
                error = upErr;
            } else {
                const { error: inErr } = await supabase.from('products').insert([payload]);
                error = inErr;
            }

            if (error) throw error;

            setIsModalOpen(false);
            fetchProducts();
            toast.success(isEditing ? "Produk Diperbarui!" : "Produk Ditambahkan!", { id: toastId });
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#0A2540]">Manajemen Produk</h1>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-800 shadow-lg transition-transform active:scale-95">
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">Produk</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Harga</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} className="h-full w-full object-cover" alt="" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px]">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-400 max-w-[200px] truncate">{product.short_description || "-"}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{product.category}</span></td>
                                <td className="px-6 py-4 font-mono text-gray-700">Rp {parseInt(product.price).toLocaleString('id-ID')}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2 transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDeleteClick(product)} className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && !isLoading && (
                    <div className="p-12 text-center text-gray-400">Belum ada produk. Tambahkan sekarang!</div>
                )}
            </div>

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="text-lg font-bold">{isEditing ? "Edit Produk" : "Produk Baru"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold">Nama</label><input className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.name} onChange={handleNameChange} required /></div>
                                    <div><label className="text-sm font-semibold">Slug</label><input className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500 outline-none" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold">Kategori</label><select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}><option>Template</option><option>E-Book</option><option>Course</option><option>Service</option></select></div>
                                    <div><label className="text-sm font-semibold">Harga</label><input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-sm font-semibold">Gambar URL</label><input type="url" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} /></div>
                                    <div><label className="text-sm font-semibold">Checkout URL</label><input type="url" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={formData.checkout_url} onChange={(e) => setFormData({ ...formData, checkout_url: e.target.value })} /></div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold flex items-center gap-2 mb-1">
                                        <AlignLeft size={16} /> Deskripsi Singkat (Preview Kartu)
                                    </label>
                                    <textarea
                                        className="w-full border rounded-lg px-3 py-2 text-sm h-20 outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ringkasan singkat untuk tampilan depan..."
                                        maxLength={150}
                                        value={formData.short_description}
                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-400 text-right">{formData.short_description.length}/150</p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-semibold flex items-center gap-2"><FileText size={16} /> Deskripsi Lengkap (Markdown)</label>
                                        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                            <button type="button" onClick={() => setActiveTab("write")} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === 'write' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Tulis</button>
                                            <button type="button" onClick={() => setActiveTab("preview")} className={`px-3 py-1 text-xs font-bold rounded transition-all ${activeTab === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Preview</button>
                                        </div>
                                    </div>
                                    {activeTab === 'write' ? (
                                        <textarea className="w-full border rounded-lg px-4 py-3 text-sm font-mono h-40 outline-none focus:ring-2 focus:ring-blue-500" placeholder="# Judul..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                    ) : (
                                        <div className="w-full border rounded-lg px-4 py-3 h-40 overflow-y-auto bg-gray-50 prose prose-sm max-w-none"><ReactMarkdown>{formData.description}</ReactMarkdown></div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold flex items-center gap-2"><Code size={16} /> Iklan JSON</label>
                                    <textarea className="w-full bg-slate-900 text-green-400 font-mono text-xs rounded-lg px-4 py-3 h-32 outline-none focus:ring-2 focus:ring-blue-500" value={formData.ads_content} onChange={(e) => setFormData({ ...formData, ads_content: e.target.value })} />
                                </div>
                            </form>
                        </div>
                        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Batal</button>
                            <button type="submit" form="productForm" disabled={isSaving} className="px-6 py-2 text-sm font-bold text-white bg-[#0A2540] hover:bg-blue-800 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                                {isSaving && <Loader2 size={16} className="animate-spin" />} Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CUSTOM DELETE MODAL --- */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border-t-4 border-red-500">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Produk?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Anda yakin ingin menghapus <span className="font-bold text-gray-800">"{deleteModal.productName}"</span>?
                                <br />Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, productId: null, productName: "" })}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex justify-center items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Menghapus...
                                        </>
                                    ) : (
                                        "Ya, Hapus"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}