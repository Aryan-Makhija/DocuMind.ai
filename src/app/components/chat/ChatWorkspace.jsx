// "use client";

// import Link from "next/link";
// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     AlertCircle,
//     ArrowUp,
//     Check,
//     CheckCircle2,
//     Copy,
//     FileText,
//     FolderOpen,
//     Loader2,
//     PanelLeft,
//     Plus,
//     RefreshCw,
//     ScanText,
//     Search,
//     Sparkles,
//     Trash2,
//     Upload,
//     X,
//     XCircle,
// } from "lucide-react";


// import { useParams, useRouter } from "next/navigation";

// import ConversationSidebar from "./ConversationSidebar";




// /* ------------------------------------------------------------------ */
// /* Config + helpers                                                    */
// /* ------------------------------------------------------------------ */
// const DOCUMENTS_URL = "/api/documents";
// const CHAT_URL = "/api/chat";
// const POLL_MS = 5000;

// const GREETING = "Hello! Ask me anything about your uploaded documents.";
// const SUGGESTIONS = [
//     "Summarize the key points",
//     "What are the main findings?",
//     "List any risks or action items",
// ];

// const display = "font-['Space_Grotesk',sans-serif]";
// const eyebrow =
//     "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7cf9bd]";

// async function api(url, options, fallback = "Request failed") {
//     const res = await fetch(url, options);
//     let data = null;
//     try {
//         data = await res.json();
//     } catch {
//         /* empty body */
//     }
//     if (!res.ok) throw new Error(data?.error || fallback);
//     return data;
// }

// function normalizeStatus(s) {
//     const v = String(s || "").toLowerCase();
//     if (["ready", "completed", "complete", "processed", "success"].includes(v)) return "ready";
//     if (["failed", "error", "errored"].includes(v)) return "failed";
//     return "processing";
// }

// function normalizeDoc(d) {
//     return {
//         id: d.id,
//         name: d.name || d.fileName || "Untitled document",
//         status: normalizeStatus(d.status),
//         createdAt: d.createdAt || null,
//     };
// }

// const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

// let messageCounter = 0;
// const newId = () => `m${Date.now()}-${messageCounter++}`;

// /* ------------------------------------------------------------------ */
// /* Small pieces                                                        */
// /* ------------------------------------------------------------------ */
// function Logo() {
//     return (
//         <div className={`${display} flex items-center gap-2.5 text-[22px] font-bold tracking-tight text-white`}>
//             <ScanText className="h-6 w-6 text-[#7cf9bd]" strokeWidth={1.75} />
//             <span>
//                 DocuMind<span className="text-white/50">.ai</span>
//             </span>
//         </div>
//     );
// }

// function Skeleton({ className = "" }) {
//     return <div className={`animate-pulse rounded bg-white/[0.07] ${className}`} />;
// }

// function DocStatus({ status }) {
//     if (status === "ready")
//         return (
//             <span className="flex items-center gap-1 text-[11px] text-[#7cf9bd]">
//                 <CheckCircle2 className="h-3 w-3" /> Ready
//             </span>
//         );
//     if (status === "failed")
//         return (
//             <span className="flex items-center gap-1 text-[11px] text-red-400">
//                 <XCircle className="h-3 w-3" /> Failed
//             </span>
//         );
//     return (
//         <span className="flex items-center gap-1 text-[11px] text-white/60">
//             <Loader2 className="h-3 w-3 animate-spin" /> Processing
//         </span>
//     );
// }

// /* ------------------------------------------------------------------ */
// /* Documents panel (sidebar on desktop, drawer on mobile)              */
// /* ------------------------------------------------------------------ */
// function DocumentsPanel({
//     state,
//     selectedIds,
//     onToggle,
//     onClear,
//     onDelete,
//     onRetry,
//     onClose,
// }) {
//     const [search, setSearch] = useState("");

//     const visible = useMemo(() => {
//         const q = search.trim().toLowerCase();
//         return q ? state.items.filter((d) => d.name.toLowerCase().includes(q)) : state.items;
//     }, [state.items, search]);

//     const loading = state.status === "loading" && state.items.length === 0;
//     const failed = state.status === "error" && state.items.length === 0;
//     const allActive = selectedIds.length === 0;

//     return (
//         <div className="flex h-full min-h-0 flex-col">
//             <div className="flex items-center justify-between px-5 pb-3 pt-5">
//                 <p className={eyebrow}>
//                     <FolderOpen className="h-3.5 w-3.5" />
//                     Your documents
//                 </p>
//                 <div className="flex items-center gap-2">
//                     <span className="text-[11px] text-white/55">{state.items.length}</span>
//                     {onClose && (
//                         <button
//                             onClick={onClose}
//                             aria-label="Close documents"
//                             className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/70 hover:text-white lg:hidden"
//                         >
//                             <X className="h-4 w-4" />
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* search */}
//             <div className="px-5">
//                 <label className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition focus-within:border-[#7cf9bd]/50">
//                     <Search className="h-3.5 w-3.5 shrink-0 text-white/50" />
//                     <input
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         placeholder="Search documents..."
//                         aria-label="Search documents"
//                         autoComplete="off"
//                         className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
//                     />
//                     {search && (
//                         <button
//                             onClick={() => setSearch("")}
//                             aria-label="Clear search"
//                             className="text-white/50 hover:text-white"
//                         >
//                             <X className="h-3.5 w-3.5" />
//                         </button>
//                     )}
//                 </label>
//             </div>

//             {/* all documents */}
//             <div className="px-5 pt-3">
//                 <button
//                     type="button"
//                     onClick={onClear}
//                     aria-pressed={allActive}
//                     className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition ${allActive
//                         ? "border-[#7cf9bd]/40 bg-[#7cf9bd]/[0.08]"
//                         : "border-white/10 bg-white/[0.02] hover:border-white/25"
//                         }`}
//                 >
//                     <span
//                         className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${allActive ? "border-[#7cf9bd] bg-[#7cf9bd] text-black" : "border-white/30"
//                             }`}
//                     >
//                         {allActive && <Check className="h-3 w-3" strokeWidth={3} />}
//                     </span>
//                     <span className="min-w-0">
//                         <span className="block text-[13px] font-medium text-white">All documents</span>
//                         <span className="block text-[11.5px] text-white/60">Ask across your whole library</span>
//                     </span>
//                 </button>
//             </div>

//             {/* list */}
//             <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-5 pb-3">
//                 {loading && (
//                     <div className="space-y-2" aria-busy="true">
//                         {[0, 1, 2, 3].map((i) => (
//                             <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3.5">
//                                 <Skeleton className="h-5 w-5 rounded" />
//                                 <div className="flex-1 space-y-2">
//                                     <Skeleton className="h-3 w-3/4" />
//                                     <Skeleton className="h-2.5 w-1/3" />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {failed && (
//                     <div className="flex flex-col items-center py-10 text-center">
//                         <AlertCircle className="h-6 w-6 text-red-400" />
//                         <p className="mt-3 text-[13px] font-medium text-white">Couldn’t load documents</p>
//                         <p className="mt-1 text-[12px] text-white/60">{state.error}</p>
//                         <button
//                             onClick={onRetry}
//                             className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-4 text-[12px] text-white transition hover:border-[#7cf9bd]/60 hover:text-[#7cf9bd]"
//                         >
//                             <RefreshCw className="h-3.5 w-3.5" /> Try again
//                         </button>
//                     </div>
//                 )}

//                 {!loading && !failed && state.items.length === 0 && (
//                     <div className="flex flex-col items-center py-10 text-center">
//                         <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
//                             <FileText className="h-5 w-5 text-white/60" />
//                         </span>
//                         <p className="mt-3 text-[13px] font-medium text-white">No documents uploaded yet</p>
//                         <Link
//                             href="/dashboard"
//                             className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[#7cf9bd] px-4 text-[12px] font-medium text-black transition hover:bg-[#9bffd0]"
//                         >
//                             <Upload className="h-3.5 w-3.5" /> Upload a PDF
//                         </Link>
//                     </div>
//                 )}

//                 {!loading && !failed && state.items.length > 0 && visible.length === 0 && (
//                     <p className="py-10 text-center text-[12.5px] text-white/60">
//                         No documents match “{search.trim()}”.
//                     </p>
//                 )}

//                 <ul className="space-y-2">
//                     <AnimatePresence initial={false}>
//                         {visible.map((doc) => {
//                             const selectable = doc.status === "ready";
//                             const selected = selectedIds.includes(doc.id);
//                             return (
//                                 <motion.li
//                                     key={doc.id}
//                                     layout
//                                     initial={{ opacity: 0, y: 8 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     exit={{ opacity: 0, x: -16 }}
//                                     transition={{ duration: 0.25 }}
//                                     className={`group flex items-stretch rounded-lg border transition ${selected
//                                         ? "border-[#7cf9bd]/40 bg-[#7cf9bd]/[0.08]"
//                                         : "border-white/10 bg-white/[0.02] hover:border-white/25"
//                                         } ${selectable ? "" : "opacity-60"}`}
//                                 >
//                                     <button
//                                         type="button"
//                                         role="checkbox"
//                                         aria-checked={selected}
//                                         disabled={!selectable}
//                                         onClick={() => onToggle(doc.id)}
//                                         title={selectable ? undefined : "This document isn’t ready to chat yet"}
//                                         className={`flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3 text-left ${selectable ? "" : "cursor-not-allowed"
//                                             }`}
//                                     >
//                                         <span
//                                             className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${selected ? "border-[#7cf9bd] bg-[#7cf9bd] text-black" : "border-white/30"
//                                                 }`}
//                                         >
//                                             {selected && <Check className="h-3 w-3" strokeWidth={3} />}
//                                         </span>
//                                         <span className="min-w-0">
//                                             <span className="block truncate text-[13px] font-medium text-white">{doc.name}</span>
//                                             <span className="mt-1 block">
//                                                 <DocStatus status={doc.status} />
//                                             </span>
//                                         </span>
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() => onDelete(doc)}
//                                         aria-label={`Delete ${doc.name}`}
//                                         className="mr-1.5 grid w-9 shrink-0 place-items-center self-center rounded-md py-2 text-white/50 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
//                                     >
//                                         <Trash2 className="h-4 w-4" />
//                                     </button>
//                                 </motion.li>
//                             );
//                         })}
//                     </AnimatePresence>
//                 </ul>
//             </div>

//             <div className="border-t border-white/[0.08] px-5 py-4">
//                 <Link
//                     href="/dashboard"
//                     className="flex items-center gap-2 text-[12px] text-white/65 transition hover:text-[#7cf9bd]"
//                 >
//                     <Upload className="h-3.5 w-3.5" />
//                     Add more documents in your dashboard
//                 </Link>
//             </div>
//         </div>
//     );
// }

// /* ------------------------------------------------------------------ */
// /* Messages                                                            */
// /* ------------------------------------------------------------------ */
// function SourceChips({ sources }) {
//     // de-duplicate the same document + page
//     const unique = useMemo(() => {
//         const seen = new Set();
//         return (sources || []).filter((s) => {
//             const key = `${s.documentName}::${s.pageNumber}`;
//             if (seen.has(key)) return false;
//             seen.add(key);
//             return true;
//         });
//     }, [sources]);

//     if (unique.length === 0) return null;

//     return (
//         <div className="mt-5 border-t border-white/[0.08] pt-4">
//             <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
//                 Sources
//             </p>
//             <div className="flex flex-wrap gap-2">
//                 {unique.map((s, i) => (
//                     <motion.span
//                         key={`${s.documentName}-${s.pageNumber}-${i}`}
//                         initial={{ opacity: 0, scale: 0.92 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: 0.08 * i, duration: 0.25 }}
//                         className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.06] px-3 py-1.5 text-[12px] text-[#7cf9bd]"
//                     >
//                         <FileText className="h-3.5 w-3.5 shrink-0" />
//                         <span className="truncate">
//                             {s.documentName}
//                             {s.pageNumber != null && s.pageNumber !== "" ? ` · Page ${s.pageNumber}` : ""}
//                         </span>
//                     </motion.span>
//                 ))}
//             </div>
//         </div>
//     );
// }

// function AssistantAvatar({ error }) {
//     return (
//         <span
//             className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${error ? "border-red-400/30 bg-red-400/10" : "border-[#7cf9bd]/30 bg-[#7cf9bd]/10"
//                 }`}
//         >
//             {error ? (
//                 <AlertCircle className="h-4 w-4 text-red-400" />
//             ) : (
//                 <Sparkles className="h-4 w-4 text-[#7cf9bd]" />
//             )}
//         </span>
//     );
// }

// function Message({ message, onCopy, onRetry, retryDisabled }) {
//     if (message.role === "user") {
//         return (
//             <motion.div
//                 layout="position"
//                 initial={{ opacity: 0, y: 14 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="flex justify-end"
//             >
//                 <div className="max-w-[88%] rounded-2xl rounded-br-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.1] px-5 py-3.5 sm:max-w-[75%]">
//                     <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white">
//                         {message.content}
//                     </p>
//                 </div>
//             </motion.div>
//         );
//     }

//     return (
//         <motion.div
//             layout="position"
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//             className="flex gap-3.5"
//         >
//             <AssistantAvatar error={message.error} />
//             <div className="min-w-0 flex-1">
//                 <p className="text-[12px] font-semibold text-white">DocuMind</p>

//                 <div
//                     className={`mt-2 rounded-2xl rounded-tl-md border px-5 py-4 ${message.error
//                         ? "border-red-400/30 bg-red-400/[0.06]"
//                         : "border-white/[0.1] bg-[#0b0b0b]"
//                         }`}
//                 >
//                     <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white/90">
//                         {message.content}
//                     </p>
//                     <SourceChips sources={message.sources} />
//                 </div>

//                 <div className="mt-2 flex items-center gap-1 pl-1">
//                     {message.error ? (
//                         <button
//                             onClick={() => onRetry(message)}
//                             disabled={retryDisabled}
//                             className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
//                         >
//                             <RefreshCw className="h-3.5 w-3.5" /> Try again
//                         </button>
//                     ) : (
//                         message.canCopy && (
//                             <button
//                                 onClick={() => onCopy(message.content)}
//                                 className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
//                             >
//                                 <Copy className="h-3.5 w-3.5" /> Copy
//                             </button>
//                         )
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     );
// }

// function TypingIndicator() {
//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -6 }}
//             className="flex items-center gap-3.5"
//             role="status"
//             aria-label="DocuMind is thinking"
//         >
//             <AssistantAvatar />
//             <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/[0.1] bg-[#0b0b0b] px-5 py-4">
//                 {[0, 1, 2].map((d) => (
//                     <motion.span
//                         key={d}
//                         className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]"
//                         animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
//                         transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
//                     />
//                 ))}
//                 <span className="ml-2 text-[12.5px] text-white/65">Searching your documents…</span>
//             </div>
//         </motion.div>
//     );
// }

// /* ------------------------------------------------------------------ */
// /* Delete confirmation modal (replaces window.confirm)                 */
// /* ------------------------------------------------------------------ */
// function ConfirmDelete({ doc, busy, onCancel, onConfirm }) {
//     useEffect(() => {
//         const onKey = (e) => e.key === "Escape" && !busy && onCancel();
//         window.addEventListener("keydown", onKey);
//         return () => window.removeEventListener("keydown", onKey);
//     }, [busy, onCancel]);

//     return (
//         <div className="fixed inset-0 z-[100] grid place-items-center p-4">
//             <motion.div
//                 className="absolute inset-0 bg-black/75 backdrop-blur-sm"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 onClick={() => !busy && onCancel()}
//             />
//             <motion.div
//                 role="alertdialog"
//                 aria-modal="true"
//                 aria-labelledby="delete-title"
//                 initial={{ opacity: 0, y: 24, scale: 0.95 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: 14, scale: 0.97 }}
//                 transition={{ type: "spring", damping: 26, stiffness: 320 }}
//                 className="relative w-full max-w-[420px] rounded-xl border border-white/[0.12] bg-[#0a0a0a] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]"
//             >
//                 <span className="grid h-11 w-11 place-items-center rounded-full border border-red-400/30 bg-red-400/10">
//                     <Trash2 className="h-5 w-5 text-red-400" />
//                 </span>
//                 <h2 id="delete-title" className={`${display} mt-5 text-[22px] font-medium text-white`}>
//                     Delete this document?
//                 </h2>
//                 <p className="mt-2 text-[13.5px] leading-6 text-white/70">
//                     <span className="font-medium text-white">{doc.name}</span> will be permanently removed from
//                     your library. This can’t be undone.
//                 </p>
//                 <div className="mt-6 flex justify-end gap-3">
//                     <button
//                         onClick={onCancel}
//                         disabled={busy}
//                         className="h-10 rounded-md border border-white/15 px-5 text-[13px] font-medium text-white transition hover:border-white/35 disabled:opacity-50"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={onConfirm}
//                         disabled={busy}
//                         autoFocus
//                         className="inline-flex h-10 items-center gap-2 rounded-md bg-red-500 px-5 text-[13px] font-medium text-white transition hover:bg-red-400 disabled:opacity-60"
//                     >
//                         {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
//                         {busy ? "Deleting…" : "Delete"}
//                     </button>
//                 </div>
//             </motion.div>
//         </div>
//     );
// }

// /* ------------------------------------------------------------------ */
// /* Toast                                                               */
// /* ------------------------------------------------------------------ */
// function Toast({ toast }) {
//     const isError = toast?.tone === "error";
//     return (
//         <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[110] flex justify-center px-4">
//             <AnimatePresence>
//                 {toast && (
//                     <motion.div
//                         key={toast.id}
//                         role="status"
//                         initial={{ opacity: 0, y: 20, scale: 0.96 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: 10, scale: 0.98 }}
//                         transition={{ type: "spring", damping: 24, stiffness: 320 }}
//                         className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-[13px] text-white shadow-2xl ${isError ? "border-red-400/35 bg-[#1a0f0f]" : "border-[#7cf9bd]/30 bg-[#0c1511]"
//                             }`}
//                     >
//                         {isError ? (
//                             <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
//                         ) : (
//                             <CheckCircle2 className="h-4 w-4 shrink-0 text-[#7cf9bd]" />
//                         )}
//                         {toast.message}
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }

// /* ------------------------------------------------------------------ */
// /* Page                                                                */
// /* ------------------------------------------------------------------ */
// export default function ChatWorkspace() {

//     // ==========================================
//     // New  Conversation feature changes 
//     // ==========================================
//     const router = useRouter();
//     const params = useParams();

//     const urlConversationId =
//         typeof params?.conversationId === "string"
//             ? params.conversationId
//             : null;
//     console.log("[CHAT DEBUG]", {
//         urlConversationId,
//         params,
//     });
//     const [conversations, setConversations] = useState([]);

//     const [conversationsLoading, setConversationsLoading] =
//         useState(true);

//     const [conversationsError, setConversationsError] =
//         useState("");

//     const [historyLoading, setHistoryLoading] = useState(
//         Boolean(urlConversationId)
//     );

//     const [historyError, setHistoryError] = useState("");


//     const loadConversations = useCallback(async () => {
//         setConversationsLoading(true);
//         setConversationsError("");

//         try {
//             const data = await api(
//                 "/api/conversation.js",
//                 { cache: "no-store" },
//                 "Failed to load conversations"
//             );

//             setConversations(data.conversations || []);
//         } catch (error) {
//             setConversationsError(error.message);
//         } finally {
//             setConversationsLoading(false);
//         }
//     }, []);


//     useEffect(() => {
//         loadConversations();
//     }, [loadConversations]);



//     useEffect(() => {
//         let cancelled = false;

//         const requestEpoch = ++epoch.current;

//         async function loadHistory() {
//             setConversationId(urlConversationId);
//             setHistoryError("");
//             setQuestion("");

//             if (!urlConversationId) {
//                 setHistoryLoading(false);

//                 setMessages([
//                     {
//                         id: "greeting",
//                         role: "assistant",
//                         content: GREETING,
//                         sources: [],
//                     },
//                 ]);

//                 return;
//             }

//             setHistoryLoading(true);
//             setMessages([]);

//             try {
//                 const data = await api(
//                     `/api/conversation.js/${encodeURIComponent(urlConversationId)}`,
//                     { cache: "no-store" },
//                     "Failed to load conversation"
//                 );

//                 if (cancelled || requestEpoch !== epoch.current) {
//                     return;
//                 }
// console.log(data)
//                 setMessages(
//                     (data.messages || []).map((message) => ({
//                         id: message.id,
//                         role: message.role,
//                         content: message.content,
//                         sequence:message.sequence,
//                         sources: Array.isArray(message.sources)
//                             ? message.sources
//                             : [],
//                         canCopy: message.role === "assistant",
//                     }))
//                 );
//             } catch (error) {
//                 if (cancelled || requestEpoch !== epoch.current) {
//                     return;
//                 }

//                 setHistoryError(error.message);
//             } finally {
//                 if (!cancelled && requestEpoch === epoch.current) {
//                     setHistoryLoading(false);
//                 }
//             }
//         }

//         loadHistory();

//         return () => {
//             cancelled = true;
//         };
//     }, [urlConversationId]);

//     // documents
//     const [docs, setDocs] = useState({ status: "loading", items: [], error: "" });
//     const [selectedIds, setSelectedIds] = useState([]);
//     const [drawerOpen, setDrawerOpen] = useState(false);
//     const [toDelete, setToDelete] = useState(null);
//     const [deleting, setDeleting] = useState(false);

//     // chat
//     const [messages, setMessages] = useState([
//         { id: "greeting", role: "assistant", content: GREETING, sources: [] },
//     ]);
//     const [question, setQuestion] = useState("");
//     const [conversationId, setConversationId] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const [toast, setToast] = useState(null);

//     const scrollerRef = useRef(null);
//     const endRef = useRef(null);
//     const textareaRef = useRef(null);
//     const epoch = useRef(0); // bumps on "New chat" so late answers are ignored
//     const timers = useRef([]);

//     const showToast = useCallback((message, tone = "success") => {
//         const id = Date.now() + Math.random();
//         setToast({ id, message, tone });
//         timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3000));
//     }, []);
//     useEffect(() => () => timers.current.forEach(clearTimeout), []);

//     /* ---- load documents (GET /api/documents) ------------------------ */
//     const loadDocuments = useCallback(async ({ silent = false } = {}) => {
//         if (!silent) setDocs((s) => ({ ...s, status: s.items.length ? "ready" : "loading", error: "" }));
//         try {
//             const data = await api(DOCUMENTS_URL, { cache: "no-store" }, "Failed to load documents");
//             const items = (data?.documents || []).map(normalizeDoc).sort(byNewest);
//             setDocs({ status: "ready", items, error: "" });
//         } catch (e) {
//             if (silent) return;
//             console.error(e);
//             setDocs((s) => ({ ...s, status: "error", error: e.message }));
//         }
//     }, []);

//     useEffect(() => {
//         loadDocuments();
//     }, [loadDocuments]);

//     // keep refreshing while something is still processing
//     const hasProcessing = docs.items.some((d) => d.status === "processing");
//     useEffect(() => {
//         if (!hasProcessing) return;
//         const t = setInterval(() => loadDocuments({ silent: true }), POLL_MS);
//         return () => clearInterval(t);
//     }, [hasProcessing, loadDocuments]);

//     // drop selections that are no longer ready / no longer exist
//     useEffect(() => {
//         setSelectedIds((cur) => {
//             const next = cur.filter((id) => docs.items.some((d) => d.id === id && d.status === "ready"));
//             return next.length === cur.length ? cur : next;
//         });
//     }, [docs.items]);

//     /* ---- selection (same logic as before) ---------------------------- */
//     const toggleDocument = useCallback((id) => {
//         setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
//     }, []);
//     const clearSelection = useCallback(() => setSelectedIds([]), []);

//     /* ---- delete (DELETE /api/documents) ------------------------------ */
//     const confirmDelete = useCallback(async () => {
//         if (!toDelete) return;
//         setDeleting(true);
//         try {
//             await api(
//                 DOCUMENTS_URL,
//                 {
//                     method: "DELETE",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ documentId: toDelete.id }),
//                 },
//                 "Failed to delete document"
//             );
//             setDocs((s) => ({ ...s, items: s.items.filter((d) => d.id !== toDelete.id) }));
//             setSelectedIds((cur) => cur.filter((id) => id !== toDelete.id));
//             showToast(`“${toDelete.name}” deleted`);
//             setToDelete(null);
//         } catch (e) {
//             console.error(e);
//             showToast(e.message || "Failed to delete document", "error");
//         } finally {
//             setDeleting(false);
//         }
//     }, [toDelete, showToast]);

//     /* ---- ask (POST /api/chat) ---------------------------------------- */
//     const ask = useCallback(
//         async (rawText, { retryOf } = {}) => {
//             const text = rawText.trim();
//             if (!text || loading) return;

//             const myEpoch = epoch.current;

//             setMessages((cur) => {
//                 const base = retryOf ? cur.filter((m) => m.id !== retryOf) : cur;
//                 return retryOf
//                     ? base
//                     : [...base, { id: newId(), role: "user", content: text, sources: [] }];
//             });
//             if (!retryOf) setQuestion("");
//             setLoading(true);

//             try {
//                 const data = await api(
//                     CHAT_URL,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             question: text,
//                             conversationId,
//                             documentIds: selectedIds,
//                         }),
//                     },
//                     "Failed to get answer"
//                 );
//                 if (myEpoch !== epoch.current) return;
//                 setConversationId(data.conversationId);

//                 if (!conversationId) {
//                     router.replace(`/chat/${data.conversationId}`);
//                 }

//                 loadConversations();
//                 setMessages((cur) => [
//                     ...cur,
//                     {
//                         id: newId(),
//                         role: "assistant",
//                         content: data.answer,
//                         sources: data.sources || [],
//                         canCopy: true,
//                     },
//                 ]);
//             } catch (error) {
//                 console.error(error);
//                 if (myEpoch !== epoch.current) return;
//                 setMessages((cur) => [
//                     ...cur,
//                     {
//                         id: newId(),
//                         role: "assistant",
//                         content: "Something went wrong while processing your question.",
//                         sources: [],
//                         error: true,
//                         question: text,
//                     },
//                 ]);
//             } finally {
//                 if (myEpoch === epoch.current) {
//                     setLoading(false);
//                     textareaRef.current?.focus();
//                 }
//             }
//         },
//         [loading, conversationId, selectedIds, router, loadConversations]
//     );

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         ask(question);
//     };

//     // const newChat = useCallback(() => {
//     //     epoch.current += 1;
//     //     setMessages([{ id: "greeting", role: "assistant", content: GREETING, sources: [] }]);
//     //     setConversationId(null);
//     //     setQuestion("");
//     //     setLoading(false);
//     //     textareaRef.current?.focus();
//     // }, []);


//     const newChat = useCallback(() => {
//         epoch.current += 1;

//         setConversationId(null);
//         setQuestion("");
//         setLoading(false);
//         setHistoryError("");

//         setMessages([
//             {
//                 id: "greeting",
//                 role: "assistant",
//                 content: GREETING,
//                 sources: [],
//             },
//         ]);

//         router.push("/chat");
//     }, [router]);

//     const copyText = useCallback(
//         async (text) => {
//             try {
//                 await navigator.clipboard.writeText(text);
//                 showToast("Answer copied");
//             } catch {
//                 showToast("Couldn’t copy to clipboard", "error");
//             }
//         },
//         [showToast]
//     );

//     /* ---- ui behaviour ------------------------------------------------ */
//     useEffect(() => {
//         const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//         endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
//     }, [messages, loading]);

//     // auto-growing textarea
//     useEffect(() => {
//         const el = textareaRef.current;
//         if (!el) return;
//         el.style.height = "auto";
//         el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
//     }, [question]);

//     useEffect(() => {
//         if (!drawerOpen) return;
//         const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
//         window.addEventListener("keydown", onKey);
//         return () => window.removeEventListener("keydown", onKey);
//     }, [drawerOpen]);

//     const onKeyDown = (e) => {
//         if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
//             e.preventDefault();
//             ask(question);
//         }
//     };

//     /* ---- derived ------------------------------------------------------ */
//     const readyCount = docs.items.filter((d) => d.status === "ready").length;
//     const contextLabel =
//         selectedIds.length === 0
//             ? "All documents"
//             : selectedIds.length === 1
//                 ? docs.items.find((d) => d.id === selectedIds[0])?.name || "1 document"
//                 : `${selectedIds.length} documents`;
//     const showSuggestions = messages.length === 1 && !loading && readyCount > 0;

//     const panelProps = {
//         state: docs,
//         selectedIds,
//         onToggle: toggleDocument,
//         onClear: clearSelection,
//         onDelete: setToDelete,
//         onRetry: () => loadDocuments(),
//     };

//     return (
//         <div className="flex h-[100dvh] flex-col bg-black font-['Manrope',sans-serif] text-white antialiased selection:bg-[#7cf9bd] selection:text-black">
//             <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>

//             {/* ---------------- Header ---------------- */}
//             <header className="z-30 shrink-0 border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
//                 <div className="flex h-[72px] items-center justify-between px-5 sm:px-8">
//                     <Link href="/dashboard" aria-label="DocuMind.ai dashboard">
//                         <Logo />
//                     </Link>

//                     <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
//                         <Link
//                             href="/dashboard"
//                             className="rounded-md px-3.5 py-2 text-[14px] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
//                         >
//                             Dashboard
//                         </Link>
//                         <Link
//                             href="/chat"
//                             aria-current="page"
//                             className="rounded-md bg-white/[0.07] px-3.5 py-2 text-[14px] font-medium text-white"
//                         >
//                             Chat
//                         </Link>
//                         <span className="ml-3 hidden items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/55 md:flex">
//                             <span className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]" />
//                             Personal workspace
//                         </span>
//                     </nav>
//                 </div>
//             </header>

//             <div className="flex min-h-0 flex-1">
//                 {/* ---------------- Desktop sidebar ---------------- */}
//                 {/* <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.08] bg-[#060606] lg:block">
//                     <DocumentsPanel {...panelProps} />
//                 </aside> */}

//                 <aside className="hidden w-[300px] shrink-0 flex-col border-r border-white/[0.08] bg-[#060606] lg:flex">
//                     <div className="min-h-0 flex-[1.2]">
//                         <ConversationSidebar
//                             conversations={conversations}
//                             activeConversationId={urlConversationId}
//                             loading={conversationsLoading}
//                             error={conversationsError}
//                             onNewChat={newChat}
//                             onSelect={() => { }}
//                             onRefresh={loadConversations}
//                         />
//                     </div>

//                     <div className="min-h-0 flex-1 border-t border-white/[0.08]">
//                         <DocumentsPanel {...panelProps} />
//                     </div>
//                 </aside>

//                 {/* ---------------- Chat column ---------------- */}
//                 <section className="flex min-w-0 flex-1 flex-col">
//                     {/* chat header */}
//                     <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 sm:px-8">
//                         <div className="flex min-w-0 items-center gap-3">
//                             <button
//                                 onClick={() => setDrawerOpen(true)}
//                                 aria-label="Open documents"
//                                 className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 text-white lg:hidden"
//                             >
//                                 <PanelLeft className="h-4 w-4" />
//                             </button>
//                             <div className="min-w-0">
//                                 <h1 className={`${display} text-[20px] font-medium leading-tight text-white sm:text-[22px]`}>
//                                     Document chat
//                                 </h1>
//                                 <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[12.5px] text-white/65">
//                                     <span className="shrink-0">Chatting with</span>
//                                     <span className="truncate rounded-full border border-[#7cf9bd]/30 bg-[#7cf9bd]/[0.08] px-2.5 py-0.5 text-[11.5px] font-medium text-[#7cf9bd]">
//                                         {contextLabel}
//                                     </span>
//                                 </p>
//                             </div>
//                         </div>

//                         <button
//                             onClick={newChat}
//                             className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-white/15 bg-black px-4 text-[13px] font-medium text-white transition hover:border-[#7cf9bd]/50 hover:bg-[#7cf9bd]/[0.05]"
//                         >
//                             <Plus className="h-4 w-4 text-[#7cf9bd]" />
//                             <span className="hidden sm:inline">New chat</span>
//                         </button>
//                     </div>

//                     {/* messages */}
//                     <div
//                         ref={scrollerRef}
//                         role="log"
//                         aria-live="polite"
//                         className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
//                     >
//                         <div className="mx-auto flex w-full max-w-[820px] flex-col gap-7 px-5 py-8 sm:px-8">
//                             {/* {messages.map((m) => (
//                                 <Message
//                                     key={m.id}
//                                     message={m}
//                                     onCopy={copyText}
//                                     onRetry={(msg) => ask(msg.question, { retryOf: msg.id })}
//                                     retryDisabled={loading}
//                                 />
//                             ))} */}

//                             {historyLoading ? (
//                                 <div className="flex items-center justify-center gap-3 py-16 text-white/60">
//                                     <Loader2 className="h-5 w-5 animate-spin text-[#7cf9bd]" />
//                                     Loading conversation...
//                                 </div>
//                             ) : historyError ? (
//                                 <div className="py-16 text-center text-sm text-red-400">
//                                     {historyError}
//                                 </div>
//                             ) : (
//                                 messages.map((m) => (
//                                     <Message
//                                         key={m.id}
//                                         message={m}
//                                         onCopy={copyText}
//                                         onRetry={(msg) => ask(msg.question, { retryOf: msg.id })}
//                                         retryDisabled={loading}
//                                     />
//                                 ))
//                             )}

//                             <AnimatePresence>
//                                 {showSuggestions && (
//                                     <motion.div
//                                         initial={{ opacity: 0, y: 10 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         exit={{ opacity: 0, y: -6 }}
//                                         transition={{ delay: 0.2 }}
//                                         className="pl-0 sm:pl-[46px]"
//                                     >
//                                         <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/60">
//                                             Try asking
//                                         </p>
//                                         <div className="flex flex-wrap gap-2.5">
//                                             {SUGGESTIONS.map((s) => (
//                                                 <button
//                                                     key={s}
//                                                     onClick={() => ask(s)}
//                                                     className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[13px] text-white/85 transition hover:border-[#7cf9bd]/50 hover:bg-[#7cf9bd]/[0.07] hover:text-white"
//                                                 >
//                                                     {s}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>

//                             <AnimatePresence>{loading && <TypingIndicator key="typing" />}</AnimatePresence>

//                             <div ref={endRef} />
//                         </div>
//                     </div>

//                     {/* input */}
//                     <div className="shrink-0 border-t border-white/[0.08] bg-black px-5 pb-5 pt-4 sm:px-8">
//                         <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[820px]">
//                             <div className="flex items-end gap-3 rounded-xl border border-white/[0.14] bg-[#0b0b0b] p-2.5 pl-4 transition focus-within:border-[#7cf9bd]/60 focus-within:shadow-[0_0_0_3px_rgba(124,249,189,0.08)]">
//                                 <textarea
//                                     ref={textareaRef}
//                                     autoFocus
//                                     rows={1}
//                                     value={question}
//                                     onChange={(e) => setQuestion(e.target.value)}
//                                     onKeyDown={onKeyDown}
//                                     placeholder="Ask a question about your documents..."
//                                     aria-label="Your question"
//                                     className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-white/45"
//                                 />
//                                 <button
//                                     type="submit"
//                                     disabled={loading || !question.trim()}
//                                     aria-label="Send question"
//                                     className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#7cf9bd] text-black transition hover:bg-[#9bffd0] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
//                                 >
//                                     {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-[18px] w-[18px]" disabled={loading || historyLoading || !!historyError || !question.trim()} strokeWidth={2.4} />}
//                                 </button>
//                             </div>
//                             <p className="mt-2.5 text-center text-[11.5px] text-white/50">
//                                 <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10.5px] text-white/70">Enter</kbd> to send ·{" "}
//                                 <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10.5px] text-white/70">Shift + Enter</kbd> for a new line
//                             </p>
//                         </form>
//                     </div>
//                 </section>
//             </div>

//             {/* ---------------- Mobile documents drawer ---------------- */}
//             <AnimatePresence>
//                 {drawerOpen && (
//                     <div className="fixed inset-0 z-50 lg:hidden">
//                         <motion.div
//                             className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             exit={{ opacity: 0 }}
//                             onClick={() => setDrawerOpen(false)}
//                         />
//                         <motion.aside
//                             role="dialog"
//                             aria-modal="true"
//                             aria-label="Your documents"
//                             initial={{ x: "-100%" }}
//                             animate={{ x: 0 }}
//                             exit={{ x: "-100%" }}
//                             transition={{ type: "spring", damping: 30, stiffness: 320 }}
//                             className="absolute inset-y-0 left-0 w-[88vw] max-w-[360px] border-r border-white/[0.1] bg-[#060606]"
//                         >
//                             <DocumentsPanel {...panelProps} onClose={() => setDrawerOpen(false)} />
//                         </motion.aside>
//                     </div>
//                 )}
//             </AnimatePresence>

//             {/* ---------------- Delete confirmation ---------------- */}
//             <AnimatePresence>
//                 {toDelete && (
//                     <ConfirmDelete
//                         key="confirm"
//                         doc={toDelete}
//                         busy={deleting}
//                         onCancel={() => setToDelete(null)}
//                         onConfirm={confirmDelete}
//                     />
//                 )}
//             </AnimatePresence>

//             <Toast toast={toast} />
//         </div>
//     );
// }







"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertCircle,
    ArrowUp,
    Check,
    CheckCircle2,
    Copy,
    FileText,
    FolderOpen,
    Loader2,
    PanelLeft,
    PanelRightClose,
    Plus,
    RefreshCw,
    ScanText,
    Search,
    Sparkles,
    Trash2,
    Upload,
    X,
    XCircle,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import ConversationSidebar from "./ConversationSidebar";
import MarkdownContent from "./Markdowncontent";

/* ------------------------------------------------------------------ */
/* Config + helpers                                                    */
/* ------------------------------------------------------------------ */
const DOCUMENTS_URL = "/api/documents";
const CHAT_URL = "/api/chat";
const POLL_MS = 5000;

const LEFT_W = 272;
const RIGHT_W = 316;

const GREETING = "Hello! Ask me anything about your uploaded documents.";
const SUGGESTIONS = [
    "Summarize the key points",
    "What are the main findings?",
    "List any risks or action items",
];

const display = "font-['Space_Grotesk',sans-serif]";
const eyebrow =
    "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7cf9bd]";

async function api(url, options, fallback = "Request failed") {
    const res = await fetch(url, options);
    let data = null;
    try {
        data = await res.json();
    } catch {
        /* empty body */
    }
    if (!res.ok) throw new Error(data?.error || fallback);
    return data;
}

function normalizeStatus(s) {
    const v = String(s || "").toLowerCase();
    if (["ready", "completed", "complete", "processed", "success"].includes(v)) return "ready";
    if (["failed", "error", "errored"].includes(v)) return "failed";
    return "processing";
}

function normalizeDoc(d) {
    return {
        id: d.id,
        name: d.name || d.fileName || "Untitled document",
        status: normalizeStatus(d.status),
        createdAt: d.createdAt || null,
    };
}

const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

// Oldest -> newest using the Postgres sequence (116, 117, 118, ...).
function bySequence(a, b) {
    const sa = Number(a.sequence);
    const sb = Number(b.sequence);
    const aOk = Number.isFinite(sa);
    const bOk = Number.isFinite(sb);
    if (aOk && bOk && sa !== sb) return sa - sb;
    if (aOk !== bOk) return aOk ? -1 : 1;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
}

let messageCounter = 0;
const newId = () => `m${Date.now()}-${messageCounter++}`;

function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [query]);
    return matches;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */
function Logo() {
    return (
        <div className={`${display} flex items-center gap-2 text-[19px] font-bold tracking-tight text-white sm:gap-2.5 sm:text-[22px]`}>
            <ScanText className="h-5 w-5 text-[#7cf9bd] sm:h-6 sm:w-6" strokeWidth={1.75} />
            <span>
                DocuMind<span className="text-white/50">.ai</span>
            </span>
        </div>
    );
}

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-white/[0.07] ${className}`} />;
}

function DocStatus({ status }) {
    if (status === "ready")
        return (
            <span className="flex items-center gap-1 text-[11px] text-[#7cf9bd]">
                <CheckCircle2 className="h-3 w-3" /> Ready
            </span>
        );
    if (status === "failed")
        return (
            <span className="flex items-center gap-1 text-[11px] text-red-400">
                <XCircle className="h-3 w-3" /> Failed
            </span>
        );
    return (
        <span className="flex items-center gap-1 text-[11px] text-white/60">
            <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Generic slide-in drawer (tablet / mobile)                           */
/* ------------------------------------------------------------------ */
function Drawer({ open, side = "left", label, hideFrom, onClose, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const from = side === "left" ? "-100%" : "100%";

    return (
        <AnimatePresence>
            {open && (
                <div className={`fixed inset-0 z-50 ${hideFrom}`}>
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={label}
                        initial={{ x: from }}
                        animate={{ x: 0 }}
                        exit={{ x: from }}
                        transition={{ type: "spring", damping: 30, stiffness: 320 }}
                        className={`absolute inset-y-0 w-[88vw] max-w-[360px] bg-[#060606] ${side === "left"
                            ? "left-0 border-r border-white/[0.1]"
                            : "right-0 border-l border-white/[0.1]"
                            }`}
                    >
                        {children}
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}

/* ------------------------------------------------------------------ */
/* Collapsible desktop column                                          */
/* ------------------------------------------------------------------ */
function CollapsibleAside({ open, width, side, showFrom, children }) {
    return (
        <motion.aside
            initial={false}
            animate={{ width: open ? width : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            aria-hidden={!open}
            className={`hidden shrink-0 overflow-hidden bg-[#060606] ${showFrom} ${open ? (side === "left" ? "border-r border-white/[0.08]" : "border-l border-white/[0.08]") : ""
                }`}
        >
            <div
                style={{ width }}
                className={`h-full transition-[visibility] ${open ? "" : "invisible delay-300"}`}
            >
                {children}
            </div>
        </motion.aside>
    );
}

/* ------------------------------------------------------------------ */
/* Documents panel                                                     */
/* ------------------------------------------------------------------ */
function DocumentsPanel({
    state,
    selectedIds,
    onToggle,
    onClear,
    onDelete,
    onRetry,
    onClose,
    drawer = false,
}) {
    const [search, setSearch] = useState("");

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return q ? state.items.filter((d) => d.name.toLowerCase().includes(q)) : state.items;
    }, [state.items, search]);

    const loading = state.status === "loading" && state.items.length === 0;
    const failed = state.status === "error" && state.items.length === 0;
    const allActive = selectedIds.length === 0;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <p className={eyebrow}>
                    <FolderOpen className="h-3.5 w-3.5" />
                    Your documents
                    <span className="font-medium normal-case tracking-normal text-white/50">
                        {state.items.length}
                    </span>
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label={drawer ? "Close documents" : "Hide documents"}
                        title={drawer ? "Close" : "Hide panel"}
                        className="grid h-8 w-8 place-items-center rounded-md text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                    >
                        {drawer ? <X className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
                    </button>
                )}
            </div>

            {/* search */}
            <div className="px-4">
                <label className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition focus-within:border-[#7cf9bd]/50">
                    <Search className="h-3.5 w-3.5 shrink-0 text-white/50" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search documents..."
                        aria-label="Search documents"
                        autoComplete="off"
                        className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="text-white/50 hover:text-white"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </label>
            </div>

            {/* all documents */}
            <div className="px-4 pt-3">
                <button
                    type="button"
                    onClick={onClear}
                    aria-pressed={allActive}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${allActive
                        ? "border-[#7cf9bd]/40 bg-[#7cf9bd]/[0.08]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        }`}
                >
                    <span
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${allActive ? "border-[#7cf9bd] bg-[#7cf9bd] text-black" : "border-white/30"
                            }`}
                    >
                        {allActive && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[13px] font-medium text-white">All documents</span>
                        <span className="block text-[11.5px] text-white/60">Ask across your whole library</span>
                    </span>
                </button>
            </div>

            {/* list */}
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-4 pb-3">
                {loading && (
                    <div className="space-y-2" aria-busy="true">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3">
                                <Skeleton className="h-5 w-5 rounded" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-2.5 w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {failed && (
                    <div className="flex flex-col items-center py-10 text-center">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                        <p className="mt-3 text-[13px] font-medium text-white">Couldn’t load documents</p>
                        <p className="mt-1 text-[12px] text-white/60">{state.error}</p>
                        <button
                            onClick={onRetry}
                            className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-4 text-[12px] text-white transition hover:border-[#7cf9bd]/60 hover:text-[#7cf9bd]"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Try again
                        </button>
                    </div>
                )}

                {!loading && !failed && state.items.length === 0 && (
                    <div className="flex flex-col items-center py-10 text-center">
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
                            <FileText className="h-5 w-5 text-white/60" />
                        </span>
                        <p className="mt-3 text-[13px] font-medium text-white">No documents uploaded yet</p>
                        <Link
                            href="/dashboard"
                            className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-[#7cf9bd] px-4 text-[12px] font-medium text-black transition hover:bg-[#9bffd0]"
                        >
                            <Upload className="h-3.5 w-3.5" /> Upload a PDF
                        </Link>
                    </div>
                )}

                {!loading && !failed && state.items.length > 0 && visible.length === 0 && (
                    <p className="py-10 text-center text-[12.5px] text-white/60">
                        No documents match “{search.trim()}”.
                    </p>
                )}

                <ul className="space-y-2">
                    <AnimatePresence initial={false}>
                        {visible.map((doc) => {
                            const selectable = doc.status === "ready";
                            const selected = selectedIds.includes(doc.id);
                            return (
                                <motion.li
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ duration: 0.25 }}
                                    className={`group flex items-stretch rounded-lg border transition ${selected
                                        ? "border-[#7cf9bd]/40 bg-[#7cf9bd]/[0.08]"
                                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                                        } ${selectable ? "" : "opacity-60"}`}
                                >
                                    <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={selected}
                                        disabled={!selectable}
                                        onClick={() => onToggle(doc.id)}
                                        title={selectable ? undefined : "This document isn’t ready to chat yet"}
                                        className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left ${selectable ? "" : "cursor-not-allowed"
                                            }`}
                                    >
                                        <span
                                            className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${selected ? "border-[#7cf9bd] bg-[#7cf9bd] text-black" : "border-white/30"
                                                }`}
                                        >
                                            {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-[13px] font-medium text-white">{doc.name}</span>
                                            <span className="mt-1 block">
                                                <DocStatus status={doc.status} />
                                            </span>
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDelete(doc)}
                                        aria-label={`Delete ${doc.name}`}
                                        className="mr-1.5 grid w-9 shrink-0 place-items-center self-center rounded-md py-2 text-white/50 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            </div>

            <div className="border-t border-white/[0.08] px-4 py-3.5">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-[12px] text-white/65 transition hover:text-[#7cf9bd]"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Add more documents in your dashboard
                </Link>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */
function SourceChips({ sources }) {
    // de-duplicate the same document + page
    const unique = useMemo(() => {
        const seen = new Set();
        return (sources || []).filter((s) => {
            const key = `${s.documentName}::${s.pageNumber}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [sources]);

    if (unique.length === 0) return null;

    return (
        <div className="mt-4 border-t border-white/[0.08] pt-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">
                Sources
            </p>
            <div className="flex flex-wrap gap-2">
                {unique.map((s, i) => (
                    <motion.span
                        key={`${s.documentName}-${s.pageNumber}-${i}`}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 * i, duration: 0.25 }}
                        className="inline-flex max-w-full items-center gap-2 rounded-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.06] px-2.5 py-1.5 text-[12px] text-[#7cf9bd]"
                    >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            {s.documentName}
                            {s.pageNumber != null && s.pageNumber !== "" ? ` · Page ${s.pageNumber}` : ""}
                        </span>
                    </motion.span>
                ))}
            </div>
        </div>
    );
}

function AssistantAvatar({ error }) {
    return (
        <span
            className={`mt-0.5 hidden h-8 w-8 shrink-0 place-items-center rounded-lg border sm:grid ${error ? "border-red-400/30 bg-red-400/10" : "border-[#7cf9bd]/30 bg-[#7cf9bd]/10"
                }`}
        >
            {error ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
            ) : (
                <Sparkles className="h-4 w-4 text-[#7cf9bd]" />
            )}
        </span>
    );
}

function Message({ message, index = 0, onCopy, onRetry, retryDisabled }) {
    // Messages loaded from history fade in one after another, in order.
    const delay = message.fromHistory ? Math.min(index, 14) * 0.05 : 0;

    if (message.role === "user") {
        return (
            <motion.div
                layout="position"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay }}
                className="flex justify-end"
            >
                <div className="max-w-[92%] rounded-2xl rounded-br-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.1] px-4 py-3 sm:max-w-[80%] sm:px-5">
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white">
                        {message.content}
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="flex gap-3"
        >
            <AssistantAvatar error={message.error} />
            <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white">DocuMind</p>

                <div
                    className={`mt-1.5 rounded-2xl rounded-tl-md border px-4 py-3.5 sm:px-5 sm:py-4 ${message.error
                        ? "border-red-400/30 bg-red-400/[0.06]"
                        : "border-white/[0.1] bg-[#0b0b0b]"
                        }`}
                >
                    {message.error ? (
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-white/90">
                            {message.content}
                        </p>
                    ) : (
                        <MarkdownContent content={message.content} />
                    )}
                    <SourceChips sources={message.sources} />
                </div>

                <div className="mt-1.5 flex items-center gap-1 pl-1">
                    {message.error ? (
                        <button
                            onClick={() => onRetry(message)}
                            disabled={retryDisabled}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                        >
                            <RefreshCw className="h-3.5 w-3.5" /> Try again
                        </button>
                    ) : (
                        message.canCopy && (
                            <button
                                onClick={() => onCopy(message.content)}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                            >
                                <Copy className="h-3.5 w-3.5" /> Copy
                            </button>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3"
            role="status"
            aria-label="DocuMind is thinking"
        >
            <AssistantAvatar />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-white/[0.1] bg-[#0b0b0b] px-4 py-3.5">
                {[0, 1, 2].map((d) => (
                    <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]"
                        animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                ))}
                <span className="ml-2 text-[13px] text-white/65">Searching your documents…</span>
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Delete confirmation modal (replaces window.confirm)                 */
/* ------------------------------------------------------------------ */
function ConfirmDelete({ doc, busy, onCancel, onConfirm }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && !busy && onCancel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [busy, onCancel]);

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
            <motion.div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !busy && onCancel()}
            />
            <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-title"
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.97 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className="relative w-full max-w-[420px] rounded-xl border border-white/[0.12] bg-[#0a0a0a] p-5 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] sm:p-6"
            >
                <span className="grid h-11 w-11 place-items-center rounded-full border border-red-400/30 bg-red-400/10">
                    <Trash2 className="h-5 w-5 text-red-400" />
                </span>
                <h2 id="delete-title" className={`${display} mt-4 text-[20px] font-medium text-white sm:text-[22px]`}>
                    Delete this document?
                </h2>
                <p className="mt-2 break-words text-[13.5px] leading-6 text-white/70">
                    <span className="font-medium text-white">{doc.name}</span> will be permanently removed from
                    your library. This can’t be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="h-10 rounded-md border border-white/15 px-5 text-[13px] font-medium text-white transition hover:border-white/35 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        autoFocus
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-red-500 px-5 text-[13px] font-medium text-white transition hover:bg-red-400 disabled:opacity-60"
                    >
                        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {busy ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
function Toast({ toast }) {
    const isError = toast?.tone === "error";
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[110] flex justify-center px-4">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key={toast.id}
                        role="status"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ type: "spring", damping: 24, stiffness: 320 }}
                        className={`pointer-events-auto flex max-w-full items-center gap-3 rounded-lg border px-4 py-3 text-[13px] text-white shadow-2xl ${isError ? "border-red-400/35 bg-[#1a0f0f]" : "border-[#7cf9bd]/30 bg-[#0c1511]"
                            }`}
                    >
                        {isError ? (
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#7cf9bd]" />
                        )}
                        <span className="min-w-0 break-words">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function ChatWorkspace() {
    const router = useRouter();
    const params = useParams();

    const urlConversationId =
        typeof params?.conversationId === "string" ? params.conversationId : null;

    const isLg = useMediaQuery("(min-width: 1024px)");
    const isXl = useMediaQuery("(min-width: 1280px)");

    // conversations (left column)
    const [conversations, setConversations] = useState([]);
    const [conversationsLoading, setConversationsLoading] = useState(true);
    const [conversationsError, setConversationsError] = useState("");
    const [historyLoading, setHistoryLoading] = useState(Boolean(urlConversationId));
    const [historyError, setHistoryError] = useState("");

    // documents (right column)
    const [docs, setDocs] = useState({ status: "loading", items: [], error: "" });
    const [selectedIds, setSelectedIds] = useState([]);
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // desktop collapse state (remembered) + tablet/mobile drawers
    const [leftOpen, setLeftOpenState] = useState(true);
    const [rightOpen, setRightOpenState] = useState(true);
    const [convDrawerOpen, setConvDrawerOpen] = useState(false);
    const [docsDrawerOpen, setDocsDrawerOpen] = useState(false);

    useEffect(() => {
        try {
            const l = localStorage.getItem("documind:left");
            const r = localStorage.getItem("documind:right");
            if (l !== null) setLeftOpenState(l === "1");
            if (r !== null) setRightOpenState(r === "1");
        } catch {
            /* storage unavailable */
        }
    }, []);

    const setLeftOpen = useCallback((v) => {
        setLeftOpenState(v);
        try {
            localStorage.setItem("documind:left", v ? "1" : "0");
        } catch { }
    }, []);
    const setRightOpen = useCallback((v) => {
        setRightOpenState(v);
        try {
            localStorage.setItem("documind:right", v ? "1" : "0");
        } catch { }
    }, []);

    const openConversations = () => (isLg ? setLeftOpen(true) : setConvDrawerOpen(true));
    const openDocuments = () => (isXl ? setRightOpen(true) : setDocsDrawerOpen(true));

    // chat
    const [messages, setMessages] = useState([
        { id: "greeting", role: "assistant", content: GREETING, sources: [] },
    ]);
    const [question, setQuestion] = useState("");
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState(null);

    const scrollerRef = useRef(null);
    const endRef = useRef(null);
    const textareaRef = useRef(null);
    const epoch = useRef(0); // bumps on "New chat" so late answers are ignored
    const timers = useRef([]);

    const showToast = useCallback((message, tone = "success") => {
        const id = Date.now() + Math.random();
        setToast({ id, message, tone });
        timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3000));
    }, []);
    useEffect(() => () => timers.current.forEach(clearTimeout), []);

    /* ---- load conversation list -------------------------------------- */
    const loadConversations = useCallback(async () => {
        setConversationsLoading(true);
        setConversationsError("");

        try {
            const data = await api(
                "/api/conversation.js",
                { cache: "no-store" },
                "Failed to load conversations"
            );
            setConversations(data.conversations || []);
        } catch (error) {
            setConversationsError(error.message);
        } finally {
            setConversationsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    /* ---- load history of the conversation in the URL ----------------- */
    useEffect(() => {
        let cancelled = false;

        const requestEpoch = ++epoch.current;

        async function loadHistory() {
            setConversationId(urlConversationId);
            setHistoryError("");
            setQuestion("");

            if (!urlConversationId) {
                setHistoryLoading(false);

                setMessages([
                    {
                        id: "greeting",
                        role: "assistant",
                        content: GREETING,
                        sources: [],
                    },
                ]);

                return;
            }

            setHistoryLoading(true);
            setMessages([]);

            try {
                const data = await api(
                    `/api/conversation.js/${encodeURIComponent(urlConversationId)}`,
                    { cache: "no-store" },
                    "Failed to load conversation"
                );

                if (cancelled || requestEpoch !== epoch.current) {
                    return;
                }

                setMessages(
                    (data.messages || [])
                        .map((message) => ({
                            id: message.id,
                            role: message.role,
                            content: message.content,
                            sequence: message.sequence,
                            createdAt: message.createdAt || null,
                            sources: Array.isArray(message.sources) ? message.sources : [],
                            canCopy: message.role === "assistant",
                            fromHistory: true,
                        }))
                        // render strictly in database order: 116, 117, 118, 119 ...
                        .sort(bySequence)
                );
            } catch (error) {
                if (cancelled || requestEpoch !== epoch.current) {
                    return;
                }

                setHistoryError(error.message);
            } finally {
                if (!cancelled && requestEpoch === epoch.current) {
                    setHistoryLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [urlConversationId]);

    // close the conversations drawer after navigating to another chat
    useEffect(() => {
        setConvDrawerOpen(false);
    }, [urlConversationId]);

    /* ---- load documents (GET /api/documents) ------------------------ */
    const loadDocuments = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setDocs((s) => ({ ...s, status: s.items.length ? "ready" : "loading", error: "" }));
        try {
            const data = await api(DOCUMENTS_URL, { cache: "no-store" }, "Failed to load documents");
            const items = (data?.documents || []).map(normalizeDoc).sort(byNewest);
            setDocs({ status: "ready", items, error: "" });
        } catch (e) {
            if (silent) return;
            console.error(e);
            setDocs((s) => ({ ...s, status: "error", error: e.message }));
        }
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    // keep refreshing while something is still processing
    const hasProcessing = docs.items.some((d) => d.status === "processing");
    useEffect(() => {
        if (!hasProcessing) return;
        const t = setInterval(() => loadDocuments({ silent: true }), POLL_MS);
        return () => clearInterval(t);
    }, [hasProcessing, loadDocuments]);

    // drop selections that are no longer ready / no longer exist
    useEffect(() => {
        setSelectedIds((cur) => {
            const next = cur.filter((id) => docs.items.some((d) => d.id === id && d.status === "ready"));
            return next.length === cur.length ? cur : next;
        });
    }, [docs.items]);

    /* ---- selection ---------------------------------------------------- */
    const toggleDocument = useCallback((id) => {
        setSelectedIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
    }, []);
    const clearSelection = useCallback(() => setSelectedIds([]), []);

    /* ---- delete (DELETE /api/documents) ------------------------------ */
    const confirmDelete = useCallback(async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await api(
                DOCUMENTS_URL,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: toDelete.id }),
                },
                "Failed to delete document"
            );
            setDocs((s) => ({ ...s, items: s.items.filter((d) => d.id !== toDelete.id) }));
            setSelectedIds((cur) => cur.filter((id) => id !== toDelete.id));
            showToast(`“${toDelete.name}” deleted`);
            setToDelete(null);
        } catch (e) {
            console.error(e);
            showToast(e.message || "Failed to delete document", "error");
        } finally {
            setDeleting(false);
        }
    }, [toDelete, showToast]);

    /* ---- ask (POST /api/chat) ---------------------------------------- */
    const ask = useCallback(
        async (rawText, { retryOf } = {}) => {
            const text = rawText.trim();
            if (!text || loading) return;

            const myEpoch = epoch.current;

            setMessages((cur) => {
                const base = retryOf ? cur.filter((m) => m.id !== retryOf) : cur;
                return retryOf
                    ? base
                    : [...base, { id: newId(), role: "user", content: text, sources: [] }];
            });
            if (!retryOf) setQuestion("");
            setLoading(true);

            try {
                const data = await api(
                    CHAT_URL,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            question: text,
                            conversationId,
                            documentIds: selectedIds,
                        }),
                    },
                    "Failed to get answer"
                );
                if (myEpoch !== epoch.current) return;
                setConversationId(data.conversationId);

                if (!conversationId) {
                    router.replace(`/chat/${data.conversationId}`);
                }

                loadConversations();
                setMessages((cur) => [
                    ...cur,
                    {
                        id: newId(),
                        role: "assistant",
                        content: data.answer,
                        sources: data.sources || [],
                        canCopy: true,
                    },
                ]);
            } catch (error) {
                console.error(error);
                if (myEpoch !== epoch.current) return;
                setMessages((cur) => [
                    ...cur,
                    {
                        id: newId(),
                        role: "assistant",
                        content: "Something went wrong while processing your question.",
                        sources: [],
                        error: true,
                        question: text,
                    },
                ]);
            } finally {
                if (myEpoch === epoch.current) {
                    setLoading(false);
                    textareaRef.current?.focus();
                }
            }
        },
        [loading, conversationId, selectedIds, router, loadConversations]
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        ask(question);
    };

    const newChat = useCallback(() => {
        epoch.current += 1;

        setConversationId(null);
        setQuestion("");
        setLoading(false);
        setHistoryError("");
        setConvDrawerOpen(false);

        setMessages([
            {
                id: "greeting",
                role: "assistant",
                content: GREETING,
                sources: [],
            },
        ]);

        router.push("/chat");
    }, [router]);

    const copyText = useCallback(
        async (text) => {
            try {
                await navigator.clipboard.writeText(text);
                showToast("Answer copied");
            } catch {
                showToast("Couldn’t copy to clipboard", "error");
            }
        },
        [showToast]
    );

    /* ---- ui behaviour ------------------------------------------------ */
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
    }, [messages, loading]);

    // auto-growing textarea (compact: max ~5 lines)
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    }, [question]);

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            ask(question);
        }
    };

    /* ---- derived ------------------------------------------------------ */
    const readyCount = docs.items.filter((d) => d.status === "ready").length;
    const contextLabel =
        selectedIds.length === 0
            ? "All documents"
            : selectedIds.length === 1
                ? docs.items.find((d) => d.id === selectedIds[0])?.name || "1 document"
                : `${selectedIds.length} documents`;
    const showSuggestions = messages.length === 1 && !loading && readyCount > 0;

    const panelProps = {
        state: docs,
        selectedIds,
        onToggle: toggleDocument,
        onClear: clearSelection,
        onDelete: setToDelete,
        onRetry: () => loadDocuments(),
    };

    const sidebarProps = {
        conversations,
        activeConversationId: urlConversationId,
        loading: conversationsLoading,
        error: conversationsError,
        onNewChat: newChat,
        onSelect: () => setConvDrawerOpen(false),
        onRefresh: loadConversations,
    };

    const iconBtn =
        "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/15 text-white transition hover:border-[#7cf9bd]/50 hover:bg-[#7cf9bd]/[0.05] sm:h-10 sm:w-10";

    return (
        <div className="flex h-[100dvh] flex-col bg-black font-['Manrope',sans-serif] text-white antialiased selection:bg-[#7cf9bd] selection:text-black">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>

            {/* ---------------- Top bar ---------------- */}
            <header className="z-30 shrink-0 border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
                <div className="flex h-14 items-center justify-between px-4 sm:h-[68px] sm:px-8">
                    <Link href="/dashboard" aria-label="DocuMind.ai dashboard">
                        <Logo />
                    </Link>

                    <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/dashboard"
                            className="rounded-md px-3 py-2 text-[13px] text-white/70 transition hover:bg-white/[0.05] hover:text-white sm:px-3.5 sm:text-[14px]"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/chat"
                            aria-current="page"
                            className="rounded-md bg-white/[0.07] px-3 py-2 text-[13px] font-medium text-white sm:px-3.5 sm:text-[14px]"
                        >
                            Chat
                        </Link>
                        <span className="ml-3 hidden items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/55 xl:flex">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]" />
                            Personal workspace
                        </span>
                    </nav>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* ---------------- LEFT: conversations (collapsible, lg+) ---------------- */}
                <CollapsibleAside open={leftOpen} width={LEFT_W} side="left" showFrom="lg:block">
                    <ConversationSidebar {...sidebarProps} onClose={() => setLeftOpen(false)} />
                </CollapsibleAside>

                {/* ---------------- CENTER: chat ---------------- */}
                <section className="flex min-w-0 flex-1 flex-col">
                    {/* chat toolbar */}
                    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3.5">
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            {/* shown on mobile always, on desktop only while the sidebar is hidden */}
                            <button
                                onClick={openConversations}
                                aria-label="Show conversations"
                                title="Conversations"
                                className={`${iconBtn} ${leftOpen ? "lg:hidden" : ""}`}
                            >
                                <PanelLeft className="h-4 w-4" />
                            </button>

                            <div className="min-w-0">
                                <h1 className={`${display} truncate text-[17px] font-medium leading-tight text-white sm:text-[20px]`}>
                                    Document chat
                                </h1>
                                <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[12px] text-white/65">
                                    <span className="hidden shrink-0 sm:inline">Chatting with</span>
                                    <span className="truncate rounded-full border border-[#7cf9bd]/30 bg-[#7cf9bd]/[0.08] px-2.5 py-0.5 text-[11.5px] font-medium text-[#7cf9bd]">
                                        {contextLabel}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {/* "New chat" lives in the sidebar; this icon only appears when that sidebar is not visible */}
                            <button
                                onClick={newChat}
                                aria-label="New chat"
                                title="New chat"
                                className={`${iconBtn} ${leftOpen ? "lg:hidden" : ""}`}
                            >
                                <Plus className="h-4 w-4 text-[#7cf9bd]" />
                            </button>

                            {/* documents: mobile always, desktop only while the panel is hidden */}
                            <button
                                onClick={openDocuments}
                                aria-label="Show documents"
                                title="Documents"
                                className={`relative inline-flex h-9 items-center gap-2 rounded-md border border-white/15 px-2.5 text-[13px] font-medium text-white transition hover:border-[#7cf9bd]/50 sm:h-10 sm:px-3.5 ${rightOpen ? "xl:hidden" : ""}`}
                            >
                                <FolderOpen className="h-4 w-4 text-[#7cf9bd]" />
                                <span className="hidden sm:inline">Documents</span>
                                {selectedIds.length > 0 && (
                                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#7cf9bd] px-1.5 text-[11px] font-semibold text-black">
                                        {selectedIds.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* messages */}
                    <div
                        ref={scrollerRef}
                        role="log"
                        aria-live="polite"
                        className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
                    >
                        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-6 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8 lg:px-8">
                            {historyLoading ? (
                                <div className="flex items-center justify-center gap-3 py-16 text-white/60">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#7cf9bd]" />
                                    Loading conversation...
                                </div>
                            ) : historyError ? (
                                <div className="py-16 text-center text-sm text-red-400">
                                    {historyError}
                                </div>
                            ) : (
                                messages.map((m, i) => (
                                    <Message
                                        key={m.id}
                                        index={i}
                                        message={m}
                                        onCopy={copyText}
                                        onRetry={(msg) => ask(msg.question, { retryOf: msg.id })}
                                        retryDisabled={loading}
                                    />
                                ))
                            )}

                            <AnimatePresence>
                                {showSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ delay: 0.2 }}
                                        className="pl-0 sm:pl-11"
                                    >
                                        <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/60">
                                            Try asking
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {SUGGESTIONS.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => ask(s)}
                                                    className="rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 text-left text-[13px] text-white/85 transition hover:border-[#7cf9bd]/50 hover:bg-[#7cf9bd]/[0.07] hover:text-white"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>{loading && <TypingIndicator key="typing" />}</AnimatePresence>

                            <div ref={endRef} />
                        </div>
                    </div>

                    {/* composer (compact) */}
                    <div className="shrink-0 border-t border-white/[0.08] bg-black px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-8">
                        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[820px]">
                            <div className="flex items-end gap-2 rounded-xl border border-white/[0.14] bg-[#0b0b0b] p-1.5 pl-3.5 transition focus-within:border-[#7cf9bd]/60 focus-within:shadow-[0_0_0_3px_rgba(124,249,189,0.08)]">
                                <textarea
                                    ref={textareaRef}
                                    autoFocus
                                    rows={1}
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Ask a question about your documents..."
                                    aria-label="Your question"
                                    className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-5 text-white outline-none placeholder:text-white/45"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !question.trim()}
                                    aria-label="Send question"
                                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#7cf9bd] text-black transition hover:bg-[#9bffd0] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.4} />
                                    )}
                                </button>
                            </div>
                            <p className="mt-2 hidden text-center text-[11px] text-white/45 sm:block">
                                <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">Enter</kbd> to send ·{" "}
                                <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] text-white/70">Shift + Enter</kbd> for a new line
                            </p>
                        </form>
                    </div>
                </section>

                {/* ---------------- RIGHT: documents (collapsible, xl+) ---------------- */}
                <CollapsibleAside open={rightOpen} width={RIGHT_W} side="right" showFrom="xl:block">
                    <DocumentsPanel {...panelProps} onClose={() => setRightOpen(false)} />
                </CollapsibleAside>
            </div>

            {/* ---------------- Drawers (below lg / below xl) ---------------- */}
            <Drawer
                open={convDrawerOpen}
                side="left"
                label="Your conversations"
                hideFrom="lg:hidden"
                onClose={() => setConvDrawerOpen(false)}
            >
                <ConversationSidebar {...sidebarProps} drawer onClose={() => setConvDrawerOpen(false)} />
            </Drawer>

            <Drawer
                open={docsDrawerOpen}
                side="right"
                label="Your documents"
                hideFrom="xl:hidden"
                onClose={() => setDocsDrawerOpen(false)}
            >
                <DocumentsPanel {...panelProps} drawer onClose={() => setDocsDrawerOpen(false)} />
            </Drawer>

            {/* ---------------- Delete confirmation ---------------- */}
            <AnimatePresence>
                {toDelete && (
                    <ConfirmDelete
                        key="confirm"
                        doc={toDelete}
                        busy={deleting}
                        onCancel={() => setToDelete(null)}
                        onConfirm={confirmDelete}
                    />
                )}
            </AnimatePresence>

            <Toast toast={toast} />
        </div>
    );
}