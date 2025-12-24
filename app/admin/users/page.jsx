"use client";

import { useState, useEffect } from "react";
import { getUsers, deleteUser, updateUser } from "@/app/actions";
import {
    Search, User, Shield, Trash2, Edit2, CheckCircle, 
    X, Loader2, Mail, Calendar, Crown
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import { format } from "date-fns"; // Opsional: kalau mau format tanggal rapi, atau pakai toLocaleDateString

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. LOAD DATA
    useEffect(() => {
        loadUsers();
    }, []);

    // 2. FILTER SEARCH
    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
        } else {
            const lower = searchQuery.toLowerCase();
            const filtered = users.filter(u => 
                u.name?.toLowerCase().includes(lower) || 
                u.email?.toLowerCase().includes(lower)
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    async function loadUsers() {
        const data = await getUsers();
        setUsers(data);
        setFilteredUsers(data);
        setIsLoading(false);
    }

    // HANDLERS
    function handleEdit(user) {
        setEditingUser(user);
        setShowModal(true);
    }

    async function handleDelete(id) {
        if(!confirm("Hapus user ini? Data tugas dan transaksi mereka akan hilang permanen.")) return;
        
        const res = await deleteUser(id);
        if (res.success) {
            toast.success(res.success);
            loadUsers();
        } else {
            toast.error(res.error);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        const res = await updateUser(formData);
        
        if (res.success) {
            toast.success(res.success);
            setShowModal(false);
            loadUsers();
        } else {
            toast.error(res.error);
        }
        setIsSubmitting(false);
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />

            {/* HEADER & STATS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Data Pengguna</h1>
                    <div className="flex gap-4 text-xs font-medium">
                        <span className="text-slate-400">Total: <span className="text-white">{users.length}</span></span>
                        <span className="text-slate-400">Pro Plan: <span className="text-green-400">{users.filter(u => u.plan === 'pro').length}</span></span>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari nama atau email..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:border-blue-500 outline-none text-sm transition"
                    />
                </div>
            </div>

            {/* TABLE */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-[#0A0F1E] border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500">
                    Tidak ada pengguna ditemukan.
                </div>
            ) : (
                <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-400 font-bold border-b border-white/5 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User Info</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Bergabung</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar Initials */}
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold overflow-hidden shrink-0">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover"/>
                                                    ) : (
                                                        user.name?.charAt(0).toUpperCase() || "U"
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{user.name || "Tanpa Nama"}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Mail size={10}/> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold uppercase">
                                                    <Shield size={10} fill="currentColor"/> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-slate-400 text-xs font-bold uppercase">
                                                    <User size={10}/> User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.plan === 'pro' ? (
                                                <span className="inline-flex items-center gap-1.5 text-yellow-400 font-bold text-xs">
                                                    <Crown size={12} fill="currentColor"/> PRO
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-xs font-medium">Free</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            }) : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(user)} className="p-2 bg-blue-900/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition" title="Edit Role/Plan">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition" title="Hapus User">
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

            {/* EDIT MODAL */}
            {showModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                            <h3 className="font-bold text-lg text-white">Edit Akses User</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <input type="hidden" name="id" value={editingUser.id} />
                            
                            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-white">
                                    {editingUser.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <div className="font-bold text-white">{editingUser.name}</div>
                                    <div className="text-xs text-slate-500">{editingUser.email}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Role Access</label>
                                    <select name="role" defaultValue={editingUser.role} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 outline-none appearance-none">
                                        <option value="user">User Biasa</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Subscription</label>
                                    <select name="plan" defaultValue={editingUser.plan} className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 outline-none appearance-none">
                                        <option value="free">Free Plan</option>
                                        <option value="pro">Pro / Premium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="animate-spin" size={16}/>} Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}