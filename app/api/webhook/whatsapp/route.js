import { db } from "@/lib/db";
import { users, tasks, subtasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- MEMORY SEMENTARA (Sesi Chat) ---
const pendingSessions = new Map();

// --- HELPER: Kirim WA ---
async function replyWhatsApp(token, target, message) {
    if (!token || !target) return;
    const formData = new FormData();
    formData.append("target", target);
    formData.append("message", message);
    try {
        await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: { Authorization: token },
            body: formData,
        });
    } catch (e) { console.error("Gagal reply WA:", e); }
}

// --- HELPER: Normalisasi No HP ---
function normalizePhone(phone) {
    if (!phone) return "";
    phone = phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("08")) return "62" + phone.slice(1);
    if (phone.startsWith("62")) return phone;
    return phone;
}

// ==================================================================
// 1. METHOD GET
// ==================================================================
export async function GET(req) {
    return NextResponse.json({
        status: "active",
        message: "Simpul Nalar Super-Webhook is Ready!",
        timestamp: new Date().toISOString()
    }, { status: 200 });
}

// ==================================================================
// 2. METHOD POST
// ==================================================================
export async function POST(req) {
    try {
        const body = await req.json();
        const adminToken = process.env.FONNTE_ADMIN_TOKEN;

        // SKENARIO 1 & 2: DEVICE & STATUS (Abaikan)
        if (body.device && (body.status === "connect" || body.status === "disconnect")) {
            return NextResponse.json({ status: "device_status_recorded" });
        }
        if (body.status && !body.message) {
            return NextResponse.json({ status: "message_status_recorded" });
        }

        // SKENARIO 3: CHAT MASUK
        if (body.sender && body.message) {
            const sender = body.sender;
            const message = body.message;

            console.log(`💬 CHAT MASUK dari ${sender}: "${message}"`);

            // 1. Validasi User
            const userList = await db.select().from(users);
            const user = userList.find(u => normalizePhone(u.whatsappNumber) === sender);

            if (!user) {
                console.log("🚫 Sender tidak dikenal.");
                return NextResponse.json({ status: "ignored_unknown_user" });
            }

            const lowerMsg = message.toLowerCase().trim();

            // ---------------------------------------------------------
            // A. CEK SESI KONFIRMASI (OK/BATAL) - Prioritas Tertinggi
            // ---------------------------------------------------------
            if (pendingSessions.has(sender)) {
                const draft = pendingSessions.get(sender);

                if (["ok", "ya", "gas", "lanjut", "y", "siap"].includes(lowerMsg)) {
                    // Simpan Task
                    const [newTask] = await db.insert(tasks).values({
                        userId: user.id, content: draft.content, isCompleted: false
                    }).returning();

                    if (draft.checklist && draft.checklist.length > 0) {
                        const subData = draft.checklist.map(i => ({ taskId: newTask.id, content: i, isCompleted: false }));
                        await db.insert(subtasks).values(subData);
                    }

                    pendingSessions.delete(sender);
                    await replyWhatsApp(adminToken, sender, `💾 *Tersimpan!* Cek dashboard ya.`);
                    return NextResponse.json({ status: "Task Saved" });

                } else if (["batal", "cancel", "gak", "n", "hapus"].includes(lowerMsg)) {
                    pendingSessions.delete(sender);
                    await replyWhatsApp(adminToken, sender, "🗑️ Sip, dibatalkan.");
                    return NextResponse.json({ status: "Task Cancelled" });
                } else {
                    await replyWhatsApp(adminToken, sender, "🤖 Konfirmasi: Ketik *OK* untuk simpan, *Batal* untuk hapus.");
                    return NextResponse.json({ status: "Waiting Confirmation" });
                }
            }

            // ---------------------------------------------------------
            // B. COMMANDS KHUSUS (List)
            // ---------------------------------------------------------
            if (lowerMsg === "list" || lowerMsg === "!list") {
                const myTasks = await db.select().from(tasks).where(eq(tasks.userId, user.id)).limit(5);
                const list = myTasks.length ? myTasks.map(t => `• ${t.content}`).join("\n") : "Belum ada tugas.";
                await replyWhatsApp(adminToken, sender, `📋 *List Tugasmu:*\n${list}`);
                return NextResponse.json({ status: "List Sent" });
            }

            // ---------------------------------------------------------
            // C. FILTER SAPAAN / BASA-BASI (BARU DI SINI)
            // ---------------------------------------------------------
            const greetings = ["halo", "hai", "hi", "tes", "test", "p", "ping", "selamat pagi", "selamat siang", "selamat malam", "assalamualaikum", "woi", "min", "bot"];

            // Cek apakah pesan SAMA PERSIS dengan kata sapaan, atau pesan sangat pendek (< 3 huruf)
            if (greetings.includes(lowerMsg) || lowerMsg.length < 3) {
                const greetingReply = `
👋 *Halo Kak!*

Saya Sinalar.
Silakan ketik *Rencana/Tugas* yang mau dikerjakan, nanti saya bantu buatkan checklist-nya.

Contoh:
_"Belajar masak nasi goreng"_
_"Siapkan materi presentasi besok"_
                `.trim();

                await replyWhatsApp(adminToken, sender, greetingReply);
                return NextResponse.json({ status: "Greeting Sent" });
            }

            // ---------------------------------------------------------
            // D. AI ATOMIZER (Default Action)
            // ---------------------------------------------------------
            // await replyWhatsApp(adminToken, sender, "⏳"); // Opsional

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            try {
                // Prompt AI
                const result = await model.generateContent(`
                    Break down task "${message}" into 3-5 short subtasks (Indonesian).
                    Return JSON Array of strings only. No markdown.
                `);
                const text = result.response.text().replace(/```json|```/g, "").trim();
                const checklist = JSON.parse(text);

                // Simpan Sesi
                pendingSessions.set(sender, { content: message, checklist });

                // Preview ke User
                const confirmMsg = `
🤖 *Usulan Rencana:*
"${message}"

📋 *Langkah:*
${checklist.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Ketik *OK* atau *Batal*
                `.trim();
                await replyWhatsApp(adminToken, sender, confirmMsg);

            } catch (err) {
                console.error("AI Error:", err);
                await replyWhatsApp(adminToken, sender, "⚠️ Maaf, saya kurang paham kalimat itu. Coba kalimat tugas yang lebih jelas.");
            }

            return NextResponse.json({ status: "Message Processed" });
        }

        // Kalau payload tidak dikenali
        return NextResponse.json({ status: "unknown_event" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "server_error" }, { status: 500 });
    }
}