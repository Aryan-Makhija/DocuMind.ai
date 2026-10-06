import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const chatModel =
  new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3.6-flash",
    temperature: 0,
  });