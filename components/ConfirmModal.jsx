"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, Loader2 } from "lucide-react";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = "primary", // 'primary' | 'danger'
    isLoading = false
}) {
    // Warna & Icon Berdasarkan Variant
    const isDanger = variant === "danger";
    const Icon = isDanger ? AlertTriangle : Info;
    const iconColor = isDanger ? "text-red-500" : "text-blue-500";
    const iconBg = isDanger ? "bg-red-500/10 border-red-500/20" : "bg-blue-500/10 border-blue-500/20";
    const btnColor = isDanger
        ? "bg-red-600 hover:bg-red-500 shadow-red-900/20"
        : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative w-full max-w-md bg-[#0A0F1E] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor} shrink-0`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${btnColor}`}
                            >
                                {isLoading && <Loader2 size={16} className="animate-spin" />}
                                {confirmText}
                            </button>
                        </div>

                        {/* Close Icon Absolute */}
                        {!isLoading && (
                            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}