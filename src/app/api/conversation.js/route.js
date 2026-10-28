import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";



import { ensureUser } from "@/lib/db/users";
import { createConversation } from "@/lib/chat/conversation";
import { conversations } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await ensureUser(userId);

    const body = await request.json();

    const conversationId =
      await createConversation({
        userId,
        title: body.title,
      });

    return NextResponse.json({
      conversationId,
    });
  } catch (error) {
    console.error(
      "Conversation creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create conversation",
      },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    // 1. Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const db = getDb();

    // 2. Fetch only the authenticated user's conversations
    const userConversations = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));

    // 3. Return conversations
    return NextResponse.json(
      {
        conversations: userConversations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch conversations:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch conversations",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}