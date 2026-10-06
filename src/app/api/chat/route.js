import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { answerQuestion } from "@/lib/rag/answer";

import {
  createConversation,
  getConversation,
  getMessages,
  addMessage,
} from "@/lib/chat/conversation";
import {
  verifyUserDocuments,
} from "@/lib/db/document";
import { ensureUser } from "@/lib/db/users";
import {
  chatRequestSchema,
} from "@/lib/validation/chat";
import { rateLimit } from "@/lib/rateLimit";
import { handleApiError } from "@/lib/errors/errorHandler";
import { AppError } from "@/lib/errors/AppError";

export async function POST(request) {
  try {
    const requestStart = performance.now();
    const { userId } = await auth();

    if (!userId) {
      throw new AppError("Unauthorized", {
        code: "UNAUTHORIZED",
        status: 401,
      });
    }


    const rate = await rateLimit({
      key: `chat:${userId}`,
      limit: 20,
      windowSeconds: 60,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfter),
          },
        }
      );
    }





    console.log(
      `[CHAT] authentication: ${(
        performance.now() - requestStart
      ).toFixed(0)}ms`
    );
    await ensureUser(userId);
    const body = await request.json();

    const parsed =
      chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("Invalid request", {
        code: "INVALID_REQUEST",
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const {
      question,
      documentIds,
      conversationId: requestedConversationId,
    } =
      parsed.data;

    let conversationId =
      requestedConversationId;

    // Document id validation step 
    const documentsAreValid =
      await verifyUserDocuments({
        userId,
        documentIds,
      });

    if (!documentsAreValid) {
      throw new AppError(
        "One or more selected documents do not belong to this user",
        {
          code: "DOCUMENT_ACCESS_DENIED",
          status: 403,
        }
      );
    }


    if (!question) {
      throw new AppError("Question is required", {
        code: "QUESTION_REQUIRED",
        status: 400,
      });
    }
    // Create conversation if needed
    if (!conversationId) {
      conversationId =
        await createConversation({
          userId,
          title: question.slice(0, 60),
        });
    }

    // Verify ownership
    const conversation =
      await getConversation({
        conversationId,
        userId,
      });

    if (!conversation) {
      throw new AppError("Conversation not found", {
        code: "CONVERSATION_NOT_FOUND",
        status: 404,
      });
    }

    const previousMessages =
      await getMessages({
        conversationId,
        userId,
      });

    const history =
      previousMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const result =
      await answerQuestion({
        question,
        userId,
        documentIds,
        history,
      });

    // Store user message
    await addMessage({
      conversationId,
      role: "user",
      content: question,
    });

    // Store assistant message
    await addMessage({
      conversationId,
      role: "assistant",
      content: result.answer,
    });

    return NextResponse.json({
      conversationId,
      answer: result.answer,
      sources: result.sources,
    });

  } catch (error) {

    return handleApiError(error, "CHAT");

  }
}