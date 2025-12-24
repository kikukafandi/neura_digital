"use server";

import { auth } from "@/auth";

const EVO_URL = process.env.EVOLUTION_URL || "http://127.0.0.1:8080";
const EVO_KEY = "422AFF66-2436-4767-9304-783269687452";

const connectState = new Map();
const MAX_RETRY = 5;
const BOOT_DELAY = 3000;      // Kurangi delay awal
const RETRY_DELAY = 2000;      // Kurangi retry delay
const BOOT_TIMEOUT = 45000;    // Timeout 45 detik - jika lewat ini, reset instance

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function createConnection() {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const instanceName = `user_${session.user.id}`;
    console.log(`\n[GATEWAY] --- CHECKING: ${instanceName} ---`);

    try {
        // 1. FETCH INSTANCE LIST
        const listRes = await fetch(`${EVO_URL}/instance/fetchInstances`, {
            headers: { apikey: EVO_KEY },
            cache: 'no-store',
            next: { revalidate: 0 }
        });

        if (!listRes.ok) return { error: "Evolution API Down" };

        const instances = await listRes.json();
        const instList = Array.isArray(instances) ? instances : [];
        const inst = instList.find(i => i && i.name === instanceName);

        // 2. CEK STATUS: SUDAH CONNECTED?
        if (inst && inst.connectionStatus === "open") {
            console.log("[GATEWAY] Status: OPEN (Connected)");
            connectState.delete(instanceName);
            return { status: "CONNECTED", phone: inst.ownerJid };
        }

        // 3. JIKA BELUM ADA -> CREATE BARU
        if (!inst) {
            console.log("[GATEWAY] Creating NEW Instance...");
            
            const createRes = await fetch(`${EVO_URL}/instance/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", apikey: EVO_KEY },
                body: JSON.stringify({
                    instanceName,
                    integration: "WHATSAPP-BAILEYS",
                    qrcode: true, 
                    reject_call: true
                })
            });

            const createData = await createRes.json();
            
            // --- FIX ERROR startsWith ---
            // Cek apakah ada QR di respon create DAN pastikan tipenya STRING
            let qrRaw = null;
            if (createData.qrcode && typeof createData.qrcode === 'string') qrRaw = createData.qrcode;
            else if (createData.base64 && typeof createData.base64 === 'string') qrRaw = createData.base64;

            if (qrRaw) {
                console.log("[GATEWAY] QR received immediately from Create!");
                const finalQr = qrRaw.startsWith("data:image") ? qrRaw : `data:image/png;base64,${qrRaw}`;
                return { status: "SCAN_NEEDED", qr: finalQr, message: "Scan QR sekarang!" };
            }

            // Jika qrcode: true (boolean) atau tidak ada QR, lanjut menunggu boot
            console.log("[GATEWAY] Instance created, waiting for boot...");
            await sleep(BOOT_DELAY); 
        }

        // 4. RETRY LOGIC / REQUEST MANUAL
        const state = connectState.get(instanceName) || { 
            lastAttempt: 0, 
            retries: 0,
            createdAt: Date.now()  // Track kapan instance dibuat
        };
        const now = Date.now();

        // CEK TIMEOUT: Jika sudah > 45 detik dari waktu create, reset instance
        if (now - state.createdAt > BOOT_TIMEOUT) {
            console.log("[GATEWAY] ⚠️ TIMEOUT! Instance terjebak booting. Menghapus & membuat baru...");
            connectState.delete(instanceName);
            
            // Forcefully delete instance yang bermasalah
            await fetch(`${EVO_URL}/instance/delete/${instanceName}`, {
                method: "DELETE",
                headers: { apikey: EVO_KEY }
            }).catch(() => {});

            return { 
                status: "RETRY_RESET",
                message: "Engine direstart. Coba lagi dalam 3 detik..." 
            };
        }

        // Exponential backoff: tunggu lebih lama seiring bertambahnya retry
        const backoffDelay = RETRY_DELAY + (state.retries * 1000);
        if (now - state.lastAttempt < backoffDelay) {
            return { 
                status: "SCAN_NEEDED", 
                message: `Menyiapkan sesi... (${state.retries} detik)` 
            };
        }

        console.log(`[GATEWAY] Requesting QR... Attempt ${state.retries + 1}`);
        state.lastAttempt = now;
        state.retries += 1;
        connectState.set(instanceName, state);

        // 5. REQUEST QR (GET)
        const connectRes = await fetch(`${EVO_URL}/instance/connect/${instanceName}`, {
            method: "GET",
            headers: { apikey: EVO_KEY },
            cache: 'no-store'
        });

        const rawData = await connectRes.text();
        console.log("[GATEWAY] Response:", rawData.substring(0, 50));

        let connectData = {};
        try { connectData = JSON.parse(rawData); } catch (e) { }

        // --- PENANGANAN MASALAH "count:0" (ZOMBIE vs BOOTING) ---
        if (rawData.includes('"count":0') || (connectData && connectData.count === 0)) {
            console.log(`[GATEWAY] ℹ️ Instance masih booting (${state.retries}/${MAX_RETRY})`);
            
            // Jika sudah melewati MAX_RETRY attempts, force reset
            if (state.retries >= MAX_RETRY) {
                console.log("[GATEWAY] ⚠️ Max retry tercapai. Merefresh instance...");
                connectState.delete(instanceName);
                
                // Soft reset - delete dan kasih kesempatan create baru
                await fetch(`${EVO_URL}/instance/delete/${instanceName}`, {
                    method: "DELETE",
                    headers: { apikey: EVO_KEY }
                }).catch(() => {});
                
                return { 
                    status: "RETRY_RESET",
                    message: "Instance direstart. Silakan coba lagi..." 
                };
            }
            
            // Return status "SCAN_NEEDED" tanpa QR -> UI akan loading
            return { 
                status: "SCAN_NEEDED", 
                message: "WhatsApp engine sedang boot... Klik lagi untuk menunggu." 
            };
        }

        // KASUS: QR Berhasil Ditemukan
        let qrString = connectData.base64 || connectData.qrcode;
        
        // Pastikan qrString valid dan string
        if (qrString && typeof qrString === 'string') {
            const finalQr = qrString.startsWith("data:image") ? qrString : `data:image/png;base64,${qrString}`;
            return {
                status: "SCAN_NEEDED",
                qr: finalQr,
                message: "Scan QR sekarang!"
            };
        }

        // KASUS: Instance sudah open
        if (connectData?.instance?.state === "open") {
            return { status: "CONNECTED", phone: connectData.instance.ownerJid };
        }

        return { status: "SCAN_NEEDED", message: "Menunggu QR dari WhatsApp..." };

    } catch (e) {
        console.error("[GATEWAY ERROR]:", e);
        return { error: "Gagal terhubung ke Engine WhatsApp." };
    }
}

export async function deleteConnection() {
    const session = await auth();
    if (!session) return;
    const instanceName = `user_${session.user.id}`;
    connectState.delete(instanceName);
    
    // Logout dulu
    await fetch(`${EVO_URL}/instance/logout/${instanceName}`, {
        method: "DELETE", headers: { apikey: EVO_KEY }
    });
    
    // Baru delete
    await fetch(`${EVO_URL}/instance/delete/${instanceName}`, {
        method: "DELETE", headers: { apikey: EVO_KEY }
    });
    
    return { success: true };
}