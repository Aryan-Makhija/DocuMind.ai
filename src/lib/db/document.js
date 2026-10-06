// This file is used for the document id validation for when user selects a  particular document to chat we will verify the document id is that actually exists with that particular user uploaded documents or not , in order to avoid the mis match of the documetns of multiper users 

import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "./index";
import { documents } from "./schema";

export async function verifyUserDocuments({
    userId,
    documentIds,
}) {
    if (
        !documentIds ||
        documentIds.length === 0
    ) {
        return true;
    }

    const db = getDb();

    const result = await db
        .select({
            id: documents.id,
        })
        .from(documents)
        .where(
            and(
                eq(documents.userId, userId),
                inArray(documents.id, documentIds)
            )
        );

    return result.length === documentIds.length;
}