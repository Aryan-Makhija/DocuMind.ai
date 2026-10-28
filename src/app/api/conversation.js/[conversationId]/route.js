import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  conversations,
  messages,
} from "@/lib/db/schema";

export async function GET(request, { params }) {
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

    // Next.js 15/16: params is a Promise
    const { conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "Conversation ID is required",
          code: "INVALID_CONVERSATION_ID",
        },
        { status: 400 }
      );
    }

    const db = getDb();

    // 2. Verify conversation ownership
    const [conversation] = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found",
          code: "CONVERSATION_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 3. Fetch messages for the verified conversation
    const conversationMessages = await db
      .select({
        id: messages.id,
        role: messages.role,
        content: messages.content,
        createdAt: messages.createdAt,
        sources:messages.sources,
        sequence:messages.sequence
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt), asc(messages.id));

     
    // 4. Return conversation and messages
    return NextResponse.json(
      {
        conversation,
        messages: conversationMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch conversation messages:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch conversation messages",
        code: "INTERNAL_SERVER_ERROR",              
      },
      { status: 500 }
    );
  }
}