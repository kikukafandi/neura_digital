// app/test-db/page.jsx
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { addProduct } from "@/app/actions"; // Pastikan import ini benar
import { desc } from "drizzle-orm";

export default async function TestPage() {
    const allProducts = await db
        .select()
        .from(products)
        .orderBy(desc(products.createdAt));

    return (
        <div className="p-10 max-w-2xl mx-auto font-sans text-slate-900">
            <h1 className="text-2xl font-bold mb-6">Test Koneksi Neon + Drizzle</h1>

            <div className="bg-gray-100 p-6 rounded-xl mb-8 border border-gray-200">
                <h2 className="font-semibold mb-4">Tambah Produk Baru</h2>

                <form action={addProduct} className="flex flex-col gap-3">
                    <input
                        name="name"
                        type="text"
                        placeholder="Nama Produk"
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        name="category"
                        type="text"
                        placeholder="Kategori"
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        name="price"
                        type="number"
                        placeholder="Harga (IDR)"
                        className="p-2 border rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition"
                    >
                        Simpan ke Database
                    </button>
                </form>
            </div>

            <div>
                <h2 className="font-semibold mb-4 border-b pb-2 border-gray-300">
                    Data di Database ({allProducts.length})
                </h2>

                {allProducts.length === 0 ? (
                    <p className="text-gray-500 italic">Belum ada data.</p>
                ) : (
                    <ul className="space-y-3">
                        {allProducts.map((item) => (
                            <li key={item.id} className="p-4 border rounded-lg flex justify-between items-center shadow-sm bg-white">
                                <div>
                                    <p className="font-bold text-lg">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.category}</p>
                                </div>
                                <div className="text-green-600 font-mono font-bold">
                                    Rp {item.price.toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}