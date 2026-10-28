"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

/* Styled element map: every markdown element gets its own look so the
   AI answer reads like a clean, structured document. */
const components = {
    p: ({ children }) => (
        <p className="mb-3 text-[15px] leading-7 text-white/90 last:mb-0">{children}</p>
    ),

    // important terms (**bold**) are highlighted
    strong: ({ children }) => (
        <strong className="font-semibold text-[#9bffd0]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-white/80">{children}</em>,

    h1: ({ children }) => (
        <h1 className="mb-3 mt-5 border-b border-white/10 pb-2 font-['Space_Grotesk',sans-serif] text-[20px] font-semibold text-white first:mt-0">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="mb-2.5 mt-5 font-['Space_Grotesk',sans-serif] text-[18px] font-semibold text-white first:mt-0">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="mb-2 mt-4 text-[16px] font-semibold text-[#7cf9bd] first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
        <h4 className="mb-2 mt-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/70 first:mt-0">
            {children}
        </h4>
    ),

    ul: ({ children }) => (
        <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-white/90 marker:text-[#7cf9bd] last:mb-0">
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-7 text-white/90 marker:font-semibold marker:text-[#7cf9bd] last:mb-0">
            {children}
        </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,

    blockquote: ({ children }) => (
        <blockquote className="mb-3 rounded-r-lg border-l-2 border-[#7cf9bd]/60 bg-[#7cf9bd]/[0.05] px-4 py-2 text-white/80 last:mb-0">
            {children}
        </blockquote>
    ),

    hr: () => <hr className="my-5 border-white/10" />,

    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7cf9bd] underline decoration-[#7cf9bd]/40 underline-offset-2 transition hover:decoration-[#7cf9bd]"
        >
            {children}
        </a>
    ),

    /* ---------- code ---------- */
    pre: ({ children }) => (
        <pre className="mb-3 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 text-[13px] leading-6 text-white/90 last:mb-0">
            {children}
        </pre>
    ),
    code: ({ className, children }) => {
        const isBlock = /language-/.test(className || "") || String(children).includes("\n");
        if (isBlock) return <code className="font-mono">{children}</code>;
        return (
            <code className="rounded-md border border-[#7cf9bd]/20 bg-[#7cf9bd]/[0.08] px-1.5 py-0.5 font-mono text-[13px] text-[#9bffd0]">
                {children}
            </code>
        );
    },

    /* ---------- tables ---------- */
    table: ({ children }) => (
        <div className="mb-4 mt-1 overflow-x-auto rounded-xl border border-white/[0.12] bg-black/30 last:mb-0">
            <table className="w-full min-w-[520px] border-collapse text-left text-[14px] leading-6">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-[#7cf9bd]/[0.08]">{children}</thead>,
    tbody: ({ children }) => (
        <tbody className="[&_td:first-child]:font-medium [&_td:first-child]:text-white">
            {children}
        </tbody>
    ),
    tr: ({ children }) => (
        <tr className="border-t border-white/[0.08] transition-colors first:border-t-0 even:bg-white/[0.025] hover:bg-white/[0.05]">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="whitespace-nowrap px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#7cf9bd]">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-3 align-top text-white/80">{children}</td>
    ),
};

export default function MarkdownContent({ content }) {
    return (
        <div className="min-w-0 break-words">
            <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
                {content || ""}
            </ReactMarkdown>
        </div>
    );
}