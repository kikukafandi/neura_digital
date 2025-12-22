// app/api/ai/atomizer/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
    // Simulasi delay biar terasa mikir (2 detik)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { content } = await req.json();

    // Di sini nanti logika OpenAI/Gemini dipasang.
    // Sekarang kita pakai logika dummy dulu biar UI jalan.

    let subtasks = [];

    if (content.toLowerCase().includes("skripsi")) {
        subtasks = [
            "Cari 5 jurnal referensi utama (Q1/Q2)",
            "Tentukan rumusan masalah yang spesifik",
            "Buat kerangka Bab 1 (Latar Belakang)",
            "Konsultasi judul ke Dosen Wali"
        ];
    } else if (content.toLowerCase().includes("web") || content.toLowerCase().includes("coding")) {
        subtasks = [
            "Setup repository & environment (Next.js)",
            "Desain database schema & relasi",
            "Buat UI Mockup halaman utama",
            "Implementasi autentikasi user"
        ];
    } else {
        // Default response
        subtasks = [
            `Riset awal tentang ${content}`,
            "Buat breakdown timeline pengerjaan",
            "Siapkan aset/bahan yang diperlukan",
            "Eksekusi tahap pertama (Drafting)"
        ];
    }

    return NextResponse.json({ subtasks });
}