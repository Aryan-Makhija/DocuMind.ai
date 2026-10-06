import { z } from "zod";

export const chatRequestSchema = z.object({
    question: z
        .string()
        .trim()
        .min(1, "Question is required")
        .max(2000, "Question is too long"),

    conversationId: z
        .string()
        .uuid()
        .nullable()
        .optional(),

    documentIds: z
        .array(z.string().uuid())
        .max(20)
        .refine(
            (ids) =>
                new Set(ids).size === ids.length,
            {
                message:
                    "Duplicate document IDs are not allowed",
            }
        )
        .optional()
        .default([]),
});