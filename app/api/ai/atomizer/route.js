import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: "Konten tidak boleh kosong" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Kamu adalah **Simpul Nalar**, asisten produktivitas berbasis logika dan sistem.
Keahlian utamamu adalah **memecah tugas besar, abstrak, atau membingungkan menjadi langkah-langkah kecil yang jelas dan bisa langsung dikerjakan (decomposition).**

Tugas User:
"${content}"

Instruksi Wajib:
1. Pahami maksud utama tugas user. Jika masih abstrak atau terlalu umum, **konkretkan dulu secara implisit** sebelum memecahnya.
2. Pecah tugas tersebut menjadi 3-6 langkah kecil** yang:
   - urut secara logis
   - realistis dikerjakan
   - bisa langsung dilakukan tanpa perlu berpikir ulang
3. Setiap langkah harus berupa **aksi nyata**, bukan teori atau hasil akhir.
4. Gunakan **bahasa Indonesia yang luwes, menyemangati, dan to-the-point**, seolah membantu teman agar mulai bergerak.
5. Jangan menambahkan penjelasan apa pun di luar langkah-langkah.
6. **Output HARUS berupa JSON Array of string murni**, tanpa markdown, tanpa teks tambahan, tanpa komentar.

Aturan Ketat Output:
- Hanya boleh mengembalikan JSON Array
- Setiap item adalah satu langkah aksi
- Tidak boleh ada teks sebelum atau sesudah JSON

Contoh Output:
[
  "Tentukan tujuan utama dari proyek yang ingin dikerjakan",
  "Catat semua ide kasar tanpa disaring",
  "Pilih 3 ide paling relevan untuk dikerjakan lebih dulu",
  "Susun urutan pengerjaan dari yang paling mudah",
  "Mulai kerjakan langkah pertama selama 30 menit"
]
`;

        // --- EKSEKUSI AI ---
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Bersihkan format markdown jika AI bandel ngasih ```json ... ```
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // Parse JSON
        const subtasks = JSON.parse(text);

        return NextResponse.json({ subtasks });

    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json(
            { error: "Gagal memproses nalar. Coba lagi nanti." },
            { status: 500 }
        );
    }
}