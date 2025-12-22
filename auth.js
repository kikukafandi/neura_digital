import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    // PENTING: Paksa session menggunakan JWT agar Middleware bisa membacanya tanpa akses DB langsung
    session: {
        strategy: "jwt",
    },
    providers: [
        // Conditionally register OAuth providers if env vars are present
        ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
            ? [
                Google({
                    clientId: process.env.AUTH_GOOGLE_ID,
                    clientSecret: process.env.AUTH_GOOGLE_SECRET,
                }),
            ]
            : []),
        ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
            ? [
                GitHub({
                    clientId: process.env.AUTH_GITHUB_ID,
                    clientSecret: process.env.AUTH_GITHUB_SECRET,
                }),
            ]
            : []),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (creds) => {
                const email = creds?.email?.toString().toLowerCase().trim();
                const password = creds?.password?.toString() ?? "";

                if (!email || !password) return null;

                const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
                const user = rows?.[0];

                if (!user || !user.password) return null;

                const ok = await bcrypt.compare(password, user.password);
                if (!ok) return null;

                return {
                    id: user.id,
                    name: user.name ?? null,
                    email: user.email,
                    image: user.image ?? null,
                    role: user.role ?? "user",
                    plan: user.plan ?? "free",
                };
            },
        }),
    ],
    callbacks: {
        // 1. Masukkan data user ke Token JWT saat login berhasil
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.plan = user.plan;
            }
            return token;
        },
        // 2. Saat session diakses di client/server, ambil data dari Token JWT
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.plan = token.plan;
            }
            return session;
        },
    },
});