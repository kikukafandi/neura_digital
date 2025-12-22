"use server";

import { db } from "@/lib/db";
import { products, users, tasks,subtasks } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, and,asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";

export async function addProduct(formData) {
    const name = formData.get("name");
    const price = parseInt(formData.get("price"));
    const category = formData.get("category");

    const slug = name.toString().toLowerCase().trim().replace(/\s+/g, "-");

    const dummyAdsContent = {
        title: "Judul Bombastis Sales Page",
        subtitle: "Subjudul yang menarik perhatian",
        problems: ["Masalah 1: Susah tidur", "Masalah 2: Kerjaan numpuk"],
        solutions: ["Solusi 1: Pakai template ini", "Solusi 2: Tidur nyenyak"],
        faqs: [
            { q: "Apakah ini gratis?", a: "Tidak, tapi murah." }
        ]
    };

    await db.insert(products).values({
        name: name,
        slug: slug,
        price: price,
        category: category,
        imageUrl: "https://placehold.co/600x400",
        description: "Ini adalah deskripsi lengkap produk (Markdown supported).",
        shortDescription: "Deskripsi singkat untuk tampilan kartu di katalog.",
        adsContent: dummyAdsContent,
    });

    revalidatePath("/test-db");
    revalidatePath("/products");
}

export async function getProducts() {
    try {
        const data = await db
            .select()
            .from(products)
            .orderBy(desc(products.createdAt));
        return data;
    } catch (error) {
        console.error("Gagal ambil produk:", error);
        return [];
    }
}

export async function getProductBySlug(slug) {
    try {
        const data = await db
            .select()
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1);

        return data[0] || null;
    } catch (error) {
        console.error("Gagal ambil detail produk:", error);
        return null;
    }
}

export async function registerUser(formData) {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    // Validasi Server Side (Jaga-jaga kalau client-side ditembus)
    if (!email || !password || !name) {
        return { error: "Semua kolom wajib diisi!" };
    }

    // Cek Kompleksitas Password (Huruf, Angka, Simbol, Min 8 Karakter)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return { error: "Password terlalu lemah! Gunakan minimal 8 karakter, kombinasi huruf, angka, dan simbol." };
    }

    // 1. Cek apakah email sudah terdaftar
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return { error: "Email sudah digunakan! Silakan login." };
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Simpan ke Database
        await db.insert(users).values({
            name: name,
            email: email,
            password: hashedPassword,
            role: "user",
            plan: "free",
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A2540&color=fff`
        });

        return { success: "Registrasi berhasil! Mengalihkan..." };

    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Terjadi kesalahan server. Coba lagi nanti." };
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}

export async function updateNotionSettings(formData) {
    const session = await auth();
    if (!session) return { error: "Harus login dulu!" };

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
        return { success: "Integrasi Notion berhasil disimpan!" };
    } catch (error) {
        console.error("Gagal update settings:", error);
        return { error: "Terjadi kesalahan sistem." };
    }
}
export async function updateProfile(formData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name");
    const image = formData.get("image"); 

    if (!name) return { error: "Nama tidak boleh kosong." };

    try {
        await db.update(users)
            .set({
                name: name,
                image: image
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard");
        return { success: "Profil berhasil diperbarui!" };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { error: "Gagal menyimpan profil." };
    }
}
// --- FEATURE: CHANGE PASSWORD ---
export async function changePassword(formData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");

    if (!oldPassword || !newPassword) return { error: "Semua kolom wajib diisi." };
    if (newPassword.length < 8) return { error: "Password baru minimal 8 karakter." };

    try {
        // 1. Ambil user & password lama dari DB
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        if (!user || !user.password) return { error: "User tidak ditemukan." };

        // 2. Cek Password Lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return { error: "Password lama salah." };

        // 3. Hash Password Baru & Simpan
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        return { success: "Password berhasil diubah!" };
    } catch (err) {
        console.error(err);
        return { error: "Gagal mengubah password." };
    }
}

// --- FEATURE: TASK SYSTEM (ATOMIZER) ---
export async function addTask(formData) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const content = formData.get("content");
    if (!content) return;

    // Sekarang 'tasks' sudah dikenali karena sudah di-import di atas
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

    await db.update(tasks)
        .set({ isCompleted: !currentState })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)));

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

// --- FEATURE: SUBTASKS ---
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

export async function toggleSubtask(subtaskId, currentState) {
    const session = await auth();
    if (!session) return;

    await db.update(subtasks)
        .set({ isCompleted: !currentState })
        .where(eq(subtasks.id, subtaskId));
    
    revalidatePath("/dashboard/tasks");
}

export async function deleteSubtask(subtaskId) {
    const session = await auth();
    if (!session) return;

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
    revalidatePath("/dashboard/tasks");
}