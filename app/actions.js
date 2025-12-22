"use server";

import { db } from "@/lib/db";
import { products, users, tasks, subtasks } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, and, asc, inArray } from "drizzle-orm";
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

// Fungsi untuk mengambil settings saat ini (biar form terisi otomatis)
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
export async function updateProfile(formData) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const name = formData.get("name");
    const image = formData.get("image");

    try {
        await db.update(users)
            .set({ name, image })
            .where(eq(users.id, session.user.id));

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        return { error: "Gagal memperbarui profil." };
    }
}

// --- 2. GANTI PASSWORD ---
export async function changePassword(formData) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");

    try {
        // 1. Ambil password hash user dari DB
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { password: true }
        });

        if (!user || !user.password) {
            return { error: "User tidak memiliki password (Login OAuth?)" };
        }

        // 2. Cek Password Lama
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) return { error: "Password lama salah!" };

        // 3. Hash Password Baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Simpan
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Terjadi kesalahan sistem." };
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

// export async function toggleSubtask(subtaskId, currentState) {
//     const session = await auth();
//     if (!session) return;

//     await db.update(subtasks)
//         .set({ isCompleted: !currentState })
//         .where(eq(subtasks.id, subtaskId));

//     revalidatePath("/dashboard/tasks");
// }

export async function deleteSubtask(subtaskId) {
    const session = await auth();
    if (!session) return;

    await db.delete(subtasks).where(eq(subtasks.id, subtaskId));
    revalidatePath("/dashboard/tasks");
}

export async function saveAtomizedTask(parentTaskContent, subtaskList) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        // --- STEP 1: Simpan ke Database Lokal (Postgres) ---
        // (Ini kode yang sudah ada sebelumnya)
        const [newTask] = await db.insert(tasks).values({
            userId: session.user.id,
            content: parentTaskContent,
            isCompleted: false,
        }).returning();

        if (subtaskList.length > 0) {
            const subtaskData = subtaskList.map((item) => ({
                taskId: newTask.id,
                content: item,
                isCompleted: false,
            }));
            await db.insert(subtasks).values(subtaskData);
        }

        // --- STEP 2: [BARU] Simpan ke Notion User ---
        // Ambil API Key & DB ID user dari tabel users
        const userSettings = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { notionApiKey: true, notionDbId: true }
        });

        // Cek apakah user sudah connect Notion?
        if (userSettings?.notionApiKey && userSettings?.notionDbId) {
            try {
                // Panggil kurir Notion
                await pushTaskToNotion(
                    userSettings.notionApiKey,
                    userSettings.notionDbId,
                    parentTaskContent,
                    subtaskList
                );
                console.log("✅ Berhasil sync ke Notion!");
            } catch (notionError) {
                console.error("❌ Gagal sync ke Notion:", notionError);
                // Kita tidak throw error agar aplikasi tetap jalan meski Notion gagal
                // (Mungkin nanti bisa kasih notifikasi "Sync Failed")
            }
        }

        revalidatePath("/dashboard/tasks");
        return { success: true, taskId: newTask.id };

    } catch (error) {
        console.error("Failed to save task:", error);
        return { error: "Gagal menyimpan tugas." };
    }
}

// ... kode saveAtomizedTask sebelumnya ...

export async function getUserTasks() {
    const session = await auth();
    if (!session?.user) return [];

    // Ambil task beserta subtasks-nya (Join)
    // Karena Drizzle ORM murni agak panjang join-nya, kita ambil parent dulu
    // lalu ambil children-nya. (Atau pakai query builder jika sudah setup relation)

    // Cara simpel manual query:
    const userTasks = await db.select().from(tasks)
        .where(eq(tasks.userId, session.user.id))
        .orderBy(desc(tasks.createdAt));

    // Kalau kosong, return kosong
    if (userTasks.length === 0) return [];

    // Ambil semua subtasks yang terkait dengan task-task di atas
    const taskIds = userTasks.map(t => t.id);
    const userSubtasks = await db.select().from(subtasks)
        .where(inArray(subtasks.taskId, taskIds))
        .orderBy(asc(subtasks.createdAt));

    // Gabungkan (Mapping)
    const combinedData = userTasks.map(task => ({
        ...task,
        subtasks: userSubtasks.filter(sub => sub.taskId === task.id)
    }));

    return combinedData;
}

// Tambah fungsi centang selesai
export async function toggleSubtask(subtaskId, currentStatus) {
    await db.update(subtasks)
        .set({ isCompleted: !currentStatus })
        .where(eq(subtasks.id, subtaskId));
    revalidatePath("/dashboard/tasks");
}