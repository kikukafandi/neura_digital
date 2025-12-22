import { auth } from "@/auth";

// Use the already-initialized NextAuth auth helper directly
export default auth;

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};