import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let db;

export function getDb() {
    if (!db) {
        const sql = neon(process.env.DATABASE_URL);

        db = drizzle(sql);
    }

    return db;
}