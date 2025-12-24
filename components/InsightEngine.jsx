"use client";

import { useState } from "react";
import { generateInsightAnalysis } from "@/app/actions";
import { 
    BrainCircuit, AlertTriangle, TrendingUp, 
    Zap, Loader2, RefreshCw, BarChart3 
} from "lucide-react";
import { motion } from "framer-motion";

export default function InsightEngine() {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function runAnalysis() {
        setLoading(true);
        setError("");
        const res = await generateInsightAnalysis();
        
        if (res?.error) {
            setError(res.error);
        } else {
            setInsight(res.data);
        }
        setLoading(false);
    }

    return (
        <div className="bg-[#0A0F1E] border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="text-cyan-400" /> The Insight Engine
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">AI Pattern Recognition & Predictive Analysis</p>
                </div>
                
                <button 
                    onClick={runAnalysis} 
                    disabled={loading}
                    className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-all border border-white/5 hover:border-cyan-500/30 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
            </div>

            {/* ERROR STATE */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-4">
                    {error}
                </div>
            )}

            {/* EMPTY STATE */}
            {!insight && !loading && !error && (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                    <BarChart3 className="mx-auto text-slate-600 mb-3" size={32}/>
                    <p className="text-slate-500 text-sm">Klik refresh untuk menganalisis pola kerja Anda.</p>
                </div>
            )}

            {/* LOADING STATE */}
            {loading && (
                <div className="space-y-4 animate-pulse">
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                    <div className="h-20 bg-white/5 rounded-xl"></div>
                </div>
            )}

            {/* RESULT STATE */}
            {insight && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 relative z-10"
                >
                    {/* SCORE CARD */}
                    <div className="flex items-center gap-4 bg-[#1E293B]/50 p-4 rounded-xl border border-white/5">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path className="text-cyan-500 transition-all duration-1000 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" strokeDasharray={`${insight.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                            <span className="absolute text-lg font-bold text-white">{insight.score}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">Productivity Score</h4>
                            <p className="text-xs text-slate-400">Berdasarkan rasio penyelesaian & konsistensi.</p>
                        </div>
                    </div>

                    {/* INEFFICIENCY (Negative Pattern) */}
                    <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Pola Inefisiensi Terdeteksi</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">"{insight.inefficiency}"</p>
                            </div>
                        </div>
                    </div>

                    {/* STRENGTH (Positive Pattern) */}
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Kekuatan Utama</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">"{insight.strength}"</p>
                            </div>
                        </div>
                    </div>

                    {/* PREDICTION (Actionable) */}
                    <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex items-start gap-3">
                            <Zap className="text-blue-400 shrink-0 mt-0.5 fill-blue-400/20" size={18} />
                            <div>
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Rekomendasi AI</h4>
                                <p className="text-sm text-white font-medium leading-relaxed">{insight.prediction}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}