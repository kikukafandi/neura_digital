"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth"; // Diperlukan untuk error handling login/register

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
        await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        return { success: true };

    } catch (err) {
        console.error("Register Error:", err);
        if (err instanceof AuthError) {
            return { error: "Gagal login otomatis." };
        }
        throw err;
    }
}

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
            redirectTo: "/dashboard/tasks",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email atau Password salah!" };
                default:
                    return { error: "Terjadi kesalahan pada server." };
            }
        }
        throw error;
    }
}

export async function updateProfile(formData) {
    const email = formData.get("email");
    const newName = formData.get("name");

    if (!newName) return { error: "Nama tidak boleh kosong" };

    try {
        await db.update(users)
            .set({ name: newName })
            .where(eq(users.email, email));

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard");

        return { success: true, newName: newName };

    } catch (err) {
        return { error: "Gagal update profil" };
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}

export async function changePassword(formData) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { password: true }
        });

        if (!user || !user.password) {
            return { error: "User tidak memiliki password (Login OAuth?)" };
        }

        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) return { error: "Password lama salah!" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Terjadi kesalahan sistem." };
    }
}