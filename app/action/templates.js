"use server";

import { db } from "@/lib/db";
import { templates, tasks, subtasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveTaskAsTemplate(taskId, templateName) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));
        const structure = taskSubtasks.map(s => s.content);

        if (structure.length === 0) {
            return { error: "Tugas ini tidak memiliki langkah untuk dijadikan SOP." };
        }

        await db.insert(templates).values({
            userId: session.user.id,
            name: templateName,
            structure: structure,
            description: `SOP yang dibuat dari tugas: ${templateName}`
        });

        revalidatePath("/dashboard/tasks");
        return { success: "SOP berhasil dibuat!" };

    } catch (error) {
        console.error("Save Template Error:", error);
        return { error: "Gagal membuat template." };
    }
}

export async function getTemplates() {
    const session = await auth();
    if (!session) return [];

    return await db.select().from(templates)
        .where(eq(templates.userId, session.user.id))
        .orderBy(desc(templates.createdAt));
}

export async function useTemplate(templateId) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        const template = await db.query.templates.findFirst({
            where: eq(templates.id, templateId)
        });

        if (!template) return { error: "Template tidak ditemukan" };

        const [newTask] = await db.insert(tasks).values({
            userId: session.user.id,
            content: template.name,
            isCompleted: false
        }).returning();

        if (template.structure && template.structure.length > 0) {
            const subtaskData = template.structure.map(step => ({
                taskId: newTask.id,
                content: step,
                isCompleted: false
            }));
            await db.insert(subtasks).values(subtaskData);
        }

        revalidatePath("/dashboard/tasks");
        return { success: "SOP berhasil diterapkan!", taskId: newTask.id };

    } catch (error) {
        console.error("Use Template Error:", error);
        return { error: "Gagal menggunakan template." };
    }
}

export async function deleteTemplate(templateId) {
    const session = await auth();
    if (!session) return;

    await db.delete(templates).where(eq(templates.id, templateId));
    revalidatePath("/dashboard/tasks");
    return { success: "Template dihapus" };
}