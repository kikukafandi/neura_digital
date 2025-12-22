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
            // These fields correspond to form input names
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

                // NextAuth only needs an object with an id at minimum
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
        async session({ session, user }) {
            // user is defined with database session strategy
            if (session?.user && user) {
                session.user.id = user.id;
                session.user.role = user.role;
                session.user.plan = user.plan;
            }
            return session;
        },
    },
});