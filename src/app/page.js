// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gray-950 text-white">
//       <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
//         <div className="mb-6 rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-400">
//           Personal Document Intelligence
//         </div>

//         <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
//           Chat with your documents using AI
//         </h1>

//         <p className="mt-6 max-w-2xl text-lg text-gray-400">
//           Upload your documents, ask questions, and get answers grounded in
//           your own content.
//         </p>

//         <Link
//           href="/dashboard"
//           className="mt-8 rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200"
//         >
//           Go to Dashboard
//         </Link>
//       </div>
//     </main>
//   );
// }



"use client";

/**
 * DocuMind.ai — landing page
 * Next.js (App Router) · JavaScript · Tailwind CSS · Framer Motion
 *
 * Setup:
 *   npm i framer-motion lucide-react
 *   Put the hero image at  /public/document-intelligence.jpg
 *   Save this file as      app/page.jsx
 *   Make sure globals.css has the Tailwind directives and a black body background.
 */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  GraduationCap,
  Layers,
  Lock,
  Menu,
  MessageSquare,
  Minus,
  Plus,
  Scale,
  ScanText,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Design tokens (kept as constants so the whole page stays on-brand)  */
/* ------------------------------------------------------------------ */
const MINT = "#7cf9bd";
const container = "mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16";
const eyebrow =
  "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7cf9bd]";
const h2 =
  "font-['Space_Grotesk',sans-serif] text-[32px] font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-[44px]";
const muted = "text-white/45";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const TECH = [
  { name: "Gemini", icon: Sparkles },
  { name: "Pinecone", icon: Layers },
  { name: "LangChain", icon: BrainCircuit },
  { name: "Cohere", text: "co" },
  { name: "PostgreSQL", icon: Database },
];

const FEATURES = [
  {
    icon: Search,
    title: "Answers, not search results.",
    text: "Ask in your own words. Retrieve the most relevant passages from your PDFs, not just matching keywords.",
  },
  {
    icon: BookOpen,
    title: "Grounded in your documents.",
    text: "Get answers with source references, so you can go straight to the passage behind every insight.",
  },
  {
    icon: MessageSquare,
    title: "A conversation that keeps up.",
    text: "Dig deeper with follow-up questions. Conversational context keeps your train of thought connected.",
  },
  {
    icon: FolderOpen,
    title: "Your library. Your control.",
    text: "Select the documents you want to explore. Keep your workspace organized with deletion and duplicate detection.",
  },
  {
    icon: Lock,
    title: "A workspace of your own.",
    text: "User-level document isolation is central to the design. Your questions stay focused on your own library.",
  },
  {
    icon: Workflow,
    title: "Clarity at every step.",
    text: "Follow document-processing states from upload to ready, with clear feedback when something needs attention.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: Upload,
    title: "Bring your knowledge.",
    text: "Upload your PDFs into your personal library. Document content is extracted, organized, and prepared for retrieval.",
  },
  {
    n: "02",
    icon: MessageSquare,
    title: "Ask what matters.",
    text: "Choose your documents and ask a question naturally. Relevant passages are retrieved and reranked for context.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Make sense of it all.",
    text: "Get a contextual answer with source references. Ask a follow-up, explore further, or trace an insight to the original.",
  },
];

const FLOW = [
  { label: "Your PDFs", icon: FileText },
  { label: "Smart retrieval", icon: Layers },
  { label: "Relevant context", icon: Search },
  { label: "Grounded answers", icon: Sparkles, active: true },
];

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Researchers & students",
    text: "Connect ideas across papers, clarify complex concepts, and keep your sources close at hand.",
    quote: "“How do these papers approach the same problem?”",
  },
  {
    icon: Scale,
    title: "Legal & compliance",
    text: "Explore lengthy policies and agreements. Find relevant clauses and review the source in context.",
    quote: "“What are the termination conditions?”",
    accent: true,
  },
  {
    icon: BrainCircuit,
    title: "Teams & professionals",
    text: "Turn reports and internal documents into accessible knowledge for better-informed decisions.",
    quote: "“What are the key risks in this report?”",
  },
];

const FAQS = [
  {
    q: "What is DocuMind.ai?",
    a: "DocuMind.ai is a personalized AI document assistant designed to help you ask questions about your PDFs. It retrieves relevant document passages before generating a contextual answer.",
  },
  {
    q: "How is this different from a regular AI chatbot?",
    a: "Instead of relying only on general training knowledge, retrieval-augmented generation (RAG) brings relevant passages from your selected documents into the conversation. Source references help you verify the answer.",
  },
  {
    q: "Can I work with more than one document?",
    a: "The planned workspace supports a personal PDF library and document selection, so you can choose which files inform a conversation. The sample above demonstrates one selected document.",
  },
  {
    q: "How are my documents kept separate?",
    a: "The application is designed around per-user document isolation, so retrieval only uses documents belonging to the signed-in user. This landing page is a preview; live accounts and storage are not connected.",
  },
  {
    q: "Can I upload my own PDFs here?",
    a: "Not yet. This page includes an interactive sample-document preview. Uploads, document processing, and real AI responses will be available when the full application is connected.",
  },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */
function Logo({ className = "", aiClass = "text-[#7cf9bd]" }) {
  return (
    <div
      className={`flex items-center gap-2 font-['Space_Grotesk',sans-serif] text-[22px] font-bold tracking-tight text-white ${className}`}
    >
      <ScanText className="h-5 w-5 text-[#7cf9bd]" strokeWidth={1.75} />
      <span>
        DocuMind<span className={aiClass}>.ai</span>
      </span>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ tag, title, text, align = "split" }) {
  if (align === "center") {
    return (
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className={`${eyebrow} justify-center`}>{tag}</p>
        <h2 className={`${h2} mt-5`}>{title}</h2>
        <p className={`mt-5 text-sm ${muted}`}>{text}</p>
      </Reveal>
    );
  }
  return (
    <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className={eyebrow}>
          <span className="h-1 w-1 rounded-full bg-[#7cf9bd]" />
          {tag}
        </p>
        <h2 className={`${h2} mt-5`}>{title}</h2>
      </div>
      <p className={`max-w-[260px] text-[13px] leading-relaxed ${muted}`}>
        {text}
      </p>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use cases", href: "#use-cases" },
  { label: "FAQs", href: "#faqs" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { isLoaded, isSignedIn } = useUser();
  return (
    // <motion.header
    //   initial={{ opacity: 0, y: -16 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    //   className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
    //     scrolled || open
    //       ? "border-b border-white/[0.06] bg-black/80 backdrop-blur-md"
    //       : "border-b border-transparent bg-transparent"
    //   }`} 
    // >
    //   <div className={`${container} flex h-[84px] items-center justify-between`}>
    //     <a href="#top" aria-label="DocuMind.ai home">
    //       <Logo
    //         aiClass="text-white/50"
    //         className="!text-[26px] [&_svg]:!h-8 [&_svg]:!w-8"
    //       />
    //     </a>

    //     <nav aria-label="Primary" className="hidden items-center gap-14 md:flex">
    //       {NAV_LINKS.map((l) => (
    //         <a
    //           key={l.label}
    //           href={l.href}
    //           className="text-[13px] text-white/55 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
    //         >
    //           {l.label}
    //         </a>
    //       ))}
    //     </nav>

    //     <div className="flex items-center gap-3">
    //       <a
    //         href="#workspace"
    //         className="group hidden h-11 items-center gap-3 rounded-md border border-white/10 bg-black px-6 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60 sm:inline-flex"
    //       >
    //         Explore the demo
    //         <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    //       </a>

    //       <button
    //         onClick={() => setOpen((o) => !o)}
    //         aria-label={open ? "Close menu" : "Open menu"}
    //         aria-expanded={open}
    //         className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-white md:hidden"
    //       >
    //         {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    //       </button>
    //     </div>
    //   </div>

    //   {/* mobile menu */}
    //   <AnimatePresence>
    //     {open && (
    //       <motion.nav
    //         aria-label="Mobile"
    //         initial={{ height: 0, opacity: 0 }}
    //         animate={{ height: "auto", opacity: 1 }}
    //         exit={{ height: 0, opacity: 0 }}
    //         transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    //         className="overflow-hidden md:hidden"
    //       >
    //         <div className={`${container} flex flex-col gap-1 pb-6`}>
    //           {NAV_LINKS.map((l) => (
    //             <a
    //               key={l.label}
    //               href={l.href}
    //               onClick={() => setOpen(false)}
    //               className="rounded-md px-2 py-3 text-[13px] text-white/70 transition hover:bg-white/[0.04] hover:text-white"
    //             >
    //               {l.label}
    //             </a>
    //           ))}
    //           <a
    //             href="#workspace"
    //             onClick={() => setOpen(false)}
    //             className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#7cf9bd] text-sm font-medium text-black"
    //           >
    //             Explore the demo
    //             <ArrowUpRight className="h-4 w-4" />
    //           </a>
    //         </div>
    //       </motion.nav>
    //     )}
    //   </AnimatePresence>
    // </motion.header>


    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open
        ? "border-b border-white/[0.06] bg-black/80 backdrop-blur-md"
        : "border-b border-transparent bg-transparent"
        }`}
    >
      <div className={`${container} flex h-[84px] items-center justify-between`}>
        <a href="#top" aria-label="DocuMind.ai home">
          <Logo
            aiClass="text-white/50"
            className="!text-[26px] [&_svg]:!h-8 [&_svg]:!w-8"
          />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-14 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] text-white/55 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Authentication actions */}
          {isLoaded && (
            isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                    userButtonTrigger:
                      "rounded-full border border-white/10 transition hover:border-[#7cf9bd]/50",
                    userButtonPopoverCard:
                      "border border-white/10 bg-black text-white",
                  },
                }}
              />
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 px-3 text-xs font-medium text-white transition hover:border-white/25 hover:bg-white/[0.05] sm:px-5 sm:text-sm"
                  >
                    Log in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#7cf9bd] px-3 text-xs font-semibold text-black transition hover:bg-[#9fffcf] sm:px-5 sm:text-sm"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-white md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className={`${container} flex flex-col gap-1 pb-6`}>
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-[13px] text-white/70 transition hover:bg-white/[0.04] hover:text-white"
                >
                  {l.label}
                </a>
              ))}

              {/* Mobile authentication */}
              {isLoaded && (
                isSignedIn ? (
                  <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-4">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-10 w-10",
                          userButtonPopoverCard:
                            "border border-white/10 bg-black text-white",
                        },
                      }}
                    />
                    <span className="text-sm text-white/70">
                      Your account
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 text-sm font-medium text-white transition hover:bg-white/[0.05]"
                      >
                        Log in
                      </button>
                    </SignInButton>

                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="inline-flex h-11 items-center justify-center rounded-md bg-[#7cf9bd] text-sm font-semibold text-black transition hover:bg-[#9fffcf]"
                      >
                        Sign up
                      </button>
                    </SignUpButton>
                  </div>
                )
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const reduce = useReducedMotion();
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  const { isLoaded, isSignedIn } = useUser();
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden border-b border-white/[0.06]">
      {/* Hero image */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      >
        <Image
          src="/document-intelligence.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_center] sm:object-right"
        />
        {/* keep left side readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent sm:via-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </motion.div>

      <div className={`${container} py-28`}>
        <motion.div
          className="max-w-[640px]"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } }}
        >
          <motion.a
            variants={item}
            href="#features"
            className="inline-flex items-center gap-2.5 rounded-full border border-[#7cf9bd]/25 bg-[#7cf9bd]/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7cf9bd] transition hover:bg-[#7cf9bd]/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#7cf9bd]" />
            Your knowledge, connected
            <ChevronRight className="h-3 w-3" />
          </motion.a>

          <motion.p variants={item} className="mt-8 text-[15px] text-white/55">
            Meet DocuMind.ai
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-4 font-['Space_Grotesk',sans-serif] text-[48px] font-medium leading-[1.04] tracking-[-0.03em] text-white sm:text-[68px] lg:text-[68px] 2xl:text-[76px]"
          >
            Your documents.
            <br />
            A deeper
            <br />
            <span className="text-[#7cf9bd]">understanding.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-[430px] text-[15px] leading-[1.9] text-white/50"
          >
            Turn your PDFs into meaningful conversations. Get clear answers,
            uncover insights, and find exactly what matters — all grounded in
            your documents.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            {isLoaded && (
              <Link
                href={isSignedIn ? "/dashboard" : "#workspace"}
                className="group inline-flex h-12 items-center gap-2.5 rounded-md bg-[#7cf9bd] px-7 text-sm font-medium text-black transition hover:bg-[#9bffd0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7cf9bd]"
              >
                {isSignedIn ? "Dashboard" : "Explore DocuMind"}

                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
            <a
              href="#how-it-works"
              className="group inline-flex h-12 items-center gap-2.5 rounded-md border border-white/10 bg-black/60 px-7 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            >
              See how it works
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-white/40"
          >
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Private by design
            </li>
            <li className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Answers with sources
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" /> Built for your PDFs
            </li>
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tech stack strip                                                    */
/* ------------------------------------------------------------------ */
function TechStrip() {
  return (
    <section className="border-b border-white/[0.06]">
      <Reveal
        className={`${container} flex flex-col items-start gap-6 py-10 lg:flex-row lg:items-center lg:justify-between`}
      >
        <p className="max-w-[140px] text-[9.5px] font-medium uppercase leading-relaxed tracking-[0.12em] text-white/35">
          Built on a purposeful AI technology stack
        </p>
        <ul className="flex flex-1 flex-wrap items-center justify-between gap-x-10 gap-y-5 lg:pl-16">
          {TECH.map(({ name, icon: Icon, text }) => (
            <li
              key={name}
              className="flex items-center gap-2 font-['Space_Grotesk',sans-serif] text-[17px] text-white/55"
            >
              {Icon ? (
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              ) : (
                <span className="text-[17px] font-medium">{text}</span>
              )}
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive workspace preview                                       */
/* ------------------------------------------------------------------ */
const CANNED = {
  default:
    "The report identifies three priorities for sustainable growth: investing in product innovation, improving operational efficiency, and strengthening customer retention. Together, these form the foundation of the proposed strategy.",
  retention:
    "To improve retention, the strategy recommends proactive onboarding, a structured feedback loop with long-term customers, and loyalty incentives tied to product usage.",
};

function Workspace() {
  const [messages, setMessages] = useState([
    { role: "user", text: "What are the key findings in this report?" },
    { role: "ai", text: CANNED.default, source: "Growth Strategy.pdf · Page 3" },
  ]);
  const [value, setValue] = useState("");
  const [thinking, setThinking] = useState(false);
  const scroller = useRef(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const send = () => {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setValue("");
    setThinking(true);
    setTimeout(() => {
      const isRetention = /retain|retention|customer/i.test(text);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: isRetention
            ? CANNED.retention
            : "This is an illustrative sample. In the full application, DocuMind retrieves matching passages from your selected PDFs and answers with source references.",
          source: isRetention ? "Growth Strategy.pdf · Page 7" : "Growth Strategy.pdf · Page 1",
        },
      ]);
      setThinking(false);
    }, 1100);
  };

  return (
    <section id="workspace" className="scroll-mt-20 border-b border-white/[0.06] py-24 sm:py-28">
      <div className={container}>
        <SectionHead
          tag="From information to insight"
          title={
            <>
              Less searching.
              <br />
              More understanding.
            </>
          }
          text="Your next insight is already in your documents. Start a conversation to bring it to the surface."
        />

        <Reveal className="mt-14" delay={0.05}>
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#080808] shadow-[0_0_80px_-30px_rgba(124,249,189,0.15)]">
            {/* window chrome */}
            <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />
                ))}
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white/40">
                DocuMind workspace
              </span>
              <Lock className="h-3 w-3 text-white/35" />
            </div>

            <div className="grid min-h-[460px] md:grid-cols-[188px_1fr]">
              {/* sidebar */}
              <aside className="hidden flex-col border-r border-white/[0.06] p-4 md:flex">
                <Logo className="!text-[17px] [&_svg]:!h-5 [&_svg]:!w-5" />
                <div className="mt-8 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.1em] text-white/35">
                  Your documents
                  <FolderOpen className="h-3 w-3" />
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-md border border-[#7cf9bd]/30 bg-[#7cf9bd]/[0.07] p-2.5">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#7cf9bd]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-white">
                      Growth Strategy.pdf
                    </p>
                    <p className="text-[8.5px] text-white/40">12 pages · Ready</p>
                  </div>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#7cf9bd]" />
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-md p-2.5 opacity-70">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <div className="min-w-0">
                    <p className="truncate text-[10px] text-white/70">Market Research.pdf</p>
                    <p className="text-[8.5px] text-white/35">24 pages · Not selected</p>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-1.5 pt-10 text-[9px] text-white/40">
                  <ShieldCheck className="h-3 w-3" /> Personal workspace
                </div>
              </aside>

              {/* chat */}
              <div className="flex min-w-0 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-white/85">
                    <MessageSquare className="h-3.5 w-3.5 text-white/50" />
                    Growth strategy insights
                  </div>
                  <span className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-[#7cf9bd]">
                    <span className="h-1 w-1 rounded-full bg-[#7cf9bd]" />
                    Sample document demo
                  </span>
                </div>

                <div
                  ref={scroller}
                  className="mt-4 flex max-h-[300px] flex-1 flex-col gap-5 overflow-y-auto pr-1"
                >
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) =>
                      m.role === "user" ? (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="ml-auto max-w-[80%] rounded-lg bg-white/[0.07] px-4 py-2.5 text-[11px] text-white/90"
                        >
                          {m.text}
                        </motion.div>
                      ) : (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/10">
                            <Sparkles className="h-3 w-3 text-[#7cf9bd]" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-white">DocuMind</p>
                            <p className="mt-1.5 max-w-[560px] text-[10.5px] leading-relaxed text-white/50">
                              {m.text}
                            </p>
                            <button className="mt-3 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[9.5px] text-[#7cf9bd] transition hover:border-[#7cf9bd]/40">
                              <FileText className="h-3 w-3" />
                              {m.source}
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    )}
                    {thinking && (
                      <motion.div
                        key="thinking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-md border border-[#7cf9bd]/25 bg-[#7cf9bd]/10">
                          <Sparkles className="h-3 w-3 text-[#7cf9bd]" />
                        </span>
                        <span className="flex gap-1">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              className="h-1 w-1 rounded-full bg-white/50"
                              animate={{ opacity: [0.2, 1, 0.2] }}
                              transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                            />
                          ))}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* input */}
                <div className="mt-5 flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 focus-within:border-[#7cf9bd]/40">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-white/35" />
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask about the sample strategy..."
                    aria-label="Ask about the sample strategy"
                    className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    onClick={send}
                    aria-label="Send question"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#2f8f62] text-black transition hover:bg-[#7cf9bd]"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-[10.5px] text-white/40">
            <Sparkles className="h-3 w-3" />
            Try asking “How can we improve customer retention?” · Illustrative sample, not live AI
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */
function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-b border-white/[0.06] py-24 sm:py-28">
      <div className={container}>
        <SectionHead
          tag="Built for the way you think"
          title={
            <>
              Everything you need.
              <br />
              Nothing in your way.
            </>
          }
          text="A thoughtful workspace that brings your documents, questions, and insights together."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-lg border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-[#7cf9bd]/25 hover:bg-white/[0.035]">
                <Icon className="h-[18px] w-[18px] text-[#7cf9bd]" strokeWidth={1.6} />
                <h3 className="mt-9 font-['Space_Grotesk',sans-serif] text-[16px] font-medium text-white">
                  {title}
                </h3>
                <p className="mt-3 text-[12.5px] leading-[1.8] text-white/45">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-white/[0.06] py-24 sm:py-28">
      <div className={container}>
        <SectionHead
          align="center"
          tag="Simple on the surface. Smart underneath."
          title={
            <>
              From PDF to perspective.
              <br />
              In three simple steps.
            </>
          }
          text="You bring the documents. DocuMind connects the dots."
        />

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, text }, i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-white/45">{n}</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <Icon className="mt-6 h-[18px] w-[18px] text-[#7cf9bd]" strokeWidth={1.6} />
              <h3 className="mt-6 font-['Space_Grotesk',sans-serif] text-[19px] font-medium text-white">
                {title}
              </h3>
              <p className="mt-3 max-w-[330px] text-[12.5px] leading-[1.8] text-white/45">
                {text}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14" delay={0.1}>
          <ol className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-lg border border-white/[0.07] bg-white/[0.015] px-6 py-5">
            {FLOW.map(({ label, icon: Icon, active }, i) => (
              <li key={label} className="flex items-center gap-5">
                <span
                  className={`flex items-center gap-2 text-[11px] ${active ? "text-[#7cf9bd]" : "text-white/50"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
                {i < FLOW.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-white/30" />
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Audiences                                                           */
/* ------------------------------------------------------------------ */
function Audiences() {
  return (
    <section id="use-cases" className="scroll-mt-20 border-b border-white/[0.06] py-24 sm:py-28">
      <div className={container}>
        <SectionHead
          tag="Your work. Your knowledge."
          title="For every curious mind."
          text="Researching, reviewing, or learning something new. Spend less time finding. More time thinking."
        />

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, text, quote, accent }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="border-t border-white/10 pt-8">
                <Icon className="h-[18px] w-[18px] text-[#7cf9bd]" strokeWidth={1.6} />
                <h3 className="mt-6 font-['Space_Grotesk',sans-serif] text-[19px] font-medium text-white">
                  {title}
                </h3>
                <p className="mt-3 max-w-[330px] text-[12.5px] leading-[1.8] text-white/45">
                  {text}
                </p>
                <p
                  className={`mt-6 border-l-2 pl-4 text-[11.5px] text-white/75 ${accent ? "border-[#7cf9bd]" : "border-white/20"
                    }`}
                >
                  {quote}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faqs" className="scroll-mt-20 border-b border-white/[0.06] py-24 sm:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-[1fr_1.4fr]`}>
        <Reveal>
          <p className={eyebrow}>
            <span className="h-1 w-1 rounded-full bg-[#7cf9bd]" />A little more clarity
          </p>
          <h2 className={`${h2} mt-5`}>
            Good questions.
            <br />
            Clear answers.
          </h2>
          <p className={`mt-6 max-w-[190px] text-[12.5px] leading-relaxed ${muted}`}>
            A few things you might be wondering before your first conversation.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="divide-y divide-white/[0.07] border-b border-white/[0.07]">
            {FAQS.map(({ q, a }, i) => {
              const isOpen = open === i;
              return (
                <li key={q}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-md px-3 py-4 text-left text-[15px] font-medium text-white transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7cf9bd]/60"
                  >
                    {q}
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5 shrink-0 text-white/60" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0 text-white/60" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[560px] px-3 pb-5 text-[12.5px] leading-[1.8] text-white/45">
                          {a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CTA + Footer                                                        */
/* ------------------------------------------------------------------ */
function CTA() {
  return (
    <section className="border-b border-white/[0.06] py-20 sm:py-24">
      <Reveal
        className={`${container} flex flex-col items-start justify-between gap-8 md:flex-row md:items-center`}
      >
        <div>
          <h2 className="font-['Space_Grotesk',sans-serif] text-[30px] font-medium tracking-[-0.02em] text-white sm:text-[40px]">
            Your next insight is waiting.
          </h2>
          <p className={`mt-3 text-[13px] ${muted}`}>
            Give your documents a voice. Start with a conversation.
          </p>
        </div>
        <a
          href="#workspace"
          className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-md bg-[#7cf9bd] px-7 text-sm font-medium text-black transition hover:bg-[#9bffd0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7cf9bd]"
        >
          Experience DocuMind
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className={`${container} pt-12`}>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div>
            <Logo />
            <p className="mt-3 text-[11px] text-white/40">Intelligence in every document.</p>
          </div>
          <nav className="flex items-center gap-10 text-[12px] text-white/45">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            <a href="#faqs" className="transition hover:text-white">FAQs</a>
            <a href="#workspace" aria-label="Open workspace" className="transition hover:text-white">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] py-6 text-[10px] text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 DocuMind.ai. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#7cf9bd]" />
            Built for knowledge. Designed for you.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Page() {
  return (
    <main
      id="top"
      className={`min-h-screen scroll-smooth bg-black font-['Manrope',sans-serif] text-white antialiased selection:bg-[#7cf9bd] selection:text-black`}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>
      <Navbar />
      <Hero />
      <TechStrip />
      <Workspace />
      <Features />
      <HowItWorks />
      <Audiences />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}