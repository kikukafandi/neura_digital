"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateNotionSettings(formData) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const apiKey = formData.get("apiKey");
    const dbId = formData.get("dbId");

    try {
        await db.update(users)
            .set({
                notionApiKey: apiKey,
                notionDbId: dbId
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Gagal update settings:", error);
        return { error: "Gagal menyimpan pengaturan." };
    }
}

export async function getNotionSettings() {
    const session = await auth();
    if (!session?.user) return null;

    const data = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: {
            notionApiKey: true,
            notionDbId: true
        }
    });

    return data;
}

export async function updateIntegrationSettings(formData) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const notionApiKey = formData.get("notionApiKey");
    const notionDbId = formData.get("notionDbId");
    const whatsappNumber = formData.get("whatsappNumber");

    try {
        await db.update(users)
            .set({
                notionApiKey,
                notionDbId,
                whatsappNumber
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Gagal menyimpan pengaturan." };
    }
}

export async function getIntegrationSettings() {
    const session = await auth();
    if (!session?.user) return null;

    try {
        const data = await db
            .select({
                notionApiKey: users.notionApiKey,
                notionDbId: users.notionDbId,
                whatsappNumber: users.whatsappNumber
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        return data[0] || null;
    } catch (error) {
        return null;
    }
}