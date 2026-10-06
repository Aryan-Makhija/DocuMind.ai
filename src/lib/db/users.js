import { getDb } from "./index";
import { users } from "./schema";

export async function ensureUser(userId) {
    const db = getDb();

    await db
        .insert(users)
        .values({
            id: userId,
        })
        .onConflictDoNothing();
}