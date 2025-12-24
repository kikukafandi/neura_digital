"use server";

import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateInsightAnalysis() {
    try {
        const session = await auth();
        if (!session) return { error: "Unauthorized" };

        const history = await db.select().from(tasks)
            .where(eq(tasks.userId, session.user.id))
            .orderBy(desc(tasks.createdAt))
            .limit(50);

        if (history.length < 5) {
            return { error: "Data belum cukup untuk analisis (min. 5 tugas)." };
        }

        const taskData = history.map(t => ({
            task: t.content,
            status: t.isCompleted ? "Selesai" : "Pending",
            date: new Date(t.createdAt).toLocaleDateString('id-ID'),
        }));

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Bertindaklah sebagai "The Insight Engine", analis produktivitas pribadi yang tajam.
            
            Analisis data riwayat tugas berikut ini:
            ${JSON.stringify(taskData)}

            Tugasmu:
            1. Cari pola negatif (Inefficiency): Apa kebiasaan buruk user? (Misal: Sering menunda jenis tugas tertentu).
            2. Cari pola positif (Strength): Apa kekuatan user? (Misal: Konsisten di tugas teknis).
            3. Berikan 1 Prediksi & Saran Konkret untuk perbaikan.
            4. Berikan Skor Produktivitas (0-100) berdasarkan rasio penyelesaian tugas.

            Output wajib format JSON persis seperti ini (Bahasa Indonesia):
            {
                "inefficiency": "Kalimat singkat tajam tentang pola negatif",
                "strength": "Kalimat singkat tajam tentang pola positif",
                "prediction": "Saran aksi konkret untuk perbaikan",
                "score": 85
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const insight = JSON.parse(responseText);

        return { success: true, data: insight };

    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return { error: "Gagal menganalisis pola nalar." };
    }
}