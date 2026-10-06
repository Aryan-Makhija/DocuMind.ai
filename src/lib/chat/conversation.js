import { randomUUID } from "crypto";
import { eq, and, desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  conversations,
  messages,
} from "@/lib/db/schema";

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

  return db
    .select()
    .from(messages)
    .where(
      eq(
        messages.conversationId,
        conversationId
      )
    )
    .orderBy(messages.createdAt);
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