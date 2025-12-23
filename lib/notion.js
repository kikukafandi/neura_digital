import { Client } from "@notionhq/client";

/**
 * Membuat Client Notion baru berdasarkan API Key User (BYOK)
 */
export const getNotionClient = (apiKey) => {
    return new Client({ auth: apiKey });
};

/**
 * Mendorong Tugas Induk + Subtasks ke Database Notion User
 */
export async function pushTaskToNotion(apiKey, dbId, taskContent, subtasks) {
    if (!apiKey || !dbId) return null;

    const notion = getNotionClient(apiKey);

    try {
        // 1. Buat Halaman Baru (Parent Task)
        const response = await notion.pages.create({
            parent: { database_id: dbId },
            icon: { type: "emoji", emoji: "⚡" }, // Ikon Petir (Simpul Nalar signature)
            properties: {
                // Asumsi nama kolom di Notion user adalah "Name" atau "Title".
                // Nanti kita bisa bikin fitur mapping kolom biar lebih canggih.
                title: [
                    { text: { content: taskContent } }
                ],
                // Opsional: Tambahkan Status jika user punya kolom Status
                // "Status": { select: { name: "To Do" } } 
            },
            // 2. Isi Halaman dengan Checklist (Subtasks)
            children: subtasks.map(sub => ({
                object: "block",
                type: "to_do",
                to_do: {
                    rich_text: [{ type: "text", text: { content: sub } }],
                    checked: false
                }
            }))
        });

        return response.id; // Return ID halaman Notion
    } catch (error) {
        console.error("Notion Sync Error:", error.body || error);
        throw new Error("Gagal sinkronisasi ke Notion. Cek API Key/Database ID.");
    }
}