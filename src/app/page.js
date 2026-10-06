import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-400">
          Personal Document Intelligence
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
          Chat with your documents using AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Upload your documents, ask questions, and get answers grounded in
          your own content.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}