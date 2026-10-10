import { NextResponse } from "next/server";
import {
    and,
    count,
    desc,
    eq,
    sql,
} from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
    users,
    documents,
    conversations,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/lib/errors/AppError";
import { ensureUser } from "@/lib/db/users";

// Replace this with your actual authentication helper.


export async function GET() {
    try {


        // 1. Authenticate the user
        const { userId } = await auth();

        if (!userId) {
            throw new AppError("Unauthorized", {
                code: "UNAUTHORIZED",
                status: 401,
            });
        }
        await ensureUser(userId);
        // 2. Fetch user details
        const db = getDb();
        const [user] = await db
            .select({
                id: users.id,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 3. Fetch document statistics
        const [documentStats] = await db
            .select({
                totalDocuments: count(),

                readyDocuments: sql < number > `
          count(*) filter (
            where ${documents.status} = 'ready'
          )
        `,

                failedDocuments: sql < number > `
          count(*) filter (
            where ${documents.status} = 'failed'
          )
        `,

                pendingDocuments: sql < number > `
          count(*) filter (
            where ${documents.status} = 'pending'
          )
        `,
            })
            .from(documents)
            .where(eq(documents.userId, userId));

        // 4. Count conversations
        const [conversationStats] = await db
            .select({
                totalConversations: count(),
            })
            .from(conversations)
            .where(eq(conversations.userId, userId));

        // 5. Fetch the four latest uploaded documents
        const latestDocuments = await db
            .select({
                id: documents.id,
                name: documents.name,
                fileName: documents.fileName,
                fileSize: documents.fileSize,
                status: documents.status,
                createdAt: documents.createdAt,
            })
            .from(documents)
            .where(eq(documents.userId, userId))
            .orderBy(desc(documents.createdAt))
            .limit(4);

        // 6. Return dashboard data
        return NextResponse.json({
            user,
            stats: {
                totalDocuments: Number(
                    documentStats.totalDocuments
                ),
                readyDocuments: Number(
                    documentStats.readyDocuments
                ),
                failedDocuments: Number(
                    documentStats.failedDocuments
                ),
                pendingDocuments: Number(
                    documentStats.pendingDocuments
                ),
                totalConversations: Number(
                    conversationStats.totalConversations
                ),
            },
            latestDocuments,
        });
    } catch (error) {
        console.error("Dashboard API error:", error);

        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}