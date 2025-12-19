"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function DebugPage() {
    const [status, setStatus] = useState("Sedang memeriksa koneksi...");
    const [details, setDetails] = useState("");
    const [color, setColor] = useState("text-gray-600");

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const supabase = createClient();

                // 1. Cek apakah URL & Key terbaca
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
                    throw new Error("URL Supabase tidak ditemukan di .env.local");
                }

                // 2. Coba request ringan ke Auth (Cek Session)
                // Ini tidak butuh tabel khusus, jadi aman untuk tes awal
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                // Jika sampai sini, berarti request berhasil sampai ke server Supabase
                setStatus("✅ BERHASIL: Terkoneksi ke Supabase!");
                setDetails(`URL Project: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\nStatus Sesi: ${data.session ? "User Login" : "Tamu (Belum Login)"}`);
                setColor("text-green-600");

            } catch (err) {
                setStatus("❌ GAGAL: Tidak bisa terkoneksi.");
                setDetails(err.message);
                setColor("text-red-600");
                console.error("Supabase Error:", err);
            }
        };

        checkConnection();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-gray-200">
                <h1 className="text-xl font-bold text-slate-900 mb-4">Status Koneksi Supabase</h1>

                <div className={`p-4 rounded-lg bg-gray-50 border border-gray-100`}>
                    <p className={`font-bold text-lg ${color} mb-2`}>{status}</p>
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap break-all bg-white p-2 rounded border border-gray-200">
                        {details}
                    </pre>
                </div>

                <div className="mt-6 text-sm text-gray-400">
                    Cek console browser (F12) untuk detail error jika ada.
                </div>
            </div>
        </div>
    );
}