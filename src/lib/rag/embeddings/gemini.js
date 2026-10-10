// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// export const embeddings = new GoogleGenerativeAIEmbeddings({
//   apiKey: process.env.GEMINI_API_KEY,
//   model: "gemini-embedding-001",
// });

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export function getEmbeddings() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    model: "gemini-embedding-001",
  });
}