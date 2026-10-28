import {
  pgTable,
  text,
  timestamp,
  integer,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  name: text("name").notNull(),

  fileName: text("file_name").notNull(),

  fileSize: integer("file_size"),

  status: text("status")
    .notNull()
    .default("pending"),


  errorMessage: text("error_message").default("Pending"),

  documentHash: text("document_hash").notNull(),


  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
},
  (table) => ({
    userDocumentHashUnique: unique(
      "documents_user_hash_unique"
    ).on(table.userId, table.documentHash),
  }));

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id),

  title: text("title"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),

  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),

  role: text("role").notNull(),

  content: text("content").notNull(),
  // Added to maintain the messages sequence for ui 
  sequence: integer("sequence")
    .generatedAlwaysAsIdentity(),

  sources: jsonb("sources")
    .default([])
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

});