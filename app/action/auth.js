"use server";

import { db } from "@/lib/db";
import { products, users, tasks } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
    try {
        const allProducts = await db.select().from(products);
        const allUsers = await db.select().from(users);
        const allTasks = await db.select().from(tasks);

        const totalUsers = allUsers.length;
        const proUsers = allUsers.filter(u => u.plan === 'pro').length;
        const totalProducts = allProducts.length;
        const totalAssetValue = allProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.isCompleted).length;
        const proPercentage = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalProducts, totalUsers, totalTasks, totalAssetValue,
            proUsers, proPercentage, completionRate
        };
    } catch (error) {
        return null;
    }
}

export async function getUsers() {
    try {
        return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) { return []; }
}

export async function updateUser(formData) {
    const userId = formData.get("id");
    const role = formData.get("role");
    const plan = formData.get("plan");
    await db.update(users).set({ role, plan }).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: "User updated" };
}

export async function deleteUser(userId) {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/admin/users");
    return { success: "User deleted" };
}