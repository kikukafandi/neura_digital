// db/schema.js
import { pgTable, text, integer, timestamp, primaryKey, boolean, json } from "drizzle-orm/pg-core";

// 1. TABEL USERS
export const users = pgTable("user", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    password: text("password"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").default("user"),
    plan: text("plan").default("free"),
    createdAt: timestamp("created_at").defaultNow(),
    notionApiKey: text("notion_api_key"),
    notionDbId: text("notion_db_id"),
});
// 2. TABEL ACCOUNTS
export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

// 3. TABEL SESSIONS
export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

// 4. TABEL VERIFICATION TOKENS
export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
);

// 5. TABEL INTEGRATIONS
export const integrations = pgTable("integrations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id).notNull(),
    provider: text("provider").notNull(),
    accessToken: text("access_token").notNull(),
    workspaceId: text("workspace_id"),
    connectedAt: timestamp("connected_at").defaultNow(),
});

// 6. TABEL PRODUCTS (Updated)
export const products = pgTable("products", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    shortDescription: text("short_description"),
    adsContent: json("ads_content"),
    category: text("category"),
    price: integer("price").default(0),
    imageUrl: text("image_url"),
    isPublished: boolean("is_published").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("task", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(), 
    notionPageId: text("notionPageId"), 
    isSynced: boolean("isSynced").default(false), 

    isCompleted: boolean("isCompleted").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const subtasks = pgTable("subtask", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    taskId: text("taskId").notNull().references(() => tasks.id, { onDelete: "cascade" }),
    content: text("content").notNull(), 
    notionBlockId: text("notionBlockId"),
    isCompleted: boolean("isCompleted").default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});