export function formatDocuments(documents) {
  return documents
    .map((document, index) => {
      const metadata = document.metadata || {};

      return `
SOURCE ${index + 1}

Document: ${metadata.documentName || "Unknown"}
Page: ${metadata.pageNumber || "Unknown"}

Content:
${document.pageContent}
`;
    })
    .join("\n-------------------\n");
}