"use client";

import { useState, useEffect } from "react";
import {
    addTask, getTasks, toggleTask, deleteTask,
    getSubtasks, addSubtask, toggleSubtask, deleteSubtask
} from "@/app/actions";
import {
    Plus, CheckCircle2, Circle, Trash2, Loader2, Zap,
    AlertTriangle, X, ChevronRight, LayoutList, GripVertical
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // State Modal Delete Task
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // STATE ATOMIZER (Drawer)
    const [activeTask, setActiveTask] = useState(null); // Tugas yang sedang dibuka detailnya
    const [subtasks, setSubtasks] = useState([]);
    const [isLoadingSub, setIsLoadingSub] = useState(false);

    // Initial Load
    useEffect(() => {
        loadTasks();
    }, []);

    // Load Subtasks ketika activeTask berubah
    useEffect(() => {
        if (activeTask) {
            loadSubtasks(activeTask.id);
        } else {
            setSubtasks([]);
        }
    }, [activeTask]);

    async function loadTasks() {
        const data = await getTasks();
        setTasks(data);
        setIsLoading(false);
    }

    async function loadSubtasks(taskId) {
        setIsLoadingSub(true);
        const data = await getSubtasks(taskId);
        setSubtasks(data);
        setIsLoadingSub(false);
    }

    // --- HANDLERS MAIN TASKS ---
    async function handleAdd(formData) {
        setIsAdding(true);
        await addTask(formData);
        document.getElementById("taskForm").reset();
        await loadTasks();
        setIsAdding(false);
        toast.success("Tugas induk dibuat");
    }

    async function handleToggle(id, currentStatus) {
        setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
        await toggleTask(id, currentStatus);
    }

    async function confirmDelete() {
        if (!taskToDelete) return;
        setIsDeleting(true);
        const previousTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== taskToDelete));
        try {
            await deleteTask(taskToDelete);
            toast.success("Tugas dimusnahkan");
            if (activeTask?.id === taskToDelete) setActiveTask(null); // Tutup drawer jika task yg dibuka dihapus
        } catch (error) {
            setTasks(previousTasks);
            toast.error("Gagal hapus");
        } finally {
            setIsDeleting(false);
            setTaskToDelete(null);
        }
    }

    // --- HANDLERS SUBTASKS ---
    async function handleAddSubtask(formData) {
        if (!activeTask) return;
        const content = formData.get("content");
        if (!content) return;

        // Optimistic UI
        const tempId = Math.random().toString();
        const newSub = { id: tempId, content, isCompleted: false, taskId: activeTask.id };
        setSubtasks([...subtasks, newSub]);

        await addSubtask(activeTask.id, content);
        document.getElementById("subtaskForm").reset();
        await loadSubtasks(activeTask.id); // Refresh ID asli dari server
    }

    async function handleToggleSub(id, currentStatus) {
        setSubtasks(subtasks.map(s => s.id === id ? { ...s, isCompleted: !currentStatus } : s));
        await toggleSubtask(id, currentStatus);
    }

    async function handleDeleteSub(id) {
        setSubtasks(subtasks.filter(s => s.id !== id));
        await deleteSubtask(id);
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 relative min-h-screen">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-yellow-500" /> The Atomizer
                </h1>
                <p className="text-slate-500 text-sm mt-1">Pecah masalah besar menjadi langkah-langkah logis (Atomic Steps).</p>
            </div>

            {/* Input Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 sticky top-4 z-20 mb-6 animate-in zoom-in-95 duration-300">
                <form id="taskForm" action={handleAdd} className="flex gap-2">
                    <input
                        name="content"
                        required
                        autoComplete="off"
                        placeholder="Tulis gol besar Anda di sini..."
                        className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                    />
                    <button
                        disabled={isAdding}
                        className="bg-[#0A2540] text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-blue-900/10"
                    >
                        {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        <span className="hidden sm:inline">Target</span>
                    </button>
                </form>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                            <LayoutList size={24} />
                        </div>
                        <p className="text-slate-600 font-bold">Workspace Kosong</p>
                        <p className="text-xs text-slate-400 mt-1">Definisikan target pertama Anda.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={(e) => {
                                // Jangan buka drawer kalau user klik tombol check/delete
                                if (!e.target.closest('button')) setActiveTask(task);
                            }}
                            className={`group relative overflow-hidden flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-300 cursor-pointer ${task.isCompleted
                                    ? "border-slate-100 bg-slate-50/50 opacity-60"
                                    : activeTask?.id === task.id
                                        ? "border-blue-500 shadow-md ring-1 ring-blue-500 bg-blue-50/30"
                                        : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button onClick={() => handleToggle(task.id, task.isCompleted)} className={`z-10 transition-all duration-300 transform active:scale-90 ${task.isCompleted ? "text-green-500" : "text-slate-300 hover:text-blue-500"}`}>
                                    {task.isCompleted ? <CheckCircle2 size={26} fill="#dcfce7" /> : <Circle size={26} />}
                                </button>

                                <div className="flex-1">
                                    <span className={`font-medium text-base block ${task.isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                        {task.content}
                                    </span>
                                    {/* Indikator "Klik untuk detail" */}
                                    {!task.isCompleted && (
                                        <p className="text-[10px] text-blue-500 font-medium mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            Klik untuk memecah tugas <ChevronRight size={10} />
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setTaskToDelete(task.id)}
                                className="z-10 text-slate-300 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* Active Indicator Bar */}
                            {activeTask?.id === task.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl"></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* --- ATOMIZER DRAWER (PANEL SAMPING) --- */}
            {/* Backdrop Gelap untuk Mobile */}
            <div
                className={`fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 lg:hidden ${activeTask ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setActiveTask(null)}
            ></div>

            {/* Panel Content */}
            <div className={`fixed inset-y-0 right-0 z-40 w-full lg:w-[450px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-100 ${activeTask ? "translate-x-0" : "translate-x-full"}`}>
                {activeTask && (
                    <div className="h-full flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Atomizer Mode</h3>
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">{activeTask.content}</h2>
                            </div>
                            <button onClick={() => setActiveTask(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
                            <div className="space-y-6">
                                {/* Input Subtask */}
                                <form id="subtaskForm" action={handleAddSubtask} className="flex gap-2">
                                    <input
                                        name="content"
                                        required
                                        autoComplete="off"
                                        placeholder="Tambah langkah kecil..."
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm shadow-sm"
                                    />
                                    <button className="bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-xl transition shadow-sm">
                                        <Plus size={20} />
                                    </button>
                                </form>

                                {/* Subtask List */}
                                <div className="space-y-2">
                                    {isLoadingSub ? (
                                        <div className="py-4 text-center"><Loader2 className="animate-spin inline text-slate-300" /></div>
                                    ) : subtasks.length === 0 ? (
                                        <div className="text-center py-8 opacity-50">
                                            <p className="text-sm text-slate-500">Belum ada langkah kecil.</p>
                                        </div>
                                    ) : (
                                        subtasks.map((sub) => (
                                            <div key={sub.id} className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all">
                                                <GripVertical size={16} className="text-slate-200 cursor-move" />
                                                <button
                                                    onClick={() => handleToggleSub(sub.id, sub.isCompleted)}
                                                    className={`transition-colors ${sub.isCompleted ? "text-blue-500" : "text-slate-300 hover:text-blue-500"}`}
                                                >
                                                    {sub.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                                <span className={`flex-1 text-sm ${sub.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                                    {sub.content}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteSub(sub.id)}
                                                    className="text-slate-200 hover:text-red-500 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer (Progress) */}
                        <div className="p-4 border-t border-slate-100 bg-white">
                            <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold">
                                <span>Progress Logika</span>
                                <span>
                                    {subtasks.length > 0
                                        ? Math.round((subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-500"
                                    style={{ width: `${subtasks.length > 0 ? (subtasks.filter(s => s.isCompleted).length / subtasks.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DELETE MODAL (Tetap Ada) */}
            {taskToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setTaskToDelete(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={24} /></div>
                            <h3 className="text-lg font-bold text-slate-900">Hapus Tugas Ini?</h3>
                            <p className="text-sm text-slate-500 mt-2 mb-6">Sub-tugas di dalamnya juga akan ikut terhapus.</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setTaskToDelete(null)} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-sm">Batal</button>
                                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition text-sm flex items-center justify-center gap-2">{isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Hapus"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}