"use server";

import { db } from "@/lib/db";
import { products, users, tasks, subtasks, templates} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq, and, asc, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { pushTaskToNotion } from "@/lib/notion";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { GoogleGenerativeAI } from "@google/generative-ai";


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

// --- REGISTER (Auto Login) ---
export async function register(formData) {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!name || !email || !password) {
        return { error: "Semua kolom harus diisi!" };
    }

    // Cek email duplikat
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (existingUser) {
        return { error: "Email sudah terdaftar!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // 1. Simpan ke DB
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        // 2. AUTO LOGIN (Langsung sign-in setelah register)
        // redirect: false agar kita bisa handle redirect manual
        await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        return { success: true }; // Beri sinyal sukses ke UI

    } catch (err) {
        console.error("Register Error:", err);
        // NextAuth kadang melempar error saat redirect, kita cek dulu
        if (err instanceof AuthError) {
            return { error: "Gagal login otomatis." };
        }
        // Jika sukses login, signIn akan throw error REDIRECT, jadi kita biarkan
        throw err;
    }
}

// --- LOGIN (Error Handling) ---
export async function login(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
        return { error: "Email dan password wajib diisi." };
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard/tasks", // Redirect kalau sukses
        });
    } catch (error) {
        // Tangkap error khusus NextAuth
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email atau Password salah!" };
                default:
                    return { error: "Terjadi kesalahan pada server." };
            }
        }
        throw error; // Lempar error redirect (wajib)
    }
}

// --- UPDATE PROFILE (Update Session) ---
export async function updateProfile(formData) {
    const email = formData.get("email"); // Email sebagai key (hidden input)
    const newName = formData.get("name");

    if (!newName) return { error: "Nama tidak boleh kosong" };

    try {
        // 1. Update DB
        await db.update(users)
            .set({ name: newName })
            .where(eq(users.email, email));

        // 2. Revalidate Cache
        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard");

        // 3. Return Data Baru (Penting buat Client Session)
        return { success: true, newName: newName };

    } catch (err) {
        return { error: "Gagal update profil" };
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
        // [BARU] LOGIKA KIRIM WA (Text + Link)
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

            // Fire and Forget (Kirim tanpa nunggu response biar UI cepat)
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


export async function getUserTasks() {
    const session = await auth();
    if (!session?.user) return [];

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

// --- [BARU] GET SETTINGS (GABUNGAN) ---
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





function parseList(text) {
    if (!text) return [];
    return text.split("\n").map(item => item.trim()).filter(item => item.length > 0);
}

// --- CREATE PRODUCT ---
export async function addProduct(formData) {
    const name = formData.get("name");
    const price = parseInt(formData.get("price"));
    const category = formData.get("category");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const imageUrl = formData.get("imageUrl");

    // --- AMBIL ADS CONTENT DARI FORM ---
    const adsTitle = formData.get("adsTitle") || name; // Default ke nama produk
    const adsSubtitle = formData.get("adsSubtitle") || shortDescription;
    const adsProblems = formData.get("adsProblems"); // Textarea
    const adsSolutions = formData.get("adsSolutions"); // Textarea

    // Buat JSON adsContent
    const adsContentJSON = {
        title: adsTitle,
        subtitle: adsSubtitle,
        problems: parseList(adsProblems),
        solutions: parseList(adsSolutions),
        faqs: [] // Sementara kosongkan dulu atau tambah logic FAQ nanti
    };

    // Buat Slug
    const slug = name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

    try {
        await db.insert(products).values({
            name,
            slug,
            price,
            category,
            imageUrl: imageUrl || null,
            description: description || "",
            shortDescription: shortDescription || "",
            adsContent: adsContentJSON, // <--- MASUKKAN JSON DISINI
            isPublished: true,
        });

        revalidatePath("/admin/products");
        revalidatePath("/dashboard/products");
        return { success: "Produk berhasil ditambahkan" };
    } catch (error) {
        console.error("Add Product Error:", error);
        return { error: "Gagal menambah produk" };
    }
}

// --- UPDATE PRODUCT ---
export async function updateProduct(formData) {
    const id = formData.get("id");
    const name = formData.get("name");
    const price = parseInt(formData.get("price"));
    const category = formData.get("category");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const imageUrl = formData.get("imageUrl");

    // --- AMBIL ADS CONTENT BARU ---
    const adsTitle = formData.get("adsTitle");
    const adsSubtitle = formData.get("adsSubtitle");
    const adsProblems = formData.get("adsProblems");
    const adsSolutions = formData.get("adsSolutions");

    // Pertahankan data lama jika tidak diisi, atau overwrite
    const adsContentJSON = {
        title: adsTitle,
        subtitle: adsSubtitle,
        problems: parseList(adsProblems),
        solutions: parseList(adsSolutions),
        faqs: []
    };

    try {
        await db.update(products)
            .set({
                name,
                price,
                category,
                description,
                shortDescription,
                imageUrl,
                adsContent: adsContentJSON, // <--- UPDATE JSON DISINI
            })
            .where(eq(products.id, id));

        revalidatePath("/admin/products");
        revalidatePath("/dashboard/products");
        return { success: "Produk berhasil diperbarui" };
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Gagal update produk" };
    }
}

// 4. DELETE
export async function deleteProduct(productId) {
    try {
        await db.delete(products).where(eq(products.id, productId));

        revalidatePath("/admin/products");
        revalidatePath("/dashboard/products");
        return { success: "Produk dihapus" };
    } catch (error) {
        console.error("Delete Error:", error);
        return { error: "Gagal menghapus produk" };
    }
}


export async function getUsers() {
    try {
        // Ambil semua user, urutkan dari yang terbaru
        const data = await db.select().from(users).orderBy(desc(users.createdAt));
        return data;
    } catch (error) {
        console.error("Get Users Error:", error);
        return [];
    }
}

// 2. UPDATE USER (Role & Plan)
export async function updateUser(formData) {
    const userId = formData.get("id");
    const role = formData.get("role"); // 'user' atau 'admin'
    const plan = formData.get("plan"); // 'free' atau 'pro'

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

// 3. DELETE USER
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


export async function getAdminStats() {
    try {
        // 1. Ambil Data Mentah
        const allProducts = await db.select().from(products);
        const allUsers = await db.select().from(users);
        const allTasks = await db.select().from(tasks);

        // 2. Hitung User Stats
        const totalUsers = allUsers.length;
        const proUsers = allUsers.filter(u => u.plan === 'pro').length;
        const verifiedUsers = allUsers.filter(u => u.email).length; // Asumsi semua email ada

        // 3. Hitung Product Stats
        const totalProducts = allProducts.length;
        const totalAssetValue = allProducts.reduce((sum, p) => sum + (p.price || 0), 0);

        // 4. Hitung Task Activity
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.isCompleted).length;

        // 5. Hitung Persentase untuk Progress Bar
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

export async function generateInsightAnalysis() {
    try {
        const session = await auth();
        if (!session) return { error: "Unauthorized" };

        // 1. Ambil 50 Tugas Terakhir dari DB
        // Kita ambil data mentah: konten tugas, status selesai/belum, dan tanggal dibuat
        const history = await db.select().from(tasks)
            .where(eq(tasks.userId, session.user.id))
            .orderBy(desc(tasks.createdAt))
            .limit(50);

        if (history.length < 5) {
            return { error: "Data belum cukup untuk analisis (min. 5 tugas)." };
        }

        // 2. Format Data untuk Prompt Gemini
        // Kita ringkas datanya supaya hemat token dan mudah dibaca AI
        const taskData = history.map(t => ({
            task: t.content,
            status: t.isCompleted ? "Selesai" : "Pending",
            date: new Date(t.createdAt).toLocaleDateString('id-ID'),
        }));

        // 3. Inisialisasi Gemini (Sesuai style Mas di route.js)
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 4. Prompt Engineering untuk Analisis Pola
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

        // 5. Generate Content
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const insight = JSON.parse(responseText);

        return { success: true, data: insight };

    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return { error: "Gagal menganalisis pola nalar." };
    }
}

// 1. UBAH TASK JADI TEMPLATE (ABSTRAKSI)
export async function saveTaskAsTemplate(taskId, templateName) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        // Ambil Subtask dari Task tersebut
        const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, taskId));

        // Ambil konten langkah-langkahnya saja
        const structure = taskSubtasks.map(s => s.content);

        if (structure.length === 0) {
            return { error: "Tugas ini tidak memiliki langkah untuk dijadikan SOP." };
        }

        // Simpan ke Tabel Templates
        await db.insert(templates).values({
            userId: session.user.id,
            name: templateName,
            structure: structure, // Simpan array string sebagai JSON
            description: `SOP yang dibuat dari tugas: ${templateName}`
        });

        revalidatePath("/dashboard/tasks");
        return { success: "SOP berhasil dibuat!" };

    } catch (error) {
        console.error("Save Template Error:", error);
        return { error: "Gagal membuat template." };
    }
}

// 2. AMBIL DAFTAR TEMPLATE
export async function getTemplates() {
    const session = await auth();
    if (!session) return [];

    return await db.select().from(templates)
        .where(eq(templates.userId, session.user.id))
        .orderBy(desc(templates.createdAt));
}

// 3. PAKAI TEMPLATE (INSTANTIATE)
export async function useTemplate(templateId) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    try {
        // Ambil Template
        const template = await db.query.templates.findFirst({
            where: eq(templates.id, templateId)
        });

        if (!template) return { error: "Template tidak ditemukan" };

        // Buat Parent Task Baru
        const [newTask] = await db.insert(tasks).values({
            userId: session.user.id,
            content: template.name, // Nama Task = Nama SOP
            isCompleted: false
        }).returning();

        // Buat Subtasks dari Structure Template
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

// 4. HAPUS TEMPLATE
export async function deleteTemplate(templateId) {
    const session = await auth();
    if (!session) return;

    await db.delete(templates).where(eq(templates.id, templateId));
    revalidatePath("/dashboard/tasks");
    return { success: "Template dihapus" };
}