import { randomUUID } from "crypto";
import { eq, and, desc, asc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  conversations,
  messages,
} from "@/lib/db/schema";
import { AppError } from "../errors/AppError";
import { neon } from "@neondatabase/serverless";

export async function createConversation({
  userId,
  title,
}) {
  const db = getDb();

  const conversationId = randomUUID();

  await db.insert(conversations).values({
    id: conversationId,
    userId,
    title: title || "New conversation",
  });

  return conversationId;
}

export async function getConversation({
  conversationId,
  userId,
}) {
  const db = getDb();

  const result = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, userId)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function getMessages({
  conversationId,
  userId,
}) {
  const db = getDb();

  const conversation = await getConversation({
    conversationId,
    userId,
  });

  if (!conversation) {
    return [];
  }

  const result = await db
    .select()
    .from(messages)
    .where(
      eq(
        messages.conversationId,
        conversationId
      )
    )
    .orderBy(asc(messages.sequence));

  console.log("[Get messages Debug]", result);
  return result;
}

export async function addMessage({
  conversationId,
  role,
  content,
}) {
  const db = getDb();

  await db.insert(messages).values({
    id: randomUUID(),
    conversationId,
    role,
    content,
  });
}


export async function saveConversationTurn({
  userId,
  conversationId,
  question,
  answer,
  sources = []
}) {
  const sql = neon(process.env.DATABASE_URL);

  const activeConversationId =
    conversationId || crypto.randomUUID();

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  const queries = [];

  const sourcesJson = JSON.stringify(sources);
  // Create a conversation only when starting a new chat
  if (!conversationId) {
    queries.push(
      sql`
        INSERT INTO conversations (
          id,
          user_id,
          title,
          created_at,
          updated_at
        )
        VALUES (
          ${activeConversationId},
          ${userId},
          ${question.slice(0, 60)},
          NOW(),
          NOW()
        )
      `
    );
  }

  // Save both messages in one INSERT statement
  // queries.push(
  //   sql`
  //     INSERT INTO messages (
  //       id,
  //       conversation_id,
  //       role,
  //       content,
  //       sources,
  //       created_at
  //     )
  //     SELECT
  //       message.id,
  //       ${activeConversationId},
  //       message.role,
  //       message.content,
  //       NOW()
  //     FROM (
  //       VALUES
  //         (
  //           ${userMessageId}::text,
  //           'user'::text,
  //           ${question}::text
  //         ),
  //         (
  //           ${assistantMessageId}::text,
  //           'assistant'::text,
  //           ${answer}::text
  //         )
  //     ) AS message(id, role, content)
  //     INNER JOIN conversations AS c
  //       ON c.id = ${activeConversationId}
  //      AND c.user_id = ${userId}
  //      RETURNING ID
  //   `
  // );


queries.push(
  sql`
    INSERT INTO messages (
      id,
      conversation_id,
      role,
      content,
      sources,
      created_at
    )
    SELECT
      message.id,
      ${activeConversationId},
      message.role,
      message.content,
      message.sources::jsonb,
      NOW()
    FROM (
      VALUES
        (
          1,
          ${userMessageId}::text,
          'user'::text,
          ${question}::text,
          '[]'::text
        ),
        (
          2,
          ${assistantMessageId}::text,
          'assistant'::text,
          ${answer}::text,
          ${JSON.stringify(sources ?? [])}::text
        )
    ) AS message(
      position,
      id,
      role,
      content,
      sources
    )
    INNER JOIN conversations AS c
      ON c.id = ${activeConversationId}
      AND c.user_id = ${userId}
    ORDER BY message.position
    RETURNING id, sequence, role, sources
  `
);

  // Update the conversation timestamp
  queries.push(
    sql`
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${activeConversationId}
        AND user_id = ${userId}
    `
  );

  const results = await sql.transaction(queries);

  const messageInsertIndex = conversationId ? 0 : 1;

  const insertedMessages = results[messageInsertIndex];

  console.log("[TRANSACTION DEBUG]", {
    conversationId: activeConversationId,
    isNewConversation: !conversationId,
    insertedMessages,
  });

  if (insertedMessages.length !== 2) {
    throw new Error(
      "Conversation messages were not saved"
    );
  }

  return activeConversationId;
}