import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
} from "@clerk/nextjs";
const documents = [
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
    {
        id: 3,
        name: "Research Paper.pdf",
        status: "Ready",
    },
];

export default async function Dashboard() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }
    return (


        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-7xl px-6 py-8">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="mt-1 text-gray-400">
                            Manage your documents and conversations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/documents"
                            className="rounded-lg border border-gray-700 px-4 py-2"
                        >
                            Documents
                        </Link>

                        <Link
                            href="/chat"
                            className="rounded-lg bg-white px-4 py-2 font-medium text-black"
                        >
                            Open Chat
                        </Link>

                        <UserButton />

                    </div>
                </header>

                {/* Stats */}
                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-sm text-gray-400">Documents</p>
                        <p className="mt-2 text-3xl font-bold">3</p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-sm text-gray-400">Ready</p>
                        <p className="mt-2 text-3xl font-bold">2</p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                        <p className="text-sm text-gray-400">Conversations</p>
                        <p className="mt-2 text-3xl font-bold">0</p>
                    </div>
                </section>

                {/* Documents */}
                <section className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Documents</h2>

                        <Link
                            href="/documents"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            View all
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {documents.map((document) => (
                            <div
                                key={document.id}
                                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 p-5"
                            >
                                <div>
                                    <p className="font-medium">{document.name}</p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        PDF document
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