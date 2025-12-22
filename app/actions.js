"use server";

import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";

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