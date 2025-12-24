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
            totalProducts,
            totalUsers,
            totalTasks,
            totalAssetValue,
            proUsers,
            proPercentage,
            completionRate
        };
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return null;
    }
}

export async function getUsers() {
    try {
        const data = await db.select().from(users).orderBy(desc(users.createdAt));
        return data;
    } catch (error) {
        console.error("Get Users Error:", error);
        return [];
    }
}

export async function updateUser(formData) {
    const userId = formData.get("id");
    const role = formData.get("role");
    const plan = formData.get("plan");

    try {
        await db.update(users)
            .set({ role, plan })
            .where(eq(users.id, userId));

        revalidatePath("/admin/users");
        return { success: "Data pengguna diperbarui" };
    } catch (error) {
        console.error("Update User Error:", error);
        return { error: "Gagal update pengguna" };
    }
}

export async function deleteUser(userId) {
    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath("/admin/users");
        return { success: "Pengguna dihapus permanen" };
    } catch (error) {
        console.error("Delete User Error:", error);
        return { error: "Gagal menghapus pengguna" };
    }
}