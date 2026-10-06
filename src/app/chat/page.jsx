"use client";

import { useState, useEffect } from "react";

export default function ChatPage() {

  const [documents, setDocuments] = useState([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);


  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! Ask me anything about your uploaded documents.",
      sources: [],
    },
  ]);

  const [conversationId, setConversationId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedQuestion,
        sources: [],
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question: trimmedQuestion,
            conversationId,
            documentIds: selectedDocumentIds,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to get answer"
        );
      }

      setConversationId(
        data.conversationId
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer,
          sources:
            data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Something went wrong while processing your question.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }



  // get user documents
  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch(
          "/api/documents"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
            "Failed to load documents"
          );
        }

        setDocuments(data.documents || []);
      } catch (error) {
        console.error(error);
      }
    }

    loadDocuments();
  }, []);


  async function deleteDocument(documentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/documents",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data)

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to delete document"
        );
      }

      setDocuments((current) =>
        current.filter(
          (document) =>
            document.id !== documentId
        )
      );

      setSelectedDocumentIds(
        (current) =>
          current.filter(
            (id) => id !== documentId
          )
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Failed to delete document"
      );
    }
  }


  function toggleDocument(documentId) {
    setSelectedDocumentIds(
      (current) => {
        if (current.includes(documentId)) {
          return current.filter(
            (id) => id !== documentId
          );
        }

        return [...current, documentId];
      }
    );
  }

  console.log(documents)
  return (
    <main className="flex min-h-screen flex-col bg-gray-950 text-white">



      {/* document selection */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          {/* Top Header Row */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">
              Chat with documents
            </p>

            <button
              type="button"
              onClick={() => setSelectedDocumentIds([])}
              className={`rounded-lg border px-3 py-2 text-sm ${selectedDocumentIds.length === 0
                ? "border-white bg-white text-black"
                : "border-gray-700 bg-gray-900 text-gray-300"
                }`}
            >
              All documents
            </button>
          </div>

          {/* Documents List */}
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleDocument(document.id)}
                    disabled={document.status !== "ready"}
                    className={`rounded-lg border px-3 py-2 text-sm ${selectedDocumentIds.includes(document.id)
                      ? "border-white bg-white text-black"
                      : "border-gray-700 bg-gray-900 text-gray-300"
                      } ${document.status !== "ready"
                        ? "cursor-not-allowed opacity-40"
                        : ""
                      }`}
                  >
                    📄 {document.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteDocument(document.id)}
                    className="rounded-lg border border-red-900 px-2 py-2 text-sm text-red-400 hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Count Indicator */}
          {selectedDocumentIds.length > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              {selectedDocumentIds.length} document
              {selectedDocumentIds.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>

      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="font-semibold">
          Document Chat
        </h1>

        <p className="text-sm text-gray-500">
          Ask questions about your documents
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8">

        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={`rounded-xl border p-5 ${message.role ===
                "user"
                ? "border-gray-700 bg-gray-900"
                : "border-gray-800 bg-gray-950"
                }`}
            >
              <p className="mb-2 text-sm font-medium text-gray-400">
                {message.role ===
                  "user"
                  ? "You"
                  : "AI"}
              </p>

              <p className="whitespace-pre-wrap text-gray-200">
                {message.content}
              </p>

              {message.sources
                ?.length > 0 && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-400">
                      Sources
                    </p>

                    <div className="space-y-2">
                      {message.sources.map(
                        (
                          source,
                          sourceIndex
                        ) => (
                          <div
                            key={
                              sourceIndex
                            }
                            className="text-sm text-gray-500"
                          >
                            📄{" "}
                            {
                              source.documentName
                            }{" "}
                            · Page{" "}
                            {
                              source.pageNumber
                            }
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )
        )}

        {loading && (
          <div className="text-sm text-gray-500">
            Thinking...
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 p-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl gap-3"
        >
          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            disabled={loading}
            placeholder="Ask a question about your documents..."
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-gray-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>

    </main>
  );
}



{/* documents selector  */ }
{/* <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-sm font-medium text-gray-300">
            Chat with documents
          </p>



          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {documents.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() =>
                    toggleDocument(document.id)
                  }
                  disabled={
                    document.status !== "ready"
                  }
                  className={`rounded-lg border px-3 py-2 text-sm ${selectedDocumentIds.includes(
                    document.id
                  )
                    ? "border-white bg-white text-black"
                    : "border-gray-700 bg-gray-900 text-gray-300"
                    } ${document.status !== "ready"
                      ? "cursor-not-allowed opacity-40"
                      : ""
                    }`}
                >
                  📄 {document.name}
                </button>
              ))}
            </div>
          )}

          {selectedDocumentIds.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {selectedDocumentIds.length} document
              {selectedDocumentIds.length > 1
                ? "s"
                : ""}{" "}
              selected
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            setSelectedDocumentIds([])
          }
          className={`rounded-lg border px-3 py-2 text-sm ${selectedDocumentIds.length === 0
            ? "border-white bg-white text-black"
            : "border-gray-700 bg-gray-900 text-gray-300"
            }`}
        >
          All documents
        </button>

        <div
          key={document.id}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() =>
              toggleDocument(document.id)
            }
            disabled={
              document.status !== "ready"
            }
            className={`rounded-lg border px-3 py-2 text-sm ${selectedDocumentIds.includes(
              document.id
            )
              ? "border-white bg-white text-black"
              : "border-gray-700 bg-gray-900 text-gray-300"
              }`}
          >
            📄 {document.name}
          </button>

          <button
            type="button"
            onClick={() =>
              deleteDocument(document.id)
            }
            className="rounded-lg border border-red-900 px-2 py-2 text-sm text-red-400 hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </div> */}