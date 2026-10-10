// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { chatModel } from "./gemini";

// const rewritePrompt =
//     ChatPromptTemplate.fromMessages([
//         [
//             "system",
//             `You rewrite conversational questions into
// standalone questions for document retrieval.

// Use the conversation history to resolve references
// such as:
// - it
// - they
// - this
// - that
// - the previous one
// - which one

// If the current question is already standalone,
// return it unchanged.

// Return ONLY the rewritten question.`,
//         ],
//         [
//             "human",
//             `Conversation history:

// {history}

// Current question:
// {question}`,
//         ],
//     ]);

// export async function rewriteQuery({
//     question,
//     history,
// }) {
//     if (!history || history.length === 0) {
//         return question;
//     }

//     const formattedHistory = history
//         .map(
//             (message) =>
//                 `${message.role}: ${message.content}`
//         )
//         .join("\n");

//     const messages =
//         await rewritePrompt.formatMessages({
//             history: formattedHistory,
//             question,
//         });

//     const response =
//         await chatModel.invoke(messages);

//     return response.content.trim();
// }



import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getChatModel } from "./gemini";
// import { chatModel } from "./gemini";

function needsRewrite(question) {
    const normalized = question
        .toLowerCase()
        .trim();

    const followUpPatterns = [
        /^(what|why|how|which|where|when|who)\s+(about|is|are|does|do|did|was|were)\s+(it|this|that|they|them|these|those)\b/i,

        /^(what|why|how|which|where|when|who)\s+(about|is|are)\s+(the|this|that)\s+(one|ones)\b/i,

        /\b(it|this|that|they|them|these|those)\b/i,

        /\b(the previous|the above|the first|the second|the other one)\b/i,

        /^(and|also|what about|how about)\b/i,

        /\b(its|their)\b/i,
    ];

    return followUpPatterns.some(
        (pattern) =>
            pattern.test(normalized)
    );
}

const rewritePrompt =
    ChatPromptTemplate.fromMessages([
        [
            "system",
            `Rewrite the user's follow-up question into a standalone question.

Use the conversation history to resolve references such as:
- it
- they
- this
- that
- which one
- the previous one
- the first one
- the second one

Return ONLY the rewritten question.`,
        ],
        [
            "human",
            `Conversation history:

{history}

Current question:
{question}`,
        ],
    ]);

export async function rewriteQuery({
    question,
    history,
}) {
    if (!history || history.length === 0) {
        return question;
    }

    if (!needsRewrite(question)) {
        return question;
    }

    const formattedHistory = history
        .map(
            (message) =>
                `${message.role}: ${message.content}`
        )
        .join("\n");

    const messages =
        await rewritePrompt.formatMessages({
            history: formattedHistory,
            question,
        });

    const response =
        await getChatModel().invoke(messages);

    return response.content.trim();
}