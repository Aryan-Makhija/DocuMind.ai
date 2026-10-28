
"use client";
import Link from "next/link";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Files,
  FileUp,
  FolderOpen,
  Loader2,
  MessageSquare,
  RefreshCw,
  ScanText,
  Search,
  ShieldCheck,
  Upload,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ApiError } from "@/lib/api/ApiError";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const API = {
  upload: "/api/documents/upload", // POST  (from your documents page)
  documents: "/api/documents", //     GET   <- change if your route differs
  stats: "/api/UserStats", //         GET   <- change if your route differs
};
const MAX_SIZE_MB = 10; // same limit as your existing upload validation
const POLL_MS = 5000; //   re-check stats while documents are still processing

const display = "font-['Space_Grotesk',sans-serif]";
const eyebrow =
  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7cf9bd]";

const STATUS = {
  ready: { label: "Ready", cls: "text-[#7cf9bd]", Icon: CheckCircle2 },
  processing: { label: "Processing", cls: "text-white/50", Icon: Loader2, spin: true },
  failed: { label: "Failed", cls: "text-red-400", Icon: XCircle },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
/**
 * fetch + JSON. On a non-2xx response it throws an ApiError.
 * Understands your server shape  { error: { code, message, details } }
 * and also the older  { error: "text" }  shape.
 */
async function api(url, options) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const e = data?.error;
    const isObj = e && typeof e === "object";
    const code =
      (isObj && e.code) || data?.code || (res.status === 401 ? "UNAUTHORIZED" : "UNKNOWN_ERROR");
    const message =
      res.status === 401
        ? "You're signed out. Please sign in again."
        : (isObj ? e.message : e) || data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, code, (isObj && e.details) || null);
  }
  return data;
}

/** Turns any upload failure into a friendly message + toast tone. */
function describeUploadError(error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "DUPLICATE_DOCUMENT":
        return { tone: "warning", message: "This document has already been uploaded." };
      case "INVALID_FILE":
        return { tone: "error", message: "Please upload a valid PDF file." };
      case "FILE_TOO_LARGE":
        return { tone: "error", message: "PDF file exceeds the allowed size." };
      case "RATE_LIMIT_EXCEEDED":
        return { tone: "error", message: "Too many uploads. Please try again later." };
      case "UNAUTHORIZED":
        return { tone: "error", message: "Please sign in to upload documents." };
      default:
        break;
    }
    // fall back on the HTTP status if the server sent no known code
    if (error.status === 413) return { tone: "error", message: "PDF file exceeds the allowed size." };
    if (error.status === 429)
      return { tone: "error", message: "Too many uploads. Please try again later." };
    return { tone: "error", message: error.message || "Upload failed. Please try again." };
  }
  if (error instanceof TypeError) {
    // fetch itself failed (offline, server down...)
    return {
      tone: "error",
      message: "Couldn’t reach the server. Check your connection and try again.",
    };
  }
  return { tone: "error", message: "Unable to upload document. Please try again." };
}

/** Any backend status -> "ready" | "processing" | "failed" */
function normalizeStatus(s) {
  const v = String(s || "").toLowerCase();
  if (["ready", "completed", "complete", "processed", "success"].includes(v)) return "ready";
  if (["failed", "error", "errored"].includes(v)) return "failed";
  return "processing"; // pending, processing, uploading, queued ...
}

/** Shape of both `documents[]` and `latestDocuments[]` -> one UI shape */
function normalizeDoc(d) {
  return {
    id: d.id,
    name: d.name || d.fileName || "Untitled document",
    fileName: d.fileName || d.name || "",
    size: d.fileSize != null && d.fileSize !== "" ? Number(d.fileSize) : null,
    status: normalizeStatus(d.status),
    // your GET route currently selects this as `eerrorMessage` (typo) — both are read
    error: d.errorMessage || d.eerrorMessage || "",
    createdAt: d.createdAt || null,
  };
}

const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

function formatSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(new Date()) - day(d)) / 86400000);
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function docMeta(doc) {
  const when = doc.local ? "Just now" : formatDate(doc.createdAt);
  return [when, formatSize(doc.size)].filter(Boolean).join(" · ");
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function useDebounced(value, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */
function Logo() {
  return (
    <div className={`${display} flex items-center gap-2.5 text-[24px] font-bold tracking-tight text-white`}>
      <ScanText className="h-7 w-7 text-[#7cf9bd]" strokeWidth={1.75} />
      <span>
        DocuMind<span className="text-white/50">.ai</span>
      </span>
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-white/[0.07] ${className}`} />;
}

/** Number that counts up with GSAP whenever `value` changes. */
function AnimatedNumber({ value }) {
  const ref = useRef(null);
  const state = useRef({ v: 0 });

  useEffect(() => {
    const el = ref.current;
    const tween = gsap.to(state.current, {
      v: value,
      duration: prefersReducedMotion() ? 0 : 1.1,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(state.current.v);
      },
    });
    return () => tween.kill();
  }, [value]);

  return <span ref={ref}>0</span>;
}

/** Wraps search matches in <mark> */
function Highlight({ text, tokens }) {
  if (!tokens?.length) return text;
  const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-[#7cf9bd]/20 px-0.5 text-[#7cf9bd]">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function StatusBadge({ status }) {
  const { label, cls, Icon, spin } = STATUS[status];
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex shrink-0 items-center gap-1.5 text-[11.5px] ${cls}`}
    >
      <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />
      {label}
    </motion.span>
  );
}

// forwardRef is required because AnimatePresence mode="popLayout" needs the DOM node
const DocRow = forwardRef(function DocRow(
  { doc, index = 0, padded = "py-4", tokens, onDismiss },
  ref
) {
  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.03 }}
      className={`group flex items-center justify-between gap-4 border-b border-white/[0.07] ${padded}`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.02] transition-colors group-hover:border-[#7cf9bd]/30">
          <FileText className="h-[18px] w-[18px] text-[#7cf9bd]" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-white">
            <Highlight text={doc.name} tokens={tokens} />
          </p>
          <p className="mt-1 truncate text-[11px] text-white/40">{docMeta(doc)}</p>
          {doc.status === "failed" && doc.error && (
            <p className="mt-1 truncate text-[11px] text-red-400/80">{doc.error}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={doc.status} />
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label={`Dismiss ${doc.name}`}
            className="grid h-6 w-6 place-items-center rounded text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.li>
  );
});

/* ------------------------------------------------------------------ */
/* Modal shell — backdrop + panel with enter / exit animation          */
/* ------------------------------------------------------------------ */
function Modal({ onClose, labelledBy, className = "", children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.97 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        className={`relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0a] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9),0_0_80px_-40px_rgba(124,249,189,0.25)] ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/60 transition hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7cf9bd]/60"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* All documents modal — data comes from GET API.documents             */
/* ------------------------------------------------------------------ */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready" },
  { key: "processing", label: "Processing" },
  { key: "failed", label: "Failed" },
];

function AllDocumentsModal({ state, onRetry, onClose }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Search: debounced, case-insensitive, multi-word (every word must match),
  // checks both the display name and the original file name.
  const debounced = useDebounced(query, 200);
  const tokens = useMemo(
    () => debounced.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [debounced]
  );

  const searched = useMemo(() => {
    if (!tokens.length) return state.items;
    return state.items.filter((d) => {
      const hay = `${d.name} ${d.fileName}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [state.items, tokens]);

  // chip counts reflect the current search text
  const counts = useMemo(() => {
    const c = { all: searched.length, ready: 0, processing: 0, failed: 0 };
    searched.forEach((d) => (c[d.status] += 1));
    return c;
  }, [searched]);

  const results = useMemo(
    () => (filter === "all" ? searched : searched.filter((d) => d.status === filter)),
    [searched, filter]
  );

  const loadingFirst = state.status === "loading" && state.items.length === 0;
  const failedFirst = state.status === "error" && state.items.length === 0;
  const total = state.items.length;

  let emptyTitle = "No documents found";
  let emptyText = "There are no documents with this status yet.";
  if (total === 0) {
    emptyTitle = "No documents yet";
    emptyText = "Upload your first PDF and it will show up here.";
  } else if (tokens.length) {
    emptyText = `Nothing matches “${debounced.trim()}”. Try a different name.`;
  }

  return (
    <Modal onClose={onClose} labelledBy="all-docs-title" className="max-h-[82vh] max-w-[680px]">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 pb-5 pt-6">
        <div>
          <p className={eyebrow}>
            <FolderOpen className="h-3.5 w-3.5" /> Your library
          </p>
          <h2 id="all-docs-title" className={`${display} mt-3 text-[26px] font-medium text-white`}>
            All documents
          </h2>
          <p className="mt-1 text-[12px] text-white/45">
            {loadingFirst ? "Loading your library…" : `${total} ${total === 1 ? "document" : "documents"} in your personal workspace`}
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="space-y-4 px-6 pt-5">
        <label className="flex items-center gap-3 rounded-lg border border-white/[0.1] bg-white/[0.02] px-4 py-3 transition focus-within:border-[#7cf9bd]/50 focus-within:bg-white/[0.035]">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            aria-label="Search documents"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </label>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`relative rounded-full border px-3.5 py-1.5 text-[11.5px] transition-colors ${active
                  ? "border-[#7cf9bd]/40 text-[#7cf9bd]"
                  : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-[#7cf9bd]/10"
                    transition={{ type: "spring", damping: 28, stiffness: 380 }}
                  />
                )}
                <span className="relative">
                  {f.label} <span className="opacity-60">{counts[f.key]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 min-h-[200px] flex-1 overflow-y-auto px-6 pb-2">
        {loadingFirst && (
          <div className="space-y-1" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 border-b border-white/[0.07] py-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        )}

        {failedFirst && (
          <div className="flex flex-col items-center py-14 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-red-400/30 bg-red-400/[0.06]">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </span>
            <p className="mt-4 text-[13px] font-medium text-white">Couldn’t load your documents</p>
            <p className="mt-1 max-w-[280px] text-[12px] text-white/40">{state.error}</p>
            <button
              onClick={onRetry}
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-md border border-white/15 px-4 text-[12px] text-white transition hover:border-[#7cf9bd]/50 hover:text-[#7cf9bd]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        )}

        {!loadingFirst && !failedFirst && (
          <>
            <ul>
              <AnimatePresence initial mode="popLayout">
                {results.map((doc, i) => (
                  <DocRow key={doc.id} doc={doc} index={i} tokens={tokens} />
                ))}
              </AnimatePresence>
            </ul>

            <AnimatePresence>
              {results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-14 text-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.02]">
                    <Search className="h-5 w-5 text-white/40" />
                  </span>
                  <p className="mt-4 text-[13px] font-medium text-white">{emptyTitle}</p>
                  <p className="mt-1 max-w-[260px] text-[12px] text-white/40">{emptyText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-3.5 text-[11px] text-white/40">
        {state.status === "error" && state.items.length > 0 ? (
          <button onClick={onRetry} className="flex items-center gap-1.5 text-red-400 hover:underline">
            <RefreshCw className="h-3 w-3" /> Couldn’t refresh — retry
          </button>
        ) : (
          <span aria-live="polite">
            {tokens.length
              ? `${searched.length} ${searched.length === 1 ? "result" : "results"} for “${debounced.trim()}”`
              : `Showing ${results.length} of ${total}`}
          </span>
        )}
        <span className="hidden sm:inline">
          Press <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[10px]">Esc</kbd> to close
        </span>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Upload modal — closes as soon as a valid PDF is selected            */
/* ------------------------------------------------------------------ */
function UploadModal({ onClose, onSelect }) {
  const inputRef = useRef(null);
  const iconRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const tween = gsap.to(iconRef.current, {
      y: -7,
      duration: 1.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
    return () => tween.kill();
  }, []);

  // same validation rules as your documents page
  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`PDF must be smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError("");
    onSelect(file); // parent closes the modal (exit animation) and starts the upload
  };

  return (
    <Modal onClose={onClose} labelledBy="upload-title" className="max-w-[520px]">
      <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
        <div>
          <p className={eyebrow}>
            <Upload className="h-3.5 w-3.5" /> Add to your library
          </p>
          <h2 id="upload-title" className={`${display} mt-3 text-[26px] font-medium text-white`}>
            Upload documents
          </h2>
          <p className="mt-1 text-[12px] text-white/45">
            Add a PDF and DocuMind will prepare it for conversation.
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="p-6">
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          animate={{ scale: dragging ? 1.02 : 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${dragging
            ? "border-[#7cf9bd] bg-[#7cf9bd]/[0.07]"
            : "border-white/15 bg-white/[0.015] hover:border-white/30"
            }`}
        >
          <div
            ref={iconRef}
            className="grid h-16 w-16 place-items-center rounded-full border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.08]"
          >
            <UploadCloud className="h-7 w-7 text-[#7cf9bd]" strokeWidth={1.5} />
          </div>

          <p className="mt-6 text-[14px] font-medium text-white">
            {dragging ? "Drop your PDF here" : "Drag a PDF here, or choose a file"}
          </p>
          <p className="mt-1.5 text-[11.5px] text-white/40">
            Text-based PDF · up to {MAX_SIZE_MB} MB
          </p>

          <button
            type="button"
            autoFocus
            onClick={() => inputRef.current?.click()}
            className="mt-7 inline-flex h-11 items-center gap-2.5 rounded-md bg-[#7cf9bd] px-6 text-[13px] font-medium text-black transition hover:bg-[#9bffd0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7cf9bd]"
          >
            <FileUp className="h-4 w-4" />
            Upload PDF
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </motion.div>

        <div aria-live="polite">
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-start gap-2 overflow-hidden text-[12px] text-red-400"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-5 flex items-center gap-2 text-[11px] text-white/35">
          <ShieldCheck className="h-3.5 w-3.5" />
          Documents stay inside your personal workspace.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */
const TOAST_TONES = {
  success: { box: "border-[#7cf9bd]/25 bg-[#0c1511]", Icon: CheckCircle2, icon: "text-[#7cf9bd]" },
  error: { box: "border-red-400/30 bg-[#1a0f0f]", Icon: AlertCircle, icon: "text-red-400" },
  warning: { box: "border-amber-400/30 bg-[#1a150a]", Icon: AlertTriangle, icon: "text-amber-400" },
};

function Toast({ toast, onClose }) {
  const tone = TOAST_TONES[toast?.tone] || TOAST_TONES.success;
  const { Icon } = tone;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role={toast.tone === "success" ? "status" : "alert"}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className={`pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-lg border px-4 py-3 text-[12.5px] text-white shadow-2xl ${tone.box}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${tone.icon}`} />
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.onClick();
                  onClose();
                }}
                className="shrink-0 rounded-md border border-white/20 px-2.5 py-1 text-[11.5px] font-medium text-white transition hover:border-white/40 hover:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Dismiss notification"
              className="grid h-5 w-5 shrink-0 place-items-center rounded text-white/50 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const root = useRef(null);
  const timers = useRef([]);

  // --- server data -------------------------------------------------
  const [dash, setDash] = useState({
    status: "loading", // loading | ready | error
    user: null,
    stats: null,
    latest: [],
    error: "",
  });
  const [allDocs, setAllDocs] = useState({ status: "idle", items: [], error: "" });
  // uploads in flight / failed this session (shown optimistically on top of the server list)
  const [localUploads, setLocalUploads] = useState([]);

  // --- ui state ----------------------------------------------------
  const [allOpen, setAllOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  // tone: "success" | "error" | "warning"   action: { label, onClick } (optional)
  const showToast = useCallback((message, tone = "success", action = null) => {
    const id = Date.now() + Math.random();
    setToast({ id, message, tone, action });
    timers.current.push(
      setTimeout(() => setToast((t) => (t?.id === id ? null : t)), action ? 7000 : 4200)
    );
  }, []);

  /* ---- GET stats (+ latestDocuments) ------------------------------ */
  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setDash((d) => ({ ...d, status: d.stats ? d.status : "loading", error: "" }));
    try {
      const data = await api(API.stats, { cache: "no-store" });
      const s = data?.stats || {};
      setDash({
        status: "ready",
        user: data?.user ?? null,
        stats: {
          totalDocuments: Number(s.totalDocuments) || 0,
          readyDocuments: Number(s.readyDocuments) || 0,
          failedDocuments: Number(s.failedDocuments) || 0,
          pendingDocuments: Number(s.pendingDocuments) || 0,
          totalConversations: Number(s.totalConversations) || 0,
        },
        latest: (data?.latestDocuments || []).map(normalizeDoc),
        error: "",
      });
    } catch (e) {
      if (silent) return;
      setDash((d) => ({ ...d, status: d.stats ? "ready" : "error", error: e.message }));
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // while the server still reports processing documents, poll until none are left
  const serverPending = dash.stats?.pendingDocuments ?? 0;
  useEffect(() => {
    if (!serverPending) return;
    const t = setInterval(() => loadDashboard({ silent: true }), POLL_MS);
    return () => clearInterval(t);
  }, [serverPending, loadDashboard]);

  /* ---- GET all documents (fetched every time the modal opens) ----- */
  const loadAllDocs = useCallback(async () => {
    setAllDocs((s) => ({ ...s, status: s.items.length ? "ready" : "loading", error: "" }));
    try {
      const data = await api(API.documents, { cache: "no-store" });
      const items = (data?.documents || []).map(normalizeDoc).sort(byNewest);
      setAllDocs({ status: "ready", items, error: "" });
    } catch (e) {
      setAllDocs((s) => ({ ...s, status: "error", error: e.message }));
    }
  }, []);

  useEffect(() => {
    if (allOpen) loadAllDocs();
  }, [allOpen, loadAllDocs]);

  /* ---- POST upload ------------------------------------------------ */
  const handleUploadSelect = useCallback(
    async (file) => {
      setUploadOpen(false); // modal plays its exit animation

      const tempId = `local-${Date.now()}`;
      setLocalUploads((l) => [
        {
          id: tempId,
          local: true,
          name: file.name,
          fileName: file.name,
          size: file.size,
          status: "processing",
          error: "",
          createdAt: new Date().toISOString(),
        },
        ...l,
      ]);

      const formData = new FormData();
      formData.append("file", file);

      try {
        await api(API.upload, { method: "POST", body: formData });
        await loadDashboard({ silent: true }); // pull the real record + fresh stats
        setLocalUploads((l) => l.filter((x) => x.id !== tempId));
        showToast(`“${file.name}” is ready to chat`);
      } catch (e) {
        // Duplicate: not a failure — the file is already in the library.
        if (e instanceof ApiError && e.code === "DUPLICATE_DOCUMENT") {
          setLocalUploads((l) => l.filter((x) => x.id !== tempId));
          showToast(`“${file.name}” is already in your library.`, "warning", {
            label: "View library",
            onClick: () => setAllOpen(true),
          });
          return;
        }

        // Anything else: keep the row, mark it failed, explain why.
        const info = describeUploadError(e);
        setLocalUploads((l) =>
          l.map((x) => (x.id === tempId ? { ...x, status: "failed", error: info.message } : x))
        );
        showToast(info.message, info.tone);
        loadDashboard({ silent: true });
      }
    },
    [loadDashboard, showToast]
  );

  const dismissLocal = useCallback(
    (id) => setLocalUploads((l) => l.filter((x) => x.id !== id)),
    []
  );

  /* ---- derived view ----------------------------------------------- */
  const inFlight = localUploads.filter((u) => u.status === "processing").length;
  const s = dash.stats;
  const view = s && {
    total: s.totalDocuments + inFlight,
    ready: s.readyDocuments,
    failed: s.failedDocuments,
    pending: s.pendingDocuments + inFlight,
    conversations: s.totalConversations,
  };
  const recent = [...localUploads, ...dash.latest].slice(0, 4);
  const loading = dash.status === "loading" && !view;
  const hardError = dash.status === "error" && !view;

  const cards = [
    {
      label: "Total documents",
      value: view?.total,
      sub: view?.pending > 0 ? `In your library · ${view.pending} processing` : "In your library",
      Icon: Files,
    },
    { label: "Ready", value: view?.ready, sub: "Available to chat", Icon: CheckCircle2 },
    { label: "Failed", value: view?.failed, sub: "Needs attention", Icon: XCircle },
    {
      label: "Conversations",
      value: view?.conversations,
      sub: "Across your library",
      Icon: MessageSquare,
    },
  ];

  /* ---- GSAP: page entrance timeline ------------------------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set("[data-anim]", { opacity: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo("[data-anim='header']", { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo(
          "[data-anim='hero']",
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 },
          "-=0.3"
        )
        .fromTo(
          "[data-anim='stat']",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          "-=0.45"
        )
        .fromTo(
          "[data-anim='library']",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          "-=0.4"
        );
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const closeAll = useCallback(() => setAllOpen(false), []);
  const closeUpload = useCallback(() => setUploadOpen(false), []);

  return (
    <div
      ref={root}
      className="min-h-screen bg-black font-['Manrope',sans-serif] text-white antialiased selection:bg-[#7cf9bd] selection:text-black"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>

      {/* ---------------- Header ---------------- */}
      <header
        data-anim="header"
        className="sticky top-0 z-40 border-b border-white/[0.07] bg-black/80 opacity-0 backdrop-blur-md"
      >
        <div className="mx-auto flex h-[92px] w-full max-w-[1600px] items-center justify-between px-6 sm:px-10 lg:px-16">
          <Logo />
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/45 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]" />
              Personal workspace
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-11 w-11",
                  userButtonTrigger:
                    "rounded-full border border-white/10 transition hover:border-[#7cf9bd]/40",
                  userButtonPopoverCard: "border border-white/10 bg-black text-white",
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1316px] px-6 pb-10 pt-16 sm:px-10 xl:px-0">
        {/* ---------------- Overview ---------------- */}
        <section>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p data-anim="hero" className={`${eyebrow} opacity-0`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]" />
                Your overview
              </p>
              <h1
                data-anim="hero"
                className={`${display} mt-6 text-[44px] font-medium leading-none tracking-[-0.02em] text-white opacity-0 sm:text-[52px]`}
              >
                Your workspace
              </h1>
              <p data-anim="hero" className="mt-5 text-[15px] text-white/45 opacity-0">
                Your documents, processing status, and conversations at a glance.
              </p>
            </div>

            <div data-anim="hero" className="flex flex-wrap gap-3 opacity-0">
              <button
                onClick={() => setUploadOpen(true)}
                className="group inline-flex h-[52px] items-center gap-3 rounded-md border border-white/10 bg-black px-6 text-[13.5px] font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
              >
                <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Upload documents
              </button>
              <Link
                href="/chat"
                className="group inline-flex h-[52px] items-center gap-3 rounded-md bg-[#7cf9bd] px-6 text-[13.5px] font-medium text-black transition hover:bg-[#9bffd0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7cf9bd]"
              >
                <MessageSquare className="h-4 w-4" />
                Start a chat
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* error banner (only when the stats API fails) */}
          <AnimatePresence>
            {hardError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-red-400/25 bg-red-400/[0.06] px-5 py-4 text-[13px] text-white/70"
              >
                <span className="flex items-center gap-3.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <span className="font-semibold text-white">Couldn’t load your workspace.</span>{" "}
                    {dash.error}
                  </span>
                </span>
                <button
                  onClick={() => loadDashboard()}
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-white/15 px-3 text-[12px] text-white transition hover:border-[#7cf9bd]/50 hover:text-[#7cf9bd]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map(({ label, value, sub, Icon }) => (
              <div
                key={label}
                data-anim="stat"
                className="rounded-sm border border-white/[0.08] bg-[#0a0a0a] p-6 opacity-0 transition-colors hover:border-[#7cf9bd]/25"
              >
                <div className="flex items-center justify-between text-[13px] text-white/50">
                  {label}
                  <Icon className="h-[18px] w-[18px] text-[#7cf9bd]" strokeWidth={1.6} />
                </div>
                <div className={`${display} mt-5 text-[40px] font-medium leading-none text-white`}>
                  {loading ? (
                    <Skeleton className="h-10 w-16" />
                  ) : value == null ? (
                    <span className="text-white/30">—</span>
                  ) : (
                    <AnimatedNumber value={value} />
                  )}
                </div>
                <p className="mt-3 text-[12px] text-white/40">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Library ---------------- */}
        <section className="mt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p data-anim="library" className={`${eyebrow} opacity-0`}>
                <FolderOpen className="h-3.5 w-3.5" />
                Your library
              </p>
              <h2
                data-anim="library"
                className={`${display} mt-4 text-[28px] font-medium text-white opacity-0 sm:text-[32px]`}
              >
                Recently uploaded
              </h2>
              <p data-anim="library" className="mt-2 text-[12.5px] text-white/40 opacity-0">
                The latest documents added to your workspace.
              </p>
            </div>

            <div data-anim="library" className="flex items-center gap-4 opacity-0">
              {!loading && (
                <span className="text-[12px] text-white/40">
                  {recent.length} {recent.length === 1 ? "document" : "documents"}
                </span>
              )}
              <button
                onClick={() => setAllOpen(true)}
                className="group inline-flex h-10 items-center gap-2.5 rounded-md border border-white/10 bg-black px-4 text-[12.5px] font-medium text-white transition hover:border-[#7cf9bd]/40 hover:bg-[#7cf9bd]/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
              >
                <FolderOpen className="h-4 w-4 text-[#7cf9bd]" />
                All documents
                {view && (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10.5px] text-white/70">
                    {view.total}
                  </span>
                )}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div data-anim="library" className="mt-6 border-t border-white/[0.07] opacity-0">
            {loading && (
              <div aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-white/[0.07] py-[18px]">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-2.5 w-1/5" />
                    </div>
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            )}

            {!loading && recent.length > 0 && (
              <ul>
                <AnimatePresence initial={false} mode="popLayout">
                  {recent.map((doc, i) => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      index={i}
                      padded="py-[18px]"
                      onDismiss={
                        doc.local && doc.status === "failed" ? () => dismissLocal(doc.id) : undefined
                      }
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {!loading && recent.length === 0 && !hardError && (
              <div className="flex flex-col items-center border-b border-white/[0.07] py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.02]">
                  <FileText className="h-5 w-5 text-white/40" />
                </span>
                <p className="mt-4 text-[13px] font-medium text-white">No documents yet</p>
                <p className="mt-1 text-[12px] text-white/40">
                  Upload your first PDF to start a conversation with it.
                </p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-[#7cf9bd] px-4 text-[12px] font-medium text-black transition hover:bg-[#9bffd0]"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload a PDF
                </button>
              </div>
            )}

            {hardError && (
              <p className="border-b border-white/[0.07] py-8 text-center text-[12px] text-white/40">
                Your documents will appear here once the workspace loads.
              </p>
            )}
          </div>
        </section>

        {/* ---------------- Footer ---------------- */}
        <footer className="mt-12 flex items-center justify-between border-t border-white/[0.07] py-8 text-[11.5px] text-white/40">
          <span className="flex items-center gap-2.5">
            <FolderOpen className="h-4 w-4" />
            Personal document space
          </span>
          <span>DocuMind.ai</span>
        </footer>
      </main>

      {/* ---------------- Modals ---------------- */}
      <AnimatePresence>
        {allOpen && (
          <AllDocumentsModal key="all-docs" state={allDocs} onRetry={loadAllDocs} onClose={closeAll} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {uploadOpen && (
          <UploadModal key="upload" onClose={closeUpload} onSelect={handleUploadSelect} />
        )}
      </AnimatePresence>

      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}