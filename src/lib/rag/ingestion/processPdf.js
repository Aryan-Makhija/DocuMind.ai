
// IN this file we are writing the code for the pdf upload and creating the metadeta for it .Aslo chunking of the data is also done 

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "../vectorstore/pinecone";

export async function processPdf(filePath, metadata) {
  const loader = new PDFLoader(filePath);

  const documents = await loader.load();

  console.log(`Extracted ${documents.length} pages`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(documents);

  console.log(`Created ${chunks.length} chunks`);

  const enrichedChunks = chunks.map((chunk, index) => {
    return {
      ...chunk,
      metadata: {
        ...chunk.metadata,

        userId: metadata.userId,
        documentId: metadata.documentId,
        documentName: metadata.documentName,

        chunkIndex: index,

        pageNumber:
          chunk.metadata?.loc?.pageNumber ??
          chunk.metadata?.pageNumber ??
          null,
      },
    };
  });

  const vectorStore = await getVectorStore();

  await vectorStore.addDocuments(enrichedChunks);

  console.log(`Stored ${enrichedChunks.length} vectors`);

  return {
    pages: documents.length,
    chunks: enrichedChunks.length,
  };
}