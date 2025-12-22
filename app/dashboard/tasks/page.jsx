"use client";

import { useState, useEffect } from "react";
import { addTask, getTasks, toggleTask, deleteTask } from "@/app/actions";
import { Plus, CheckCircle2, Circle, Trash2, Loader2, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Fetch Tasks saat load
    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        const data = await getTasks();
        setTasks(data);
        setIsLoading(false);
    }

    async function handleAdd(formData) {
        setIsAdding(true);
        await addTask(formData);
        document.getElementById("taskForm").reset();
        await loadTasks(); // Refresh list
        setIsAdding(false);
        toast.success("Tugas ditambahkan ke sistem");
    }

    async function handleToggle(id, currentStatus) {
        // Optimistic Update (Biar terasa cepat di UI)
        setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
        await toggleTask(id, currentStatus);
    }

    async function handleDelete(id) {
        if (!confirm("Hapus tugas ini?")) return;
        setTasks(tasks.filter(t => t.id !== id));
        await deleteTask(id);
        toast("Tugas dihapus", { icon: "🗑️" });
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="text-yellow-500" fill="currentColor" /> The Atomizer
                </h1>
                <p className="text-slate-500 text-sm mt-1">Pecah masalah besar, selesaikan satu per satu.</p>
            </div>

            {/* Input Bar (Floating & Modern) */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 sticky top-24 z-30">
                <form id="taskForm" action={handleAdd} className="flex gap-2">
                    <input
                        name="content"
                        required
                        autoComplete="off"
                        placeholder="Apa yang harus diselesaikan hari ini?"
                        className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                    />
                    <button
                        disabled={isAdding}
                        className="bg-[#0A2540] text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-70 flex items-center gap-2"
                    >
                        {isAdding ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        <span className="hidden sm:inline">Tambah</span>
                    </button>
                </form>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 font-medium">Sistem bersih. Tidak ada tugas.</p>
                        <p className="text-xs text-slate-400">Mulai input tugasmu di atas.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group flex items-center justify-between p-4 bg-white rounded-xl border transition-all duration-300 ${task.isCompleted
                                    ? "border-slate-100 bg-slate-50/50 opacity-60"
                                    : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <button
                                    onClick={() => handleToggle(task.id, task.isCompleted)}
                                    className={`transition-colors ${task.isCompleted ? "text-green-500" : "text-slate-300 hover:text-blue-500"}`}
                                >
                                    {task.isCompleted ? <CheckCircle2 size={24} fill="#dcfce7" /> : <Circle size={24} />}
                                </button>
                                <span className={`font-medium ${task.isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                    {task.content}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}