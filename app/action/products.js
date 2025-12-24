"use server";

import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";

function parseList(text) {
    if (!text) return [];
    return text.split("\n").map(item => item.trim()).filter(item => item.length > 0);
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

export async function addProduct(formData) {
    const name = formData.get("name");
    const price = parseInt(formData.get("price"));
    const category = formData.get("category");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const imageUrl = formData.get("imageUrl");

    const adsTitle = formData.get("adsTitle") || name;
    const adsSubtitle = formData.get("adsSubtitle") || shortDescription;
    const adsProblems = formData.get("adsProblems");
    const adsSolutions = formData.get("adsSolutions");

    const adsContentJSON = {
        title: adsTitle,
        subtitle: adsSubtitle,
        problems: parseList(adsProblems),
        solutions: parseList(adsSolutions),
        faqs: []
    };

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
            adsContent: adsContentJSON,
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

export async function updateProduct(formData) {
    const id = formData.get("id");
    const name = formData.get("name");
    const price = parseInt(formData.get("price"));
    const category = formData.get("category");
    const description = formData.get("description");
    const shortDescription = formData.get("shortDescription");
    const imageUrl = formData.get("imageUrl");

    const adsTitle = formData.get("adsTitle");
    const adsSubtitle = formData.get("adsSubtitle");
    const adsProblems = formData.get("adsProblems");
    const adsSolutions = formData.get("adsSolutions");

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
                adsContent: adsContentJSON,
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