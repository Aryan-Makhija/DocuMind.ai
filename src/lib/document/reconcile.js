// This is file is made to handel the status of the file upload or delete when there is a server error and the process gts stucked in between than after waiting for few  time the status is set to failed automatically in order to not handle the status processing loop 


import { and, eq, lt, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { DOCUMENT_STATUS } from "@/lib/document/status";
import { deleteDocumentVectors } from "@/lib/rag/vectorstore/pinecone";

export async function reconcileDocuments({
  staleMinutes = 30,
} = {}) {
  const db = getDb();

  const cutoff = new Date(
    Date.now() - staleMinutes * 60 * 1000
  );

  const staleDocuments = await db
    .select()
    .from(documents)
    .where(
      and(
        inArray(documents.status, [
          DOCUMENT_STATUS.PROCESSING,
          DOCUMENT_STATUS.DELETING,
        ]),
        lt(documents.updatedAt, cutoff)
      )
    );

  const results = [];

  for (const document of staleDocuments) {
    try {
      if (
        document.status === DOCUMENT_STATUS.PROCESSING
      ) {
        // Remove any vectors that may have been
        // partially inserted before the process stopped.
        await deleteDocumentVectors({
          userId: document.userId,
          documentId: document.id,
        });

        await db
          .update(documents)
          .set({
            status: DOCUMENT_STATUS.FAILED,
            errorMessage:
              "Document processing timed out or was interrupted.",
            updatedAt: new Date(),
          })
          .where(
            eq(documents.id, document.id)
          );

        results.push({
          documentId: document.id,
          action: "marked_failed",
        });
      }

      if (
        document.status === DOCUMENT_STATUS.DELETING
      ) {
        // Retry vector deletion.
        await deleteDocumentVectors({
          userId: document.userId,
          documentId: document.id,
        });

        // Only remove the DB record after
        // Pinecone cleanup succeeds.
        await db
          .delete(documents)
          .where(
            eq(documents.id, document.id)
          );

        results.push({
          documentId: document.id,
          action: "deleted",
        });
      }
    } catch (error) {
      console.error(
        `Failed to reconcile document ${document.id}:`,
        error
      );

      results.push({
        documentId: document.id,
        action: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Reconciliation failed",
      });
    }
  }

  return {
    checked: staleDocuments.length,
    results,
  };
}