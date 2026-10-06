// In this  file we are doing user scope retrieval means  retrieval of only those chunks that have the mathced user id 

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings } from "../embeddings/gemini";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export function getPineconeIndex() {
  return pinecone.Index(
    process.env.PINECONE_INDEX_NAME
  );
}

export async function getVectorStore() {
  const index = getPineconeIndex();

  return PineconeStore.fromExistingIndex(
    embeddings,
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
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index(
    process.env.PINECONE_INDEX_NAME
  );

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