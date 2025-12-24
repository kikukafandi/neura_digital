"use server";

import { db } from "@/lib/db";
import { automations, tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getIntegrationSettings } from "./settings";
// Pastikan import pushTaskToNotion jika ada di lib/notion

// 1. SAVE CANVAS (UPSERT)
export async function saveAutomation(id, name, flowData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        if (id) {
            // UPDATE EXISTING
            await db.update(automations)
                .set({
                    name: name || "Untitled Flow",
                    flowData: flowData,
                    isActive: true
                })
                .where(and(
                    eq(automations.id, id),
                    eq(automations.userId, session.user.id)
                ));
        } else {
            // CREATE NEW
            await db.insert(automations).values({
                userId: session.user.id,
                name: name || "Untitled Flow",
                flowData: flowData,
                isActive: true
            });
        }

        revalidatePath("/dashboard/automation");
        return { success: "Neural Circuit Saved." };
    } catch (e) {
        console.error(e);
        return { error: "Gagal menyimpan sirkuit." };
    }
}

// 2. GET FLOWS
export async function getAutomations() {
    const session = await auth();
    if (!session) return [];
    return await db
        .select()
        .from(automations)
        .where(eq(automations.userId, session.user.id));
}

// 3. DELETE
export async function deleteAutomation(id) {
    const session = await auth();
    if (!session) return;

    await db.delete(automations).where(and(
        eq(automations.id, id),
        eq(automations.userId, session.user.id)
    ));

    revalidatePath("/dashboard/automation");
}

// 4. THE ENGINE (Jantung Otomatisasi)
export async function executeAutomationTrigger(triggerEvent, payload) {
    const session = await auth();
    if (!session) return;

    // 1. Ambil semua automasi aktif
    const flows = await db.select().from(automations).where(and(
        eq(automations.userId, session.user.id),
        eq(automations.isActive, true)
    ));

    for (const flow of flows) {
        const { nodes, edges } = flow.flowData;

        // 2. Cari Node TRIGGER yang cocok EVENT-nya
        const triggerNode = nodes.find(n => n.type === 'TRIGGER' && n.data.event === triggerEvent);

        if (triggerNode) {
            // --- LOGIKA FILTER TUGAS SPESIFIK ---
            // Jika di config node ada 'specificTaskId', kita cek apakah cocok dengan payload
            if (triggerNode.data.specificTaskId && triggerNode.data.specificTaskId !== "ALL") {
                if (triggerNode.data.specificTaskId !== payload.taskId) {
                    continue; // SKIP jika ID tugas tidak cocok
                }
            }

            // Jika cocok (atau settingnya ALL), jalankan aksinya
            const connectedEdges = edges.filter(e => e.source === triggerNode.id);
            for (const edge of connectedEdges) {
                const actionNode = nodes.find(n => n.id === edge.target);
                if (actionNode) await runActionNode(actionNode, payload);
            }
        }
    }
}

async function runActionNode(node, payload) {
    const config = node.data;
    const settings = await getIntegrationSettings();

    try {
        if (config.action === "SEND_WA" && settings?.whatsappNumber) {
            const msg = config.message.replace("{task}", payload.taskName || "Unknown");
            await sendWhatsAppMessage(process.env.FONNTE_ADMIN_TOKEN, settings.whatsappNumber, msg);
        }
        if (config.action === "SEND_EMAIL") {
            // Mock Email
            console.log(`[EMAIL SENT] To: User | Subj: ${config.subject}`);
        }
        if (config.action === "CREATE_TASK") {
            // Logic create task recursive bisa ditambahkan di sini
            console.log("Create Task Triggered");
        }
    } catch (e) {
        console.error("Execution Failed:", e);
    }
}

