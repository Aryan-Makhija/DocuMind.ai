// import { CohereRerank } from "@langchain/cohere";
// import { getUserRetriever } from "../vectorstore/pinecone";

// const reranker = new CohereRerank({
//   apiKey: process.env.COHERE_API_KEY,
//   model: "rerank-v3.5",
//   topN: 5,
// });

// export async function retrieveDocuments({
//   query,
//   userId,
//   documentIds = [],
// }) {
//   const retriever = await getUserRetriever({
//     userId,
//     documentIds,
//     k: 10,
//   });

//   const documents = await retriever.invoke(query);

//   if (documents.length === 0) {
//     return [];
//   }

//   const reranked = await reranker.compressDocuments(
//     documents,
//     query
//   );

//   return reranked;
// }

import { CohereRerank } from "@langchain/cohere";
import { getUserRetriever } from "../vectorstore/pinecone";

import {
  createTimer,
} from "@/lib/utils/timing";

const reranker = new CohereRerank({
  apiKey: process.env.COHERE_API_KEY,
  model: "rerank-v3.5",
  topN: 5,
});

export async function retrieveDocuments({
  query,
  userId,
  documentIds = [],
}) {
  const retriever =
    await getUserRetriever({
      userId,
      documentIds,
      k: 10,
    });

  const retrievalTimer =
    createTimer("PINECONE RETRIEVAL");

  const documents =
    await retriever.invoke(query);

  retrievalTimer.end();

  if (documents.length === 0) {
    return [];
  }

  console.log(
    `[RETRIEVAL] Retrieved ${documents.length} documents`
  );

  const rerankTimer =
    createTimer("COHERE RERANK");

  const reranked =
    await reranker.compressDocuments(
      documents,
      query
    );

  rerankTimer.end();

  console.log(
    `[RERANK] Returned ${reranked.length} documents`
  );

  return reranked;
}