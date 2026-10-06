// import { NextResponse } from "next/server";
// import fs from "fs/promises";
// import path from "path";
// import os from "os";
// import { randomUUID } from "crypto";
// import { auth } from "@clerk/nextjs/server";
// import { processPdf } from "@/lib/rag/ingestion/processPdf";
// import { ensureUser } from "@/lib/db/users";
// import { getDb } from "@/lib/db";
// import { documents } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import {
//     validatePdfFile,
// } from "@/lib/validation/upload";

// export async function POST(request) {
//     try {

//         const { userId } = await auth();

//         if (!userId) {
//             return NextResponse.json(
//                 {
//                     error: "Unauthorized",
//                 },
//                 {
//                     status: 401,
//                 }
//             );
//         }
//         await ensureUser(userId);
//         const formData = await request.formData();

//         const file = formData.get("file");
//         if (!file) {
//             return NextResponse.json(
//                 { error: "No file provided" },
//                 { status: 400 }
//             );
//         }

//         // file validation
//         const validation =
//             await validatePdfFile(file);

//         if (!validation.valid) {
//             return NextResponse.json(
//                 {
//                     error: validation.error,
//                 },
//                 {
//                     status: 400,
//                 }
//             );
//         }

//         if (file.type !== "application/pdf") {
//             return NextResponse.json(
//                 { error: "Only PDF files are supported" },
//                 { status: 400 }
//             );
//         }

//         const MAX_FILE_SIZE = 10 * 1024 * 1024;

//         if (file.size > MAX_FILE_SIZE) {
//             return NextResponse.json(
//                 { error: "File size cannot exceed 10MB" },
//                 { status: 400 }
//             );
//         }

//         const documentId = randomUUID();
//         const db = getDb();

//         await db.insert(documents).values({
//             id: documentId,
//             userId,
//             name: file.name,
//             fileName: file.name,
//             fileSize: file.size,
//             status: DOCUMENT_STATUS.PROCESSING,
//         });

//         const tempDir = os.tmpdir();

//         const filePath = path.join(
//             tempDir,
//             `${documentId}.pdf`
//         );

//         const buffer = Buffer.from(
//             await file.arrayBuffer()
//         );

//         await fs.writeFile(filePath, buffer);

//         const result = await processPdf(filePath, {
//             userId,
//             documentId,
//             documentName: file.name,
//         });


//         await db
//             .update(documents)
//             .set({
//                 status: "ready",
//                 updatedAt: new Date(),
//             })
//             .where(eq(documents.id, documentId));
//         await fs.unlink(filePath);

//         return NextResponse.json({
//             success: true,
//             documentId,
//             fileName: file.name,
//             ...result,
//         });

//     } catch (error) {
//         console.error("PDF processing error:", error);

//         return NextResponse.json(
//             {
//                 error: "Failed to process PDF",
//             },
//             { status: 500 }
//         );
//     }
// }


import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { processPdf } from "@/lib/rag/ingestion/processPdf";
import { ensureUser } from "@/lib/db/users";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";

import {
    validatePdfFile,
} from "@/lib/validation/upload";

import {
    DOCUMENT_STATUS,
} from "@/lib/document/status";

import {
    deleteDocumentVectors,
} from "@/lib/rag/vectorstore/pinecone";


import { rateLimit } from "@/lib/rateLimit";
import { AppError } from "@/lib/errors/AppError";

import { getFileHash } from "@/lib/document/hash";
import { and } from "drizzle-orm";

export async function POST(request) {
    let documentId = null;
    let filePath = null;

    try {
        const { userId } = await auth();

        if (!userId) {
            throw new AppError("Unauthorized", {
                code: "UNAUTHORIZED",
                status: 401,
            });
        }

        const rate = await rateLimit({
            key: `upload:${userId}`,
            limit: 5,
            windowSeconds: 60,
        });

        if (!rate.allowed) {
            return NextResponse.json(
                {
                    error: {
                        code: "RATE_LIMITED",
                        message: "Too many uploads. Please try again later.",
                    },
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(rate.retryAfter),
                    },
                }
            );
        }

        await ensureUser(userId);

        const formData = await request.formData();

        const file = formData.get("file");

        if (!file) {
            throw new AppError("Invalid file", {
                code: "INVALID_FILE",
                status: 400,
            });
        }

        // Validate PDF
        const validation =
            await validatePdfFile(file);

        if (!validation.valid) {
            return NextResponse.json(
                {
                    error: validation.error,
                },
                {
                    status: 400,
                }
            );
        }

        // Create document record
        // Create temporary file
        documentId = randomUUID();

        const tempDir = os.tmpdir();

        filePath = path.join(
            tempDir,
            `${documentId}.pdf`
        );

        const buffer = Buffer.from(
            await file.arrayBuffer()
        );

        await fs.writeFile(
            filePath,
            buffer
        );

        // Calculate SHA-256 hash
        const documentHash = await getFileHash(filePath);

        const db = getDb();

        // Check whether this user already uploaded
        // the exact same PDF
        const existingDocument = await db
            .select({
                id: documents.id,
            })
            .from(documents)
            .where(
                and(
                    eq(documents.userId, userId),
                    eq(documents.documentHash, documentHash)
                )
            )
            .limit(1);

        if (existingDocument.length > 0) {
            throw new AppError(
                "This document has already been uploaded.",
                {
                    code: "DUPLICATE_DOCUMENT",
                    status: 409,
                }
            );
        }

        // Create document record
        await db.insert(documents).values({
            id: documentId,
            userId,
            name: file.name,
            fileName: file.name,
            fileSize: file.size,
            documentHash,
            status: DOCUMENT_STATUS.PROCESSING,
            errorMessage: null,
        });

        // Process PDF
        const result = await processPdf(
            filePath,
            {
                userId,
                documentId,
                documentName: file.name,
            }
        );

        // Processing successful
        await db
            .update(documents)
            .set({
                status:
                    DOCUMENT_STATUS.READY,
                errorMessage: null,
                updatedAt: new Date(),
            })
            .where(
                eq(
                    documents.id,
                    documentId
                )
            );

        return NextResponse.json({
            success: true,
            documentId,
            fileName: file.name,
            ...result,
        });
    } catch (error) {
        console.error(
            "PDF processing error:",
            error
        );

        // Mark document as failed
        if (documentId) {
            try {
                const db = getDb();

                // Remove any partially stored vectors
                await deleteDocumentVectors({
                    userId:
                        (await auth()).userId,
                    documentId,
                });

                await db
                    .update(documents)
                    .set({
                        status:
                            DOCUMENT_STATUS.FAILED,

                        errorMessage:
                            error instanceof Error
                                ? error.message
                                : "Document processing failed",

                        updatedAt:
                            new Date(),
                    })
                    .where(
                        eq(
                            documents.id,
                            documentId
                        )
                    );
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up document:",
                    cleanupError
                );
            }
        }

        return NextResponse.json(
            {
                error:
                    "Failed to process PDF",
            },
            {
                status: 500,
            }
        );
    } finally {
        // Always remove temporary file
        if (filePath) {
            try {
                await fs.unlink(
                    filePath
                );
            } catch (cleanupError) {
                // File may already have been removed.
                console.error(
                    "Temporary file cleanup failed:",
                    cleanupError
                );
            }
        }
    }
}