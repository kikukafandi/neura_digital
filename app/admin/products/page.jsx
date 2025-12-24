"use client";

import { useState, useEffect } from "react";
import { addProduct, getProducts, deleteProduct, updateProduct } from "@/app/actions";
import {
    Plus, Edit2, Trash2, X, FileText,
    Code, AlignLeft, Loader2, Package, Image as ImageIcon,
    Megaphone // Icon baru buat Ads
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => { loadProducts(); }, []);

    async function loadProducts() {
        const data = await getProducts();
        setProducts(data);
        setIsLoading(false);
    }

    function handleOpenModal(product = null) {
        setEditingProduct(product);
        setShowModal(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        try {
            if (editingProduct) {
                formData.append("id", editingProduct.id);
                await updateProduct(formData);
                toast.success("Produk diupdate!");
            } else {
                await addProduct(formData);
                toast.success("Produk ditambah!");
            }
            setShowModal(false);
            loadProducts();
        } catch (error) {
            toast.error("Gagal menyimpan.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Hapus produk ini?")) return;
        await deleteProduct(id);
        toast.success("Produk dihapus.");
        loadProducts();
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Kelola Produk</h1>
                <button onClick={() => handleOpenModal(null)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-lg">
                    <Plus size={18} /> Tambah Produk
                </button>
            </div>

            {/* TABLE LIST */}
            {isLoading ? <Loader2 className="animate-spin mx-auto text-blue-500" size={32} /> : (
                <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 font-bold border-b border-white/5 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Produk</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0">
                                            {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <Package className="m-auto mt-2 text-slate-600"/>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{p.name}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{p.slug}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] uppercase font-bold">{p.category}</span></td>
                                    <td className="px-6 py-4 font-mono">Rp {p.price?.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(p)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                        
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900 shrink-0">
                            <h3 className="font-bold text-lg text-white">{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                            
                            {/* BAGIAN 1: INFO DASAR */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                    <Package size={16}/> Informasi Dasar
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Nama Produk</label>
                                        <input name="name" required defaultValue={editingProduct?.name} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                                        <select name="category" defaultValue={editingProduct?.category || "template"} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none">
                                            <option value="template">Notion Template</option>
                                            <option value="ebook">E-Book</option>
                                            <option value="source_code">Source Code</option>
                                            <option value="course">Video Course</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Harga (IDR)</label>
                                        <input name="price" type="number" required defaultValue={editingProduct?.price} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">URL Gambar Cover</label>
                                        <input name="imageUrl" defaultValue={editingProduct?.imageUrl} placeholder="https://..." className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Singkat</label>
                                    <input name="shortDescription" defaultValue={editingProduct?.shortDescription} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Lengkap</label>
                                    <textarea name="description" rows="3" defaultValue={editingProduct?.description} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none" />
                                </div>
                            </div>

                            {/* BAGIAN 2: ADS COPYWRITING (BARU) */}
                            <div className="space-y-4 pt-4 border-t border-slate-700/50">
                                <h4 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                                    <Megaphone size={16}/> Copywriting Ads Page
                                </h4>
                                <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Headline (Judul Besar)</label>
                                            <input name="adsTitle" defaultValue={editingProduct?.adsContent?.title} placeholder="Sama dengan nama produk" className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Sub-Headline</label>
                                            <input name="adsSubtitle" defaultValue={editingProduct?.adsContent?.subtitle} placeholder="Kalimat penjelas yang nendang" className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none text-sm" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Daftar Masalah (1 per baris)</label>
                                            <textarea 
                                                name="adsProblems" 
                                                rows="3" 
                                                defaultValue={editingProduct?.adsContent?.problems?.join("\n")} 
                                                placeholder="Contoh:\nSusah mengatur waktu\nTugas menumpuk"
                                                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none text-sm resize-none" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Daftar Solusi (1 per baris)</label>
                                            <textarea 
                                                name="adsSolutions" 
                                                rows="3" 
                                                defaultValue={editingProduct?.adsContent?.solutions?.join("\n")} 
                                                placeholder="Contoh:\nTemplate otomatis\nHemat 10 jam/minggu"
                                                className="w-full bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-pink-500 outline-none text-sm resize-none" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 shrink-0">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-400 font-bold hover:text-white rounded-xl transition">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2">
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