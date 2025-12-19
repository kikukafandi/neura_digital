import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 1. Ambil User saat ini
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 2. LOGIKA PROTEKSI ROUTE
    // Jika URL dimulai dengan /dashboard DAN user tidak ada (belum login)
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        // Redirect paksa ke Landing Page (Halaman Utama)
        return NextResponse.redirect(new URL('/', request.url))
    }

    // (Opsional) Jika User SUDAH login tapi coba buka halaman login rahasia lagi
    // Ganti '/portal-x7z' dengan nama folder rahasia Anda
    // if (request.nextUrl.pathname.startsWith('/portal-x7z') && user) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url))
    // }

    return response
}