// In this  file we are doing user scope retrieval means  retrieval of only those chunks that have the mathced user id 


import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { getEmbeddings } from "../embeddings/gemini.js";


let pineconeClient;

function getPineconeClient() {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey) {
    throw new Error("PINECONE_API_KEY is not configured.");
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey });
  }

  return pineconeClient;
}

export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME;

  if (!indexName) {
    throw new Error("PINECONE_INDEX_NAME is not configured.");
  }

  return getPineconeClient().index(indexName);
}

export async function getVectorStore() {
  const index = getPineconeIndex();

  return PineconeStore.fromExistingIndex(
    getEmbeddings(),
    {
      pineconeIndex: index,
    }
  );
}

export async function getUserRetriever({
  userId,
  documentIds = [],
  k = 10,
}) {
  const vectorStore = await getVectorStore();

  const filter = {
    userId: {
      $eq: userId,
    },
  };

  if (documentIds.length > 0) {
    filter.documentId = {
      $in: documentIds,
    };
  }

  return vectorStore.asRetriever({
    k,
    filter,
  });
}

export async function deleteDocumentVectors({
  userId,
  documentId,
}) {
  const index = getPineconeIndex();

  await index.deleteMany({
    $and: [
      {
        userId: {
          $eq: userId,
        },
      },
      {
        documentId: {
          $eq: documentId,
        },
      },
    ],
  });
}