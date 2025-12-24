"use server";

import { db } from "@/lib/db";
import { tasks, subtasks } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, asc, desc, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { pushTaskToNotion } from "@/lib/notion";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { getIntegrationSettings } from "./settings";

export async function addTask(formData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const content = formData.get("content");
    if (!content) return;

    await db.insert(tasks).values({
        userId: session.user.id,
        content: content
    });
    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function toggleTask(taskId, currentState) {
    const session = await auth();
    if (!session) return;

    const newState = !currentState;

    // 1. Update DB
    const [updatedTask] = await db.update(tasks)
        .set({ isCompleted: newState })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
        .returning(); // Ambil data task yang baru diupdate

    // 2. TRIGGER AUTOMATION (Jika task jadi SELESAI)
    if (newState === true && updatedTask) {
        // Fire and Forget (jalan di background)
        checkAndExecuteAutomations("TASK_COMPLETED", { taskName: updatedTask.content });
    }

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function deleteTask(taskId) {
    const session = await auth();
    if (!session) return;

    await db.delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)));

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
}

export async function getTasks() {
    const session = await auth();
    if (!session) return [];

    return await db.select().from(tasks)
        .where(eq(tasks.userId, session.user.id))
        .orderBy(desc(tasks.createdAt));
}

export async function getSubtasks(taskId) {
    const session = await auth();
    if (!session) return [];

    return await db.select().from(subtasks)
        .where(eq(subtasks.taskId, taskId))
        .orderBy(asc(subtasks.createdAt));
}

export async function addSubtask(taskId, content) {
    const session = await auth();
    if (!session || !content) return;

    await db.insert(subtasks).values({
        taskId: taskId,
        content: content
    });
    revalidatePath("/dashboard/tasks");
}

export async function deleteSubtask(subtaskId) {
    const session = await auth();
    if (!session) return;

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
    revalidatePath("/dashboard/tasks");
}

export async function toggleSubtask(subtaskId, currentStatus) {
    await db.update(subtasks)
        .set({ isCompleted: !currentStatus })
        .where(eq(subtasks.id, subtaskId));
    revalidatePath("/dashboard/tasks");
}

export async function getUserTasks() {
    const session = await auth();
    if (!session?.user) return [];

    const userTasks = await db.select().from(tasks)
        .where(eq(tasks.userId, session.user.id))
        .orderBy(desc(tasks.createdAt));

    if (userTasks.length === 0) return [];

    const taskIds = userTasks.map(t => t.id);
    const userSubtasks = await db.select().from(subtasks)
        .where(inArray(subtasks.taskId, taskIds))
        .orderBy(asc(subtasks.createdAt));

    const combinedData = userTasks.map(task => ({
        ...task,
        subtasks: userSubtasks.filter(sub => sub.taskId === task.id)
    }));

    return combinedData;
}

export async function saveAtomizedTask(parentTaskContent, subtaskList) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        // 1. Simpan ke DB Lokal
        const [newTask] = await db.insert(tasks).values({
            userId: session.user.id,
            content: parentTaskContent,
            isCompleted: false,
        }).returning();

        if (subtaskList.length > 0) {
            const subtaskData = subtaskList.map((item) => ({
                taskId: newTask.id, content: item, isCompleted: false,
            }));
            await db.insert(subtasks).values(subtaskData);
        }

        // 2. Ambil Settings Integrasi User
        const userSettings = await getIntegrationSettings();
        const adminToken = process.env.FONNTE_ADMIN_TOKEN;

        // LOGIKA KIRIM WA
        if (adminToken && userSettings?.whatsappNumber) {
            const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000/";

            const message = `
🚀 *Misi Baru Terdeteksi!*
"${parentTaskContent}"

📋 *Langkah-langkah:*
${subtaskList.map((sub, i) => `${i + 1}. ${sub}`).join("\n")}

👇 *Kerjakan & Centang di sini:*
${appUrl}/dashboard/tasks

_Semangat Produktif!_ 🔥
~ Simpul Nalar AI
            `.trim();

            sendWhatsAppMessage(adminToken, userSettings.whatsappNumber, message);
        }

        // 3. LOGIKA NOTION SYNC
        if (userSettings?.notionApiKey && userSettings?.notionDbId) {
            try {
                const notionPageId = await pushTaskToNotion(
                    userSettings.notionApiKey, userSettings.notionDbId, parentTaskContent, subtaskList
                );
                if (notionPageId) {
                    await db.update(tasks).set({ isSynced: true, notionPageId: notionPageId }).where(eq(tasks.id, newTask.id));
                }
            } catch (e) { console.error("Notion Error:", e); }
        }

        revalidatePath("/dashboard/tasks");
        return { success: true, taskId: newTask.id };

    } catch (error) {
        console.error("Save Task Error:", error);
        return { error: "Gagal menyimpan tugas." };
    }
}