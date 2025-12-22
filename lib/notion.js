import { Client } from "@notionhq/client";

// Fungsi untuk membuat Client Notion baru berdasarkan Token User
export const getNotionClient = (apiKey) => {
    return new Client({ auth: apiKey });
};

// Fungsi Utama: Push Tugas ke Notion
export async function pushTaskToNotion(apiKey, dbId, taskContent, subtasks) {
    const notion = getNotionClient(apiKey);

    // 1. Buat Halaman Baru di Database Notion (Parent Task)
    const response = await notion.pages.create({
        parent: { database_id: dbId },
        icon: { type: "emoji", emoji: "⚡" }, // Ikon Petir biar keren
        properties: {
            "Name": { // Pastikan di Notion nama kolomnya "Name" atau "Title"
                title: [
                    { text: { content: taskContent } }
                ]
            },
            "Status": { // Pastikan ada kolom Status (Select)
                select: { name: "To Do" }
            }
        },
        // Masukkan Subtasks sebagai "Isi Halaman" (Checklist Block)
        children: subtasks.map(sub => ({
            object: "block",
            type: "to_do",
            to_do: {
                rich_text: [{ type: "text", text: { content: sub } }],
                checked: false
            }
        }))
    });

    return response.id; // Kembalikan ID halaman Notion yang baru dibuat
}