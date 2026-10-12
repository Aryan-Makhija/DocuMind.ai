
import { NextResponse } from "next/server";
import { count, desc, eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { getDb } from "@/lib/db";
import {
    users,
    documents,
    conversations,
} from "@/lib/db/schema";
import { ensureUser } from "@/lib/db/users";

export async function GET() {
    try {
        // Match the authentication pattern used by /api/documents
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureUser(userId);

        const db = getDb();

        // User details
        const [user] = await db
            .select({
                id: users.id,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);



        const [documentStats] = await db
            .select({
                totalDocuments: count(),
                readyDocuments: sql`
      count(*) filter (
        where ${documents.status} = 'ready'
      )
    `.mapWith(Number),
                failedDocuments: sql`
      count(*) filter (
        where ${documents.status} = 'failed'
      )
    `.mapWith(Number),
                pendingDocuments: sql`
      count(*) filter (
        where ${documents.status} = 'pending'
      )
    `.mapWith(Number),
            })
            .from(documents)
            .where(eq(documents.userId, userId));

        // Conversation count
        const [conversationStats] = await db
            .select({
                totalConversations: count(),
            })
            .from(conversations)
            .where(eq(conversations.userId, userId));

        // Latest four documents
        const latestDocuments = await db
            .select({
                id: documents.id,
                name: documents.name,
                fileName: documents.fileName,
                fileSize: documents.fileSize,
                status: documents.status,
                errorMessage: documents.errorMessage,
                createdAt: documents.createdAt,
            })
            .from(documents)
            .where(eq(documents.userId, userId))
            .orderBy(desc(documents.createdAt))
            .limit(4);

        return NextResponse.json({
            user,
            stats: {
                totalDocuments: Number(documentStats.totalDocuments),
                readyDocuments: Number(documentStats.readyDocuments),
                failedDocuments: Number(documentStats.failedDocuments),
                pendingDocuments: Number(documentStats.pendingDocuments),
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
