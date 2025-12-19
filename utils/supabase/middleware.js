import { createServerClient } from '@supabase/ssr'
import { NextResponse, userAgent } from 'next/server'

export async function updateSession(request) {
    // 1. Mulai Timer (Untuk menghitung duration)
    const startTime = Date.now();

    // Setup Response Awal
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Setup Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // --- LOGIKA UTAMA ANALYTICS ---
    // Filter: Hanya method GET, bukan file statis, bukan API internal, bukan file berekstensi
    if (request.method === 'GET' &&
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/static') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        !request.nextUrl.pathname.includes('.')) {

        try {
            // A. Ambil Data Dasar
            let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
            if (process.env.NODE_ENV === 'development') ip = '127.0.0.1 (Localhost)';

            const country = request.geo?.country || 'Unknown';
            const city = request.geo?.city || 'Unknown';
            const { device } = userAgent(request);
            const deviceType = device.type === 'mobile' ? 'Mobile' : 'Desktop';

            // B. Ambil Data Tambahan (BARU)
            const method = request.method; // GET, POST, dll
            const referrer = request.headers.get('referer') || 'Direct'; // Dari mana user datang (Google, FB, dll)

            // C. Hitung Durasi & Status
            // Kita hitung sampai titik ini. Note: Ini adalah durasi pemrosesan middleware, 
            // bukan total waktu render halaman (karena middleware jalan sebelum render).
            const duration = Date.now() - startTime;
            const statusCode = response.status;

            // D. Simpan ke Supabase (Fire and Forget / Await)
            // Kita gunakan await agar data pasti masuk, tapi ini menambah sedikit latency.
            // Jika traffic sangat tinggi, pertimbangkan menghapus 'await' di sini.
            await supabase.from('traffic_logs').insert({
                ip_address: ip,
                country: country,
                city: city,
                device_type: deviceType,
                user_agent: request.headers.get('user-agent'),
                path_url: request.nextUrl.pathname,
                // Field Baru:
                method: method,
                referrer: referrer,
                duration: duration,
                status_code: statusCode
            });

        } catch (err) {
            console.error("⚠️ Analytics Error:", err);
        }
    }

    // --- AUTHENTICATION LOGIC ---
    const { data: { user } } = await supabase.auth.getUser()

    // Proteksi Route Dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/portal-x7z', request.url))
    }

    return response
}