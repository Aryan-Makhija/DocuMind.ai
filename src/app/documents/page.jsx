"use client";

import Link from "next/link";
import { useState } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
const initialDocuments = [
    {
        id: 1,
        name: "Company Brochure.pdf",
        status: "Ready",
    },
    {
        id: 2,
        name: "Product Documentation.pdf",
        status: "Processing",
    },
];

export default function DocumentsPage() {
    const [documents, setDocuments] = useState(initialDocuments);

    async function handleFileChange(event) {
        const file = event.target.files?.[0];

        //file validation
        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            alert("Only PDF files are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("PDF must be smaller than 10 MB.");
            event.target.value = "";
            return;
        }

        const temporaryDocument = {
            id: Date.now(),
            name: file.name,
            status: "Processing",
        };

        setDocuments((current) => [
            temporaryDocument,
            ...current,
        ]);

        const formData = new FormData();

        formData.append("file", file);

        try {
            const response = await fetch(
                "/api/documents/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            
            console.log(data)
            if (!response.ok) {
                throw new Error(
                    data.error || "Upload failed"
                );
            }

            setDocuments((current) =>
                current.map((document) =>
                    document.id === temporaryDocument.id
                        ? {
                            ...document,
                            id: data.documentId,
                            status: "Ready",
                        }
                        : document
                )
            );

        } catch (error) {
            console.error(error);

            setDocuments((current) =>
                current.map((document) =>
                    document.id === temporaryDocument.id
                        ? {
                            ...document,
                            status: "Failed",
                        }
                        : document
                )
            );
        }

        event.target.value = "";
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-6xl px-6 py-8">

                <header>
                    <h1 className="text-3xl font-bold">Documents</h1>

                    <p className="mt-2 text-gray-400">
                        Upload and manage the documents you want to chat with.
                    </p>

                    <div className="mt-4 flex gap-3">
                        <Link
                            href="/dashboard"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/chat"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Chat
                        </Link>
                    </div>
                </header>

                {/* Upload */}
                <section className="mt-8 rounded-xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
                    <h2 className="text-lg font-semibold">
                        Upload a PDF
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Text-based PDF documents are supported.
                    </p>

                    <label className="mt-6 inline-block cursor-pointer rounded-lg bg-white px-5 py-3 font-medium text-black">
                        Choose PDF

                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </section>

                {/* Documents */}
                <section className="mt-10">
                    <h2 className="mb-4 text-xl font-semibold">
                        Your Documents
                    </h2>

                    <div className="space-y-3">
                        {documents.map((document) => (
                            <div
                                key={document.id}
                                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-5"
                            >
                                <div>
                                    <p className="font-medium">
                                        {document.name}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        PDF
                                    </p>
                                </div>

                                <span className="rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-300">
                                    {document.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}