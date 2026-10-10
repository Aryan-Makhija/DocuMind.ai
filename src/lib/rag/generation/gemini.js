// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// export const chatModel =
//   new ChatGoogleGenerativeAI({
//     apiKey: process.env.GEMINI_API_KEY,
//     model: "gemini-3.6-flash",
//     temperature: 0,
//   });




import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let chatModel;

export function getChatModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!chatModel) {
    chatModel = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-3.6-flash",
      temperature: 0,
    });
  }

  return chatModel;
}
