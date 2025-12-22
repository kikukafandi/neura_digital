"use server";

import { db } from "@/lib/db";
import { products, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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