
import { getPineconeIndex } from "../lib/rag/vectorstore/pinecone.js";
import "dotenv/config";


export async function testPineconeMetadata() {
  const index = getPineconeIndex();

  // Replace these with the actual values used during ingestion.
  const userId = "user_3K0UzoY6WYxYqJejPpTY5BedePR";
  const documentId = "6af61079-abee-4eb4-a51a-e9ea2bbce257";

  console.log("\n========== PINECONE METADATA TEST ==========\n");

  const result = await index.query({
    vector: new Array(3072).fill(0),
    topK: 100,
    filter: {
      userId: { $eq: userId },
      documentId: { $eq: documentId },
    },
    includeMetadata: true,
  });

  const matches = result.matches ?? [];

  console.log("Vectors fetched:", matches.length);

  const pageSummary = new Map();

  for (const match of matches) {
    const metadata = match.metadata ?? {};
    const pageNumber = metadata.pageNumber;
    const method = metadata.extractionMethod ?? "missing";

    if (!pageSummary.has(pageNumber)) {
      pageSummary.set(pageNumber, {
        extractionMethod: method,
        chunks: 0,
        userId: metadata.userId,
        documentId: metadata.documentId,
      });
    }

    pageSummary.get(pageNumber).chunks++;
  }

  console.log("\n========== PAGE SUMMARY ==========\n");

  for (const [page, details] of [...pageSummary.entries()].sort(
    (a, b) => Number(a[0]) - Number(b[0])
  )) {
    console.log(`Page ${page}:`, details);
  }

  console.log("\n========== RAW METADATA SAMPLE ==========\n");

  console.dir(matches.slice(0, 3).map(match => ({
    id: match.id,
    metadata: match.metadata,
  })), { depth: null });

  console.log("\n========== TEST COMPLETE ==========\n");
}

testPineconeMetadata().catch(error => {
  console.error("Metadata test failed:", error);
  process.exitCode = 1;
});
