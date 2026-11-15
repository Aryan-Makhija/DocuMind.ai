
import fs from "node:fs/promises";

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";

export async function ocrPdfPages(filePath, pageIndexes) {
    if (!pageIndexes.length) {
        return new Map();
    }

    console.log("\n========== OCR PIPELINE ==========");

    let pdf;
    let worker;

    const extractedPages = new Map();

    try {
        // 1. Load PDF.
        const fileBuffer = await fs.readFile(filePath);

        const loadingTask = getDocument({
            data: new Uint8Array(fileBuffer),
            useSystemFonts: true,
            isEvalSupported: false,
        });

        pdf = await loadingTask.promise;

        console.log("[OCR] PDF loaded:", pdf.numPages, "pages");

        // 2. Initialize one worker for all requested pages.
        worker = await createWorker("eng");

        console.log("[OCR] Tesseract worker initialized");

        // 3. Process pages sequentially.
        for (const pageIndex of pageIndexes) {
            const pageNumber = pageIndex + 1;

            let page;

            try {
                console.log(`[OCR] Processing page ${pageNumber}`);

                // Retrieve PDF page.
                page = await pdf.getPage(pageNumber);

                // Calculate rendering dimensions.
                const viewport = page.getViewport({
                    scale: 1,
                });

                // Create canvas.
                const canvas = createCanvas(
                    Math.ceil(viewport.width),
                    Math.ceil(viewport.height)
                );

                const context = canvas.getContext("2d");

                // Render PDF page.
                await page.render({
                    canvasContext: context,
                    viewport,
                }).promise;

                // Convert to PNG.
                const imageBuffer = canvas.toBuffer("image/png");

                // Perform OCR.
                const result = await worker.recognize(imageBuffer);

                const extractedText = result.data.text.trim();

                extractedPages.set(pageIndex, extractedText);

                console.log(
                    `[OCR] Page ${pageNumber}: ${extractedText.length} characters`
                );

                // Release page resources.
                page.cleanup();

            } catch (error) {
                console.error(
                    `[OCR] Failed to process page ${pageNumber}`,
                    error
                );

                throw error;

            } finally {
                page?.cleanup();
            }
        }

        console.log("[OCR] All requested pages processed");

        return extractedPages;

    } finally {
        await worker?.terminate();
        await pdf?.destroy();

        console.log("========== OCR PIPELINE COMPLETE ==========\n");
    }
}

export async function getPdfPageCount(filePath) {
    const fileBuffer = await fs.readFile(filePath);

    const loadingTask = getDocument({
        data: new Uint8Array(fileBuffer),
        useSystemFonts: true,
        isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;

    try {
        return pdf.numPages;
    } finally {
        await pdf.destroy();
    }
}
