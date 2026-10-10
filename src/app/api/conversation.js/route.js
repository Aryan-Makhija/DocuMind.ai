import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";



import { ensureUser } from "@/lib/db/users";
import { createConversation } from "@/lib/chat/conversation";

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