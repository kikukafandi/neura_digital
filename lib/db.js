import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Use UNPOOLED for development (more stable), pooled for production
const connectionString = process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL
    : process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

const sql = neon(connectionString);

export const db = drizzle(sql);