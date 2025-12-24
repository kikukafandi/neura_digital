"use client";

import { useState, useEffect, useRef } from "react";
import {
    Sparkles, ArrowRight, CheckCircle2, Loader2, Plus, Trash2,
    BrainCircuit, Save, LayoutList, X, Play, Trophy, Clock,
    Target, BookTemplate, Repeat
} from "lucide-react";
import { saveAtomizedTask, getUserTasks, toggleSubtask, saveTaskAsTemplate, getTemplates, useTemplate, deleteTemplate } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal"; // IMPORT MODAL BARU

// --- KOMPONEN KECIL: FOCUS TIMER ---
function FocusTimer({ task, onClose, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/95 backdrop-blur-md animate-in fade-in duration-300 px-4">
            <div className="text-center text-white w-full max-w-md p-8 border border-white/10 rounded-3xl bg-[#0A0F1E] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                            Focus Protocol
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-slate-100">{task?.content || "Deep Work Session"}</h2>
                    </div>
                    <div className="text-6xl md:text-7xl font-mono font-bold tracking-tighter mb-10 tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="flex justify-center gap-6 mb-8">
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 border ${isActive
                                ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]'
                                : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]'}`}
                        >
                            {isActive ? <span className="font-bold text-[10px]">PAUSE</span> : <Play fill="currentColor" size={24} className="ml-1" />}
                        </button>
                        <button onClick={onClose} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest">Jangan keluar sebelum timer habis.</p>
                </div>
            </div>
        </div>
    );
}

// --- HALAMAN UTAMA ---
export default function TasksPage() {
    const [activeTab, setActiveTab] = useState("list");
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle");
    const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [templates, setTemplates] = useState([]);

    // UI States
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const manualInputRef = useRef(null);

    // Focus Mode & Confetti
    const [focusTask, setFocusTask] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // --- MODAL STATE (PENGGANTI ALERT) ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        variant: "primary",
        confirmText: "Ya, Lanjutkan",
        isLoading: false,
        onConfirm: () => { } // Placeholder func
    });

    useEffect(() => { loadData(); }, []);
    useEffect(() => { if (isAddingManual && manualInputRef.current) manualInputRef.current.focus(); }, [isAddingManual]);

    async function loadData() {
        const tasks = await getUserTasks();
        const temps = await getTemplates();
        setMyTasks(tasks);
        setTemplates(temps);
    }

    const totalSubtasks = myTasks.reduce((acc, t) => acc + t.subtasks.length, 0);
    const completedSubtasks = myTasks.reduce((acc, t) => acc + t.subtasks.filter(s => s.isCompleted).length, 0);
    const progressPercentage = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
    const dailyLevel = Math.floor(completedSubtasks / 5) + 1;

    // --- HANDLERS UTAMA ---
    const handleAtomize = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setStatus("thinking");
        try {
            const res = await fetch("/api/ai/atomizer", { method: "POST", body: JSON.stringify({ content: input }) });
            const data = await res.json();
            setGeneratedSubtasks(data.subtasks);
            setStatus("review");
        } catch (error) { setStatus("idle"); toast.error("Gagal koneksi AI."); }
    };

    const handleSave = async () => {
        setStatus("saving");
        const res = await saveAtomizedTask(input, generatedSubtasks);
        if (res.success) {
            toast.success("Misi berhasil dibuat!");
            await loadData();
            setTimeout(() => { setInput(""); setGeneratedSubtasks([]); setStatus("idle"); setActiveTab("list"); }, 500);
        } else { toast.error("Gagal menyimpan."); setStatus("review"); }
    };

    const handleCheck = async (subtaskId, currentStatus) => {
        setMyTasks(prev => prev.map(t => ({
            ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, isCompleted: !currentStatus } : s)
        })));
        if (!currentStatus) triggerConfetti();
        await toggleSubtask(subtaskId, currentStatus);
    };

    // --- MODAL HANDLERS (PENGGANTI WINDOW.CONFIRM) ---

    // 1. Save Template
    const handleSaveAsTemplateClick = (task) => {
        setModalConfig({
            isOpen: true,
            title: "Simpan sebagai SOP?",
            message: `Tugas "${task.content}" akan disimpan ke Library SOP agar bisa digunakan ulang nanti.`,
            variant: "primary",
            confirmText: "Simpan SOP",
            isLoading: false,
            onConfirm: async () => {
                // Set loading di modal
                setModalConfig(prev => ({ ...prev, isLoading: true }));
                const res = await saveTaskAsTemplate(task.id, task.content);
                if (res.success) {
                    toast.success(res.success);
                    await loadData();
                } else {
                    toast.error(res.error);
                }
                closeModal();
            }
        });
    };

    // 2. Delete Template
    const handleDeleteTemplateClick = (id) => {
        setModalConfig({
            isOpen: true,
            title: "Hapus SOP?",
            message: "Tindakan ini tidak dapat dibatalkan. SOP akan hilang permanen dari Library.",
            variant: "danger",
            confirmText: "Hapus Permanen",
            isLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isLoading: true }));
                await deleteTemplate(id);
                toast.success("SOP Dihapus");
                await loadData();
                closeModal();
            }
        });
    };

    // 3. Use Template (Langsung execute tapi kasih loading toast, tidak butuh confirm modal sebenarnya, tapi aman)
    const handleUseTemplate = async (template) => {
        toast.loading("Menerapkan SOP...");
        const res = await useTemplate(template.id);
        toast.dismiss();
        if (res.success) {
            toast.success("SOP Diterapkan!");
            await loadData();
            setActiveTab("list");
        } else {
            toast.error(res.error);
        }
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
    };

    return (
        <div className="relative min-h-screen pb-20 text-slate-200">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />

            {/* --- REUSABLE CONFIRM MODAL --- */}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                confirmText={modalConfig.confirmText}
                isLoading={modalConfig.isLoading}
            />

            {/* FOCUS TIMER */}
            {focusTask && (
                <FocusTimer
                    task={focusTask}
                    onClose={() => setFocusTask(null)}
                    onComplete={() => { setFocusTask(null); triggerConfetti(); }}
                />
            )}

            {/* CONFETTI */}
            {showConfetti && (
                <div className="fixed inset-0 z-[70] pointer-events-none flex justify-center items-start pt-20">
                    <div className="text-6xl animate-bounce filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">🎉</div>
                </div>
            )}

            {/* --- HEADER --- */}
            <div className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-md pt-4 pb-2 px-1 mb-6 border-b border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BrainCircuit className="text-cyan-400" /> Command Center
                        </h1>
                        <p className="text-slate-400 text-xs font-medium">Atur chaos, eksekusi dengan fokus.</p>
                    </div>

                    <div className="bg-[#0A0F1E] p-2 pr-4 rounded-xl border border-white/5 shadow-lg flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-orange-500/30 w-10 h-10 rounded-lg flex items-center justify-center text-orange-400 shrink-0">
                            <Trophy size={18} fill="currentColor" />
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                <span>Level {dailyLevel}</span>
                                <span className="text-cyan-400">{progressPercentage}% EXP</span>
                            </div>
                            <div className="w-full md:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${progressPercentage}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-6 border-b border-white/5 text-sm font-medium overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`pb-3 flex items-center gap-2 transition-all relative whitespace-nowrap ${activeTab === "list" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <LayoutList size={18} /> Misi Saya
                        <span className="bg-white/10 text-slate-300 text-[10px] px-1.5 rounded font-mono">{myTasks.length}</span>
                        {activeTab === "list" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("generator")}
                        className={`pb-3 flex items-center gap-2 transition-all relative whitespace-nowrap ${activeTab === "generator" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Sparkles size={18} /> AI Generator
                        {activeTab === "generator" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("templates")}
                        className={`pb-3 flex items-center gap-2 transition-all relative whitespace-nowrap ${activeTab === "templates" ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <BookTemplate size={18} /> SOP Library
                        <span className="bg-white/10 text-slate-300 text-[10px] px-1.5 rounded font-mono">{templates.length}</span>
                        {activeTab === "templates" && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                    </button>
                </div>
            </div>

            <main>
                {/* === TAB 1: LIST TUGAS === */}
                {activeTab === "list" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {myTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0A0F1E] rounded-3xl border border-dashed border-white/10 mx-4">
                                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                                    <LayoutList size={32} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Meja Kerja Bersih!</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mb-6 text-sm">Gunakan AI Generator untuk merancang misi dominasi hari ini.</p>
                                <button onClick={() => setActiveTab("generator")} className="text-white bg-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all">
                                    + Buat Rencana
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                                {myTasks.map((task) => {
                                    const isDone = task.subtasks.every(s => s.isCompleted) && task.subtasks.length > 0;
                                    const progress = Math.round((task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100) || 0;

                                    return (
                                        <div key={task.id} className={`group rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden ${isDone
                                                ? 'border-emerald-500/20 bg-emerald-900/10 opacity-60'
                                                : 'bg-[#0A0F1E] border-white/5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10'
                                            }`}>
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-800">
                                                <div className={`h-full transition-all duration-500 ${isDone ? 'bg-emerald-500' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} style={{ width: `${progress}%` }} />
                                            </div>

                                            <div className="p-5 pb-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{new Date(task.createdAt).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric' })}</span>
                                                    {isDone ? (
                                                        <div className="flex gap-2">
                                                            {/* TOMBOL SAVE TEMPLATE DENGAN MODAL BARU */}
                                                            <button onClick={() => handleSaveAsTemplateClick(task)} className="text-slate-400 hover:text-cyan-400 transition-colors p-1 bg-white/5 rounded-lg hover:bg-white/10" title="Simpan sebagai SOP">
                                                                <Save size={14} />
                                                            </button>
                                                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1"><CheckCircle2 size={10} /> SELESAI</span>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setFocusTask(task)} className="text-white bg-blue-600 hover:bg-blue-500 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all shadow-lg shadow-blue-600/20">
                                                            <Play size={10} fill="currentColor" /> FOKUS
                                                        </button>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold text-lg leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>{task.content}</h3>
                                            </div>

                                            <div className="px-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar pb-4">
                                                {task.subtasks.map((sub) => (
                                                    <label key={sub.id} className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group/item">
                                                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 flex-shrink-0">
                                                            <input type="checkbox" checked={sub.isCompleted} onChange={() => handleCheck(sub.id, sub.isCompleted)} className="peer appearance-none w-5 h-5 border border-slate-600 rounded bg-slate-800 checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer" />
                                                            <CheckCircle2 size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                                                        </div>
                                                        <span className={`text-sm font-medium leading-tight transition-all ${sub.isCompleted ? 'text-slate-500 line-through' : 'text-slate-300 group-hover/item:text-white'}`}>{sub.content}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* === TAB 2: AI GENERATOR === */}
                {activeTab === "generator" && (
                    <div className="flex flex-col items-center justify-start pt-6 md:pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 md:px-0">
                        <div className="text-center mb-8 max-w-xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest mb-4">
                                <Target size={12} /> Strategic Planning
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                                Urai <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Kompleksitas.</span>
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                Ubah visi besar menjadi langkah taktis. Biarkan AI merancang algoritma eksekusi Anda langkah demi langkah.
                            </p>
                        </div>

                        <div className="w-full max-w-2xl bg-[#0A0F1E] rounded-3xl shadow-2xl border border-white/5 relative overflow-hidden">
                            {status === 'thinking' && <div className="absolute inset-0 bg-blue-500/5 animate-pulse z-0"></div>}
                            <div className="p-4 md:p-6 relative z-10">
                                <form onSubmit={handleAtomize} className={`flex flex-col sm:flex-row gap-3 transition-all duration-300 ${status === 'thinking' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex-1 flex items-center gap-3 bg-[#1E293B] border border-white/10 rounded-2xl px-4 py-3 md:py-4 focus-within:border-cyan-500/50 focus-within:bg-[#1E293B]/80 transition-all">
                                        <div className="text-cyan-400 shrink-0">
                                            {status === 'thinking' ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                        </div>
                                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Misal: Rencana Launching Produk Baru..." className="flex-1 bg-transparent text-white outline-none font-medium placeholder:text-slate-500 text-sm md:text-base min-w-0" />
                                    </div>
                                    <button type="submit" disabled={!input.trim()} className="sm:w-auto w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                                        <span className="hidden sm:inline">Generate</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </form>

                                {status === 'review' && (
                                    <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Algoritma Langkah:</span>
                                            {!isAddingManual && <button onClick={() => setIsAddingManual(true)} className="text-xs text-cyan-400 font-bold hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-cyan-500/20"><Plus size={12} /> Tambah Manual</button>}
                                        </div>
                                        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                            {generatedSubtasks.map((task, idx) => (
                                                <div key={idx} className="flex gap-3 bg-[#1E293B]/50 p-3 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-colors items-start">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></div>
                                                    <span className="text-slate-300 text-sm font-medium flex-1 leading-relaxed">{task}</span>
                                                    <button onClick={() => { const n = [...generatedSubtasks]; n.splice(idx, 1); setGeneratedSubtasks(n); }} className="text-slate-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            {isAddingManual && (
                                                <form onSubmit={(e) => { e.preventDefault(); if (manualInput.trim()) { setGeneratedSubtasks([...generatedSubtasks, manualInput]); setManualInput(""); setIsAddingManual(false); } }} className="flex gap-2 animate-in fade-in">
                                                    <input ref={manualInputRef} value={manualInput} onChange={e => setManualInput(e.target.value)} className="flex-1 bg-[#1E293B] text-white text-sm border border-slate-600 rounded-xl px-3 py-2 outline-none focus:border-cyan-500" placeholder="Ketik langkah tambahan..." />
                                                    <button type="button" onClick={() => setIsAddingManual(false)} className="text-slate-500 hover:text-white p-2"><X size={16} /></button>
                                                </form>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button onClick={() => setStatus('idle')} className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Batalkan</button>
                                            <button onClick={handleSave} className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 active:scale-95"><Save size={18} /> Simpan ke Misi</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 3: SOP LIBRARY === */}
                {activeTab === "templates" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {templates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0A0F1E] rounded-3xl border border-dashed border-white/10 mx-4">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                                    <BookTemplate size={32} className="text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">SOP Library Kosong</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mb-6 text-sm">Simpan misi yang sukses sebagai SOP agar bisa digunakan ulang dengan sekali klik.</p>
                                <button onClick={() => setActiveTab("list")} className="text-white bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-xl font-bold border border-white/10 transition-all">
                                    Lihat Misi Saya
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
                                {templates.map((template) => (
                                    <div key={template.id} className="bg-[#0A0F1E] rounded-2xl border border-white/5 p-5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-900/10 transition-all group flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                                                <BookTemplate size={18} />
                                            </div>
                                            {/* TOMBOL DELETE TEMPLATE DENGAN MODAL */}
                                            <button onClick={() => handleDeleteTemplateClick(template.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-white text-lg mb-1 leading-snug">{template.name}</h3>
                                        <p className="text-slate-500 text-xs mb-4">
                                            {template.structure?.length || 0} Langkah • Tersimpan
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handleUseTemplate(template)}
                                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
                                            >
                                                <Repeat size={14} /> Terapkan SOP
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}