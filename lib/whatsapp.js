// lib/whatsapp.js

/**
 * Kirim Pesan WhatsApp via Fonnte (Versi Text-Only + Link)
 */
export async function sendWhatsAppMessage(token, target, message) {
    // CCTV 1: Cek apakah fungsi dipanggil
    console.log("📨 Mencoba kirim WA ke:", target);
    console.log("🔑 Pakai Token:", token ? "Token Ada" : "TOKEN KOSONG!");
    if (!token || !target) {
        console.log("❌ Gagal: Token atau Target kosong");
    return false;
    }

    try {
        const formData = new FormData();
        formData.append("target", target);
        formData.append("message", message);

        // Fonnte API Endpoint
        const response = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: { Authorization: token },
            body: formData,
        });

        const result = await response.json();
        console.log("📡 Respon Fonnte:", result);
        console.log("WA Sending Status:", result);
        return result.status;
    } catch (error) {
        console.error("Gagal kirim WA:", error);
        return false;
    }
}