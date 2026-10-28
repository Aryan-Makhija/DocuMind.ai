
// ================================================================================

import { CohereRerank } from "@langchain/cohere";
import { getUserRetriever } from "../vectorstore/pinecone";
import { createTimer } from "@/lib/utils/timing";

let reranker;

function getReranker() {
  const apiKey = process.env.COHERE_API_KEY;

  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not configured.");
  }

  if (!reranker) {
    reranker = new CohereRerank({
      apiKey,
      model: "rerank-v3.5",
      topN: 5,
    });
  }

  return reranker;
}

export async function retrieveDocuments({
  query,
  userId,
  documentIds = [],
}) {
  const retriever = await getUserRetriever({
    userId,
    documentIds,
    k: 10,
  });

  const retrievalTimer = createTimer("PINECONE RETRIEVAL");
  const documents = await retriever.invoke(query);
  retrievalTimer.end();

  if (documents.length === 0) {
    return [];
  }

  console.log(
    `[RETRIEVAL] Retrieved ${documents.length} documents`
  );

  const rerankTimer = createTimer("COHERE RERANK");

  const reranked = await getReranker().compressDocuments(
    documents,
    query
  );

  rerankTimer.end();

  console.log(
    `[RERANK] Returned ${reranked.length} documents`
  );

  return reranked;
}