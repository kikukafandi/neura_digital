import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const isOnAdminPanel = req.nextUrl.pathname.startsWith("/admin");
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnAuthRoute = ["/login", "/register"].includes(req.nextUrl.pathname);

    // 1. Jika User biasa coba masuk Admin Panel -> Tendang ke Dashboard User
    if (isOnAdminPanel && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // 2. Jika belum login coba akses Admin/Dashboard -> Login dulu
    if ((isOnAdminPanel || isOnDashboard) && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 3. Jika sudah login tapi buka halaman Login/Register -> Arahkan sesuai role
    if (isOnAuthRoute && isLoggedIn) {
        if (userRole === "admin") {
            return NextResponse.redirect(new URL("/admin", req.nextUrl));
        }
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};