"use client";

import { useState, useEffect, useRef } from "react";
import {
    Sparkles, ArrowRight, CheckCircle2, Loader2, Plus, Trash2,
    BrainCircuit, Save, LayoutList, X, Play, Timer, Trophy, Flame
} from "lucide-react";
import { saveAtomizedTask, getUserTasks, toggleSubtask } from "@/app/actions";

// --- KOMPONEN KECIL: FOCUS TIMER (INOVASI) ---
function FocusTimer({ task, onClose, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 Menit (Pomodoro)
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete(); // Auto complete saat waktu habis
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A2540]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="text-center text-white max-w-md w-full p-6">
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
                        Focus Mode
                    </span>
                    <h2 className="text-2xl font-bold leading-relaxed">{task?.content || "Fokus Mengerjakan Tugas"}</h2>
                </div>

                {/* TIMER DISPLAY */}
                <div className="text-8xl font-mono font-bold tracking-tighter mb-8 tabular-nums">
                    {formatTime(timeLeft)}
                </div>

                {/* CONTROLS */}
                <div className="flex justify-center gap-4 mb-10">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'}`}
                    >
                        {isActive ? <span className="font-bold text-xs">PAUSE</span> : <Play fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white/70 hover:text-white"
                    >
                        <X />
                    </button>
                </div>

                <p className="text-white/40 text-sm">Jangan keluar sebelum timer habis. <br />Kalahkan kemalasanmu!</p>
            </div>
        </div>
    );
}

// --- HALAMAN UTAMA ---
export default function TasksPage() {
    const [activeTab, setActiveTab] = useState("list"); // Default ke list biar langsung action
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle");
    const [generatedSubtasks, setGeneratedSubtasks] = useState([]);
    const [myTasks, setMyTasks] = useState([]);

    // UI States
    const [isAddingManual, setIsAddingManual] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const manualInputRef = useRef(null);

    // Focus Mode State
    const [focusTask, setFocusTask] = useState(null); // Task yang sedang dikerjakan
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => { loadTasks(); }, []);
    useEffect(() => { if (isAddingManual && manualInputRef.current) manualInputRef.current.focus(); }, [isAddingManual]);

    async function loadTasks() {
        const data = await getUserTasks();
        setMyTasks(data);
    }

    // --- GAMIFIKASI LOGIC ---
    // Hitung progress harian sederhana
    const totalSubtasks = myTasks.reduce((acc, t) => acc + t.subtasks.length, 0);
    const completedSubtasks = myTasks.reduce((acc, t) => acc + t.subtasks.filter(s => s.isCompleted).length, 0);
    const progressPercentage = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
    const dailyLevel = Math.floor(completedSubtasks / 5) + 1; // Naik level tiap 5 tugas selesai

    // --- HANDLERS ---
    const handleAtomize = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setStatus("thinking");
        try {
            const res = await fetch("/api/ai/atomizer", { method: "POST", body: JSON.stringify({ content: input }) });
            const data = await res.json();
            setGeneratedSubtasks(data.subtasks);
            setStatus("review");
        } catch (error) { setStatus("idle"); alert("Gagal koneksi AI."); }
    };

    const handleSave = async () => {
        setStatus("saving");
        const res = await saveAtomizedTask(input, generatedSubtasks);
        if (res.success) {
            setStatus("success");
            await loadTasks();
            setTimeout(() => { setInput(""); setGeneratedSubtasks([]); setStatus("idle"); setActiveTab("list"); }, 1000);
        } else { alert("Gagal menyimpan."); setStatus("review"); }
    };

    const handleCheck = async (subtaskId, currentStatus) => {
        // Optimistic Update
        setMyTasks(prev => prev.map(t => ({
            ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, isCompleted: !currentStatus } : s)
        })));

        if (!currentStatus) triggerConfetti(); // Efek kalau centang selesai
        await toggleSubtask(subtaskId, currentStatus);
    };

    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
    };

    // --- RENDER ---
    return (
        <div className="relative min-h-screen pb-20">

            {/* FOCUS TIMER OVERLAY */}
            {focusTask && (
                <FocusTimer
                    task={focusTask}
                    onClose={() => setFocusTask(null)}
                    onComplete={() => {
                        setFocusTask(null);
                        triggerConfetti();
                        // Opsional: Tandai tugas selesai otomatis di sini
                    }}
                />
            )}

            {/* CONFETTI EFFECT (CSS Only for lightweight) */}
            {showConfetti && (
                <div className="fixed inset-0 z-[60] pointer-events-none flex justify-center items-start pt-20">
                    <div className="text-6xl animate-bounce">🎉</div>
                </div>
            )}

            {/* --- HEADER: STATS BAR (GAMIFIKASI) --- */}
            <div className="sticky top-0 z-30 bg-[#F3F4F6]/80 backdrop-blur-md pt-4 pb-2 px-4 mb-6 border-b border-slate-200/50">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <BrainCircuit className="text-blue-600" /> Command Center
                        </h1>
                        <p className="text-slate-500 text-xs font-medium">Atur chaos, eksekusi fokus.</p>
                    </div>

                    {/* XP WIDGET */}
                    <div className="bg-white p-2 pr-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-amber-400 to-orange-500 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <Trophy size={18} fill="currentColor" />
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 mb-1">
                                <span>Level {dailyLevel}</span>
                                <span>{progressPercentage}% Harian</span>
                            </div>
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS (Menempel di Header) */}
                <div className="max-w-5xl mx-auto mt-6 flex gap-6 border-b border-slate-200 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab("list")}
                        className={`pb-3 flex items-center gap-2 transition-all ${activeTab === "list" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <LayoutList size={18} /> Misi Saya
                        <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 rounded-full">{myTasks.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("generator")}
                        className={`pb-3 flex items-center gap-2 transition-all ${activeTab === "generator" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <Sparkles size={18} /> AI Generator
                    </button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4">

                {/* === TAB 1: LIST TUGAS (FOCUS MODE) === */}
                {activeTab === "list" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {myTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                    <LayoutList size={32} className="text-blue-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Meja Kerja Bersih!</h3>
                                <p className="text-slate-400 max-w-xs mx-auto mb-6 text-sm">Belum ada misi. Gunakan AI Generator untuk merencanakan hari ini.</p>
                                <button onClick={() => setActiveTab("generator")} className="text-white bg-blue-600 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                    + Buat Rencana
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myTasks.map((task) => {
                                    const isDone = task.subtasks.every(s => s.isCompleted) && task.subtasks.length > 0;
                                    const progress = Math.round((task.subtasks.filter(s => s.isCompleted).length / task.subtasks.length) * 100) || 0;

                                    return (
                                        <div key={task.id} className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col h-full relative overflow-hidden ${isDone ? 'border-emerald-100 bg-emerald-50/20 opacity-75' : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1'}`}>

                                            {/* Progress Bar Top */}
                                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                                            </div>

                                            {/* Header */}
                                            <div className="p-5 pb-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(task.createdAt).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric' })}</span>
                                                    {isDone ? (
                                                        <span className="text-emerald-600 bg-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle2 size={10} /> SELESAI</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setFocusTask(task)}
                                                            className="text-white bg-slate-900 hover:bg-blue-600 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-colors shadow-lg shadow-slate-900/10"
                                                        >
                                                            <Play size={10} fill="currentColor" /> FOKUS
                                                        </button>
                                                    )}
                                                </div>
                                                <h3 className={`font-bold text-slate-800 text-lg leading-snug ${isDone && 'line-through text-slate-400'}`}>{task.content}</h3>
                                            </div>

                                            {/* Checklist Scrollable */}
                                            <div className="px-3 flex-1 overflow-y-auto max-h-[250px] custom-scrollbar pb-4">
                                                {task.subtasks.map((sub) => (
                                                    <label key={sub.id} className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors group/item">
                                                        <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 flex-shrink-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={sub.isCompleted}
                                                                onChange={() => handleCheck(sub.id, sub.isCompleted)}
                                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                                                            />
                                                            <CheckCircle2 size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" />
                                                        </div>
                                                        <span className={`text-sm font-medium leading-tight transition-all ${sub.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-600 group-hover/item:text-slate-900'}`}>
                                                            {sub.content}
                                                        </span>
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
                    <div className="flex flex-col items-center justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8 max-w-lg">
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
                                Pecah <span className="text-blue-600">Masalah Besar.</span>
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Tulis targetmu, biarkan AI yang membuatkan checklist agar kamu tidak pusing.
                            </p>
                        </div>

                        {/* Input Form */}
                        <div className="w-full max-w-xl bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-200">
                            <form
                                onSubmit={handleAtomize}
                                className={`flex items-center gap-3 p-2 transition-all duration-300 ${status === 'thinking' ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                                    {status === 'thinking' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Contoh: Bikin Laporan Keuangan..."
                                    className="flex-1 bg-transparent text-lg text-slate-700 outline-none font-medium placeholder:text-slate-300"
                                />
                                <button type="submit" disabled={!input.trim()} className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all">
                                    <ArrowRight />
                                </button>
                            </form>

                            {/* REVIEW AREA */}
                            {status === 'review' && (
                                <div className="mt-4 pt-4 border-t border-slate-100 px-2 pb-2 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Saran Langkah:</span>
                                        {!isAddingManual && (
                                            <button onClick={() => setIsAddingManual(true)} className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                                <Plus size={12} /> Tambah
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                                        {generatedSubtasks.map((task, idx) => (
                                            <div key={idx} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 group hover:border-blue-200">
                                                <span className="text-slate-700 text-sm font-medium flex-1">{task}</span>
                                                <button onClick={() => {
                                                    const n = [...generatedSubtasks]; n.splice(idx, 1); setGeneratedSubtasks(n);
                                                }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                        {isAddingManual && (
                                            <form onSubmit={(e) => {
                                                e.preventDefault(); if (manualInput.trim()) { setGeneratedSubtasks([...generatedSubtasks, manualInput]); setManualInput(""); setIsAddingManual(false); }
                                            }} className="flex gap-2">
                                                <input ref={manualInputRef} value={manualInput} onChange={e => setManualInput(e.target.value)} className="flex-1 text-sm border rounded px-2 py-1 outline-blue-500" placeholder="Ketik..." />
                                                <button type="button" onClick={() => setIsAddingManual(false)} className="text-slate-400"><X size={14} /></button>
                                            </form>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => setStatus('idle')} className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg">Batal</button>
                                        <button onClick={handleSave} className="flex-[2] py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
                                            <Save size={16} className="inline mr-2" /> Simpan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}