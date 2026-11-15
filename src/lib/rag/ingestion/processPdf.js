
// IN this file we are writing the code for the pdf upload and creating the metadeta for it .Aslo chunking of the data is also done 

// import { ocrPdfPages } from "@/lib/ocr/ocrPdfPages";

// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { getVectorStore } from "../vectorstore/pinecone";

// export async function processPdf(filePath, metadata) {
//   const loader = new PDFLoader(filePath);

//   const documents = await loader.load();

//   console.log(`Extracted ${documents.length} pages`);

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });

//   const chunks = await splitter.splitDocuments(documents);

//   console.log(`Created ${chunks.length} chunks`);

//   const enrichedChunks = chunks.map((chunk, index) => {
//     return {
//       ...chunk,
//       metadata: {
//         ...chunk.metadata,

//         userId: metadata.userId,
//         documentId: metadata.documentId,
//         documentName: metadata.documentName,

//         chunkIndex: index,

//         pageNumber:
//           chunk.metadata?.loc?.pageNumber ??
//           chunk.metadata?.pageNumber ??
//           null,
//       },
//     };
//   });

//   const vectorStore = await getVectorStore();

//   await vectorStore.addDocuments(enrichedChunks);

//   console.log(`Stored ${enrichedChunks.length} vectors`);

//   return {
//     pages: documents.length,
//     chunks: enrichedChunks.length,
//   };
// }



// New updated ProcessPDf File adding the OCR Feature To render the page to ocr when their is not text in the chunk to extract text from the image or sacnned pdfs 



// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { Document } from "@langchain/core/documents";

// import { getVectorStore } from "../vectorstore/pinecone";
// import { getPdfPageCount, ocrPdfPages } from "@/lib/ocr/ocrPdfPages";

// export async function processPdf(filePath, metadata) {
//   // 1. Extract existing digital text.
//   const loader = new PDFLoader(filePath);
//   const documents = await loader.load();

//   // 2. Independently identify the actual PDF page count.
//   const totalPages = await getPdfPageCount(filePath);

//   console.log(`PDF contains ${totalPages} pages`);
//   console.log(`PDFLoader extracted ${documents.length} pages`);

//   // 3. Identify pages requiring OCR.
//   let emptyPageIndexes;

//   if (documents.length === 0) {
//     // PDFLoader returned no pages.
//     // Treat every PDF page as requiring OCR.
//     emptyPageIndexes = Array.from(
//       { length: totalPages },
//       (_, index) => index
//     );
//   } else {
//     emptyPageIndexes = documents
//       .map((doc, index) =>
//         doc.pageContent?.trim() ? null : index
//       )
//       .filter((index) => index !== null);
//   }

//   console.log(`Pages requiring OCR: ${emptyPageIndexes.length}`);

//   // 4. Run OCR.
//   let ocrPages = new Map();

//   if (emptyPageIndexes.length > 0) {
//     ocrPages = await ocrPdfPages(
//       filePath,
//       emptyPageIndexes
//     );
//   }

//   // 5. Construct page documents.
//   let pageDocuments;

//   if (documents.length === 0) {
//     // Create LangChain Documents from OCR results.
//     pageDocuments = Array.from(
//       { length: totalPages },
//       (_, index) => {
//         const pageNumber = index + 1;
//         const pageContent = ocrPages.get(index) ?? "";

//         return new Document({
//           pageContent,
//           metadata: {
//             pageNumber,
//             extractionMethod: "ocr",
//           },
//         });
//       }
//     );
//   } else {
//     // Preserve existing digital documents and replace
//     // empty pages with OCR results.
//     pageDocuments = documents.map((doc, index) => {
//       if (ocrPages.has(index)) {
//         return new Document({
//           pageContent: ocrPages.get(index) ?? "",
//           metadata: {
//             ...doc.metadata,
//             pageNumber: index + 1,
//             extractionMethod: "ocr",
//           },
//         });
//       }

//       return new Document({
//         pageContent: doc.pageContent,
//         metadata: {
//           ...doc.metadata,
//           pageNumber:
//             doc.metadata?.loc?.pageNumber ??
//             doc.metadata?.pageNumber ??
//             index + 1,
//           extractionMethod: "pdf-text",
//         },
//       });
//     });
//   }

//   // 6. Remove pages that remain empty after OCR.
//   const usableDocuments = pageDocuments.filter(
//     (doc) => doc.pageContent?.trim()
//   );

//   console.log(
//     `Successfully extracted ${usableDocuments.length} pages`
//   );

//   if (usableDocuments.length === 0) {
//     throw new Error(
//       "No readable text could be extracted from this PDF."
//     );
//   }

//   // 7. Existing chunking.
//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });

//   const chunks = await splitter.splitDocuments(
//     usableDocuments
//   );

//   console.log(`Created ${chunks.length} chunks`);

//   // 8. Existing metadata enrichment.
//   const enrichedChunks = chunks.map((chunk, index) => ({
//     ...chunk,
//     metadata: {
//       ...chunk.metadata,

//       userId: metadata.userId,
//       documentId: metadata.documentId,
//       documentName: metadata.documentName,

//       chunkIndex: index,

//       pageNumber:
//         chunk.metadata?.loc?.pageNumber ??
//         chunk.metadata?.pageNumber ??
//         null,
//     },
//   }));

//   // 9. Existing Pinecone storage.
//   const vectorStore = await getVectorStore();

//   await vectorStore.addDocuments(enrichedChunks);

//   console.log(`Stored ${enrichedChunks.length} vectors`);

//   return {
//     pages: totalPages,
//     ocrPages: ocrPages.size,
//     chunks: enrichedChunks.length,
//   };
// }







// Debugging each stage one by one 


// import { debugCanvasBuffer, debugCanvasCreation, debugPdfJsLoading, debugPdfPageRendering, debugTesseract, ocrPdfPages } from "@/lib/ocr/ocrPdfPages";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { debugRenderedImageBuffer } from "../../ocr/ocrPdfPages";

// export async function processPdf(filePath, metadata) {
// console.log("\n========== STAGE 1 ==========");
// console.log("[PDFLoader] Starting PDF extraction");

// try {
//   const loader = new PDFLoader(filePath);

//   const documents = await loader.load();

//   console.log("[PDFLoader] Extraction completed");
//   console.log("[PDFLoader] Documents returned:", documents.length);

//   const emptyPages = [];

//   for (let index = 0; index < documents.length; index++) {
//     const doc = documents[index];

//     const pageNumber =
//       doc.metadata?.loc?.pageNumber ??
//       doc.metadata?.pageNumber ??
//       index + 1;

//     const hasText = Boolean(
//       doc.pageContent?.trim()
//     );

//     console.log(
//       `[PDFLoader] Page ${pageNumber}: ${hasText ? "TEXT FOUND" : "EMPTY"
//       }`
//     );

//     if (!hasText) {
//       emptyPages.push(pageNumber);
//     }
//   }

//   console.log(
//     "[PDFLoader] Empty pages:",
//     emptyPages
//   );

//   console.log("========== STAGE 1 COMPLETE ==========\n");
//   // await debugPdfJsLoading(filePath);
//   // await debugCanvasCreation();
//   await debugPdfPageRendering(filePath);


//   return {
//     totalDocuments: documents.length,
//     emptyPages,
//   };
// await debugPdfPageRendering(filePath)
// await debugRenderedImageBuffer(filePath);
// await debugTesseract(filePath);
// await ocrPdfPages(filePath, [0]);

// } catch (error) {
//   console.error("[PDFLoader] FAILED");
//   console.error(error);

//   throw error;
// }
// }



// export async function processPdf(filePath, metadata) {


//   const scannedPageIndexes = Array.from(
//     { length: 10 },
//     (_, index) => index
//   );
//   const results = await ocrPdfPages(filePath, scannedPageIndexes);

//   console.log("\n========== OCR RESULTS ==========");

//   // for (const [pageIndex, text] of results) {
//   //   console.log(`Page ${pageIndex + 1}:`);
//   //   console.log(text);
//   // }

//   console.log("Total pages processed:", results.size);
// }






// New Pipeline for process pdf 

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

import { getVectorStore } from "../vectorstore/pinecone";
import { getPdfPageCount, ocrPdfPages } from "@/lib/ocr/ocrPdfPages";

export async function processPdf(filePath, metadata) {

    // 1. Extract digital PDF text.
    console.log("[Ingestion] Starting PDF text extraction");

    const loader = new PDFLoader(filePath);
    const documents = await loader.load();

    // 2. Get actual PDF page count.
    const totalPages = await getPdfPageCount(filePath);

    console.log("[Ingestion] Total PDF pages:", totalPages);
    console.log("[Ingestion] PDFLoader documents:", documents.length);

    // 3. Map extracted documents to their original PDF page numbers.
    const documentsByPageNumber = new Map();

    for (let index = 0; index < documents.length; index++) {

        const doc = documents[index];

        const pageNumber =
            doc.metadata?.loc?.pageNumber ??
            doc.metadata?.pageNumber ??
            (documents.length === totalPages ? index + 1 : null);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            pageNumber > totalPages
        ) {
            throw new Error(
                `Invalid or missing PDF page number for document ${index}`
            );
        }

        documentsByPageNumber.set(pageNumber, doc);
    }

    // 4. Identify pages that need OCR.
    const pagesRequiringOCR = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {

        const doc = documentsByPageNumber.get(pageNumber);

        if (!doc?.pageContent?.trim()) {
            pagesRequiringOCR.push(pageNumber - 1);
        }
    }

    console.log(
        "[Ingestion] Pages requiring OCR:",
        pagesRequiringOCR.map(index => index + 1)
    );

    // 5. Run OCR sequentially through ocrPdfPages.
    let ocrPages = new Map();

    if (pagesRequiringOCR.length > 0) {

        ocrPages = await ocrPdfPages(
            filePath,
            pagesRequiringOCR
        );
    }

    // 6. Construct documents in original PDF page order.
    const pageDocuments = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {

        const originalDoc = documentsByPageNumber.get(pageNumber);

        const ocrText = ocrPages.get(pageNumber - 1);

        const hasOCRText = Boolean(ocrText?.trim());

        const pageContent = hasOCRText
            ? ocrText
            : originalDoc?.pageContent ?? "";

        const extractionMethod = hasOCRText
            ? "ocr"
            : pageContent.trim()
                ? "pdf-text"
                : "none";

        pageDocuments.push(
            new Document({
                pageContent,
                metadata: {
                    ...originalDoc?.metadata,
                    pageNumber,
                    extractionMethod,
                },
            })
        );
    }

    // 7. Remove pages without readable text.
    const usableDocuments = pageDocuments.filter(
        doc => doc.pageContent?.trim()
    );

    console.log(
        "[Ingestion] Successfully extracted pages:",
        usableDocuments.length
    );

    console.log(
        "[Ingestion] OCR pages:",
        ocrPages.size
    );

    if (usableDocuments.length === 0) {
        throw new Error(
            "No readable text could be extracted from this PDF."
        );
    }

    // 8. Existing chunking logic.
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(
        usableDocuments
    );

    console.log("[Ingestion] Created chunks:", chunks.length);

    // 9. Existing metadata enrichment.
    const enrichedChunks = chunks.map((chunk, index) => ({
        ...chunk,
        metadata: {
            ...chunk.metadata,
            userId: metadata.userId,
            documentId: metadata.documentId,
            documentName: metadata.documentName,
            chunkIndex: index,
            pageNumber:
                chunk.metadata?.loc?.pageNumber ??
                chunk.metadata?.pageNumber ??
                null,
        },
    }));

    // 10. Existing Pinecone storage.
    const vectorStore = await getVectorStore();

    await vectorStore.addDocuments(enrichedChunks);

    console.log(
        "[Ingestion] Stored vectors:",
        enrichedChunks.length
    );

    return {
        pages: totalPages,
        ocrPages: ocrPages.size,
        chunks: enrichedChunks.length,
    };
}
