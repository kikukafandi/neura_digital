import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPortalPage() {
    // 1. Cek Login
    const session = await auth();
    if (!session) redirect("/login");

    // 2. CEK ROLE (HANYA ADMIN YANG BOLEH MASUK)
    if (session.user.role !== "admin") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
                <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-bold text-slate-800">Akses Ditolak</h2>
                <p className="text-gray-500 max-w-md mt-2">
                    Maaf {session.user.name}, area ini khusus untuk Administrator.
                    Silakan kembali ke dashboard member.
                </p>
                <a href="/dashboard" className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg">
                    Kembali ke Dashboard
                </a>
            </div>
        );
    }

    // 3. KONTEN ADMIN (Hanya muncul jika lolos cek di atas)
    return (
        <div className="min-h-screen bg-slate-100 p-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Portal Admin (X7Z)</h1>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-green-600 font-bold mb-4">✓ Akses Administrator Dikonfirmasi</p>
                <p>Selamat datang, Paduka <strong>{session.user.name}</strong>.</p>
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    Area ini aman. Anda bisa mulai mengelola produk atau user di sini.
                </div>
            </div>
        </div>
    );
}