// auth.js
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { db } from "@/lib/db"
import { accounts, sessions, users, verificationTokens } from "@/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
    ],
    // Callback ini PENTING untuk RBAC (Role Based Access Control)
    callbacks: {
        async session({ session, user }) {
            // Masukkan role & plan dari database ke session browser
            session.user.id = user.id;
            session.user.role = user.role;
            session.user.plan = user.plan;
            return session;
        },
    },
})