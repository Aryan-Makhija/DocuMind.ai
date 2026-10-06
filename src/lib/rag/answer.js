import { retrieveDocuments } from "./retrieval/retrieve";
import { chatModel } from "./generation/gemini";
import { ragPrompt } from "./generation/prompt";
import { formatDocuments } from "./generation/context";
import { rewriteQuery } from "./generation/rewriteQuery";
import {
    createTimer,
} from "@/lib/utils/timing";


export async function answerQuestion({
    question,
    userId,
    documentIds = [],
    history = [],
}) {
    const totalTimer =
        createTimer("RAG TOTAL");

    const rewriteTimer =
        createTimer("QUERY REWRITE");

    const rewrittenQuestion =
        await rewriteQuery({
            question,
            history,
        });

    rewriteTimer.end();

    console.log(
        "Original question:",
        question
    );

    console.log(
        "Rewritten question:",
        rewrittenQuestion
    );

    const retrievalTimer =
        createTimer("RETRIEVAL");

    const documents =
        await retrieveDocuments({
            query: rewrittenQuestion,
            userId,
            documentIds,
        });

    retrievalTimer.end();

    if (documents.length === 0) {
        totalTimer.end();

        return {
            answer:
                "I couldn't find relevant information in your uploaded documents.",
            sources: [],
        };
    }

    const context =
        formatDocuments(documents);

    const generationTimer =
        createTimer("LLM GENERATION");

    const conversationHistory =
        history
            .map(
                (message) =>
                    `${message.role}: ${message.content}`
            )
            .join("\n");

    const messages =
        await ragPrompt.formatMessages({
            context,
            question,
            history: conversationHistory,
        });

    const response =
        await chatModel.invoke(messages);

    generationTimer.end();

    const sources =
        documents.map((document) => ({
            documentName:
                document.metadata?.documentName ||
                "Unknown",

            documentId:
                document.metadata?.documentId ||
                null,

            pageNumber:
                document.metadata?.pageNumber ||
                null,
        }));

    totalTimer.end();

    return {
        answer: response.content,
        sources,
    };
}



// export async function answerQuestion({
//     question,
//     userId,
//     documentIds = [],
//     history = [],
// }) {
//     const rewrittenQuestion =
//         await rewriteQuery({
//             question,
//             history,
//         });

//     console.log(
//         "Original question:",
//         question
//     );

//     console.log(
//         "Rewritten question:",
//         rewrittenQuestion
//     );

//     const documents =
//         await retrieveDocuments({
//             query: rewrittenQuestion,
//             userId,
//             documentIds,
//         });

//     if (documents.length === 0) {
//         return {
//             answer:
//                 "I couldn't find relevant information in your uploaded documents.",
//             sources: [],
//         };
//     }

//     const context =
//         formatDocuments(documents);

//     const conversationHistory =
//         history
//             .map(
//                 (message) =>
//                     `${message.role}: ${message.content}`
//             )
//             .join("\n");

//     const messages =
//         await ragPrompt.formatMessages({
//             context,
//             question,
//             history: conversationHistory,
//         });

//     const response =
//         await chatModel.invoke(messages);

//     const sources =
//         documents.map((document) => ({
//             documentName:
//                 document.metadata?.documentName ||
//                 "Unknown",

//             documentId:
//                 document.metadata?.documentId ||
//                 null,

//             pageNumber:
//                 document.metadata?.pageNumber ||
//                 null,
//         }));

//     return {
//         answer: response.content,
//         sources,
//     };
// }