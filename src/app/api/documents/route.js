import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { handleApiError } from "@/lib/errors/errorHandler";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import {
    deleteDocumentVectors,
} from "@/lib/rag/vectorstore/pinecone";
import { AppError } from "@/lib/errors/AppError";
import { DOCUMENT_STATUS } from "@/lib/document/status";
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const db = getDb();

        const userDocuments = await db
            .select({
                id: documents.id,
                name: documents.name,
                fileName: documents.fileName,
                fileSize: documents.fileSize,
                status: documents.status,
                eerrorMessage: documents.errorMessage,
                createdAt: documents.createdAt,
            })
            .from(documents)
            .where(eq(documents.userId, userId));

        return NextResponse.json({
            documents: userDocuments,
        });
    } catch (error) {
        console.error(
            "Failed to fetch documents:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to fetch documents",
            },
            {
                status: 500,
            }
        );
    }
}




export async function DELETE(request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new AppError("Unauthorized", {
                code: "UNAUTHORIZED",
                status: 401,
            });
        }

        const body = await request.json();

        const documentId = body.documentId;

        if (!documentId) {
            return NextResponse.json(
                {
                    error: "documentId is required",
                },
                {
                    status: 400,
                }
            );
        }

        const db = getDb();

        const document = await db
            .select()
            .from(documents)
            .where(
                and(
                    eq(documents.id, documentId),
                    eq(documents.userId, userId)
                )
            )
            .limit(1);

        if (document.length === 0) {
            throw new AppError("Document not found", {
                code: "DOCUMENT_NOT_FOUND",
                status: 404,
            });
        }

        await db
            .update(documents)
            .set({
                status: DOCUMENT_STATUS.DELETING,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(documents.id, documentId),
                    eq(documents.userId, userId)
                )
            );

        // Pinecone deletion will be added here.
        await deleteDocumentVectors({
            userId,
            documentId,
        });

        await db
            .delete(documents)
            .where(
                and(
                    eq(documents.id, documentId),
                    eq(documents.userId, userId)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        return handleApiError(error, "DELETE_DOCUMENT");
    }
}