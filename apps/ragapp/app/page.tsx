"use client";
import { useRef, useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

type Citation = { sourceId: string; snippet: string };
type Msg = { role: "user" | "assistant"; content: string; citations?: Citation[] };

const SAMPLE_CHATS = [
  "Quarterly report Q2 → summary",
  "Product brief: onboarding flow",
  "Meeting notes Mon 10am",
  "Research: pricing page ideas",
  "Docs upload – handbook",
];

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Chat freely. Upload a PDF or image any time for grounded answers with citations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, uploading]);

  async function safeJson(res: Response) {
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    if (ct.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from server");
      }
    }
    throw new Error(text.slice(0, 500));
  }

  async function handleUploadFromPicker() {
    const files = fileRef.current?.files;
    await handleUpload(files);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUpload(files: FileList | null | undefined) {
    if (!files || !files.length) return;
    const names = Array.from(files).map((f) => f.name);
    setUploading(true);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: `Uploading ${names.length} file(s)…` },
    ]);

    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(typeof json === "string" ? json : JSON.stringify(json));

      const failed = (json.errors || []).map((e: any) => e.file);
      const succeeded = names.filter((n) => !failed.includes(n));

      let text = "";
      if (succeeded.length)
        text += `Added: ${succeeded.join(", ")} — ready for grounded questions.`;
      if (failed.length) text += `${text ? " • " : ""}Failed: ${failed.join(", ")}`;

      setMessages((m) => [...m, { role: "assistant", content: text || "Upload complete." }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Upload failed: ${e.message}` }]);
    } finally {
      setUploading(false);
    }
  }

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, history: messages.slice(-8) }),
      });
      const ct = res.headers.get("content-type") || "";
      const bodyText = await res.text();
      const json = ct.includes("application/json") ? JSON.parse(bodyText) : { error: bodyText };
      if (!res.ok) throw new Error(json?.error || "chat error");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: json.answer, citations: json.citations },
      ]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `AIError: ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header (Cupertino glass nav) */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--cup-nav-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid var(--cup-rule)",
        }}
      >
        <div className="cup-container flex h-12 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "oklch(0.65 0.18 145)" }}
            />
            <span
              className="text-[15px] font-semibold tracking-[-0.022em]"
              style={{ color: "var(--cup-ink)" }}
            >
              chakit<span style={{ color: "var(--cup-accent-d)" }}>.ai</span>
              <span
                className="ml-2 text-[12px] font-normal"
                style={{ color: "var(--cup-ink-2)" }}
              >
                / RAG Chat
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              grounded · cited
            </div>
            <ThemeToggle />
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,image/*,.txt,.md,.mdx"
            className="hidden"
            onChange={handleUploadFromPicker}
          />
        </div>
      </header>

      {/* Hero strip */}
      <section className="cup-container pt-10 pb-6">
        <p
          className="text-[13px] font-medium tracking-[-0.01em] mb-1.5"
          style={{ color: "var(--cup-accent-d)" }}
        >
          Now serving
        </p>
        <h1
          className="font-bold leading-[1.05] tracking-[-0.04em] m-0 mb-2 text-balance"
          style={{ color: "var(--cup-ink)", fontSize: "clamp(32px, 5vw, 52px)" }}
        >
          Ask anything.{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "var(--font-serif-cup)",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              color: "var(--cup-accent-d)",
            }}
          >
            grounded in your docs.
          </em>
        </h1>
        <p
          className="text-[16px] tracking-[-0.012em] max-w-[640px] m-0"
          style={{ color: "var(--cup-ink-2)" }}
        >
          Drop a PDF or image; chakit.ai answers with citations. Without uploads,
          you still get a normal chat.
        </p>
      </section>

      {/* Main */}
      <main className="cup-container flex-1 grid grid-cols-12 gap-5 pb-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3 overflow-hidden">
          <div className="cup-card h-full flex flex-col">
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--cup-rule)" }}
            >
              <span
                className="font-mono text-[11px] uppercase tracking-[0.16em]"
                style={{ color: "var(--cup-ink-3)" }}
              >
                Recent chats
              </span>
              <span
                className="font-mono text-[11px] tabular-nums"
                style={{ color: "var(--cup-ink-3)" }}
              >
                {SAMPLE_CHATS.length}
              </span>
            </div>
            <ul className="p-2 overflow-y-auto">
              {SAMPLE_CHATS.map((t, i) => (
                <li
                  key={i}
                  className="group relative px-3 py-2.5 text-[14px] rounded-[10px] cursor-default truncate tracking-[-0.012em] transition-colors"
                  style={{ color: "var(--cup-ink)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--cup-bg-3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat area — Mac window chrome */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9 overflow-hidden">
          <div className="cup-card h-full flex flex-col">
            {/* Title bar with traffic lights */}
            <div
              className="h-9 grid grid-cols-[auto_1fr_auto] items-center px-3.5 gap-3"
              style={{
                background: "var(--cup-bg-2)",
                borderBottom: "1px solid var(--cup-rule)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: "#FF5F57" }} />
                <span className="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <span className="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
              </div>
              <div
                className="text-center font-mono text-[11px] tracking-[0.06em]"
                style={{ color: "var(--cup-ink-3)" }}
              >
                rag-chat · session
              </div>
              <div
                className="font-mono text-[11px]"
                style={{ color: "var(--cup-ink-3)" }}
              >
                ⌘K
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] rounded-[16px] px-4 py-3 whitespace-pre-wrap leading-relaxed text-[15px] tracking-[-0.012em]"
                    style={
                      msg.role === "user"
                        ? {
                            background: "var(--cup-ink)",
                            color: "var(--cup-bg)",
                          }
                        : {
                            background: "var(--cup-surface-2)",
                            color: "var(--cup-ink)",
                            border: "1px solid var(--cup-rule)",
                          }
                    }
                  >
                    {msg.content}
                    {!!msg.citations?.length && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {msg.citations.map((c, j) => (
                          <span key={j} className="cup-badge" title={c.snippet}>
                            {c.sourceId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {uploading && (
                <div className="flex justify-start">
                  <div
                    className="inline-flex items-center gap-2 rounded-[16px] px-4 py-3 text-[14px]"
                    style={{
                      background: "var(--cup-surface-2)",
                      color: "var(--cup-ink-2)",
                      border: "1px solid var(--cup-rule)",
                    }}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "var(--cup-accent)", borderTopColor: "transparent" }}
                    />
                    Uploading…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </section>
      </main>

      {/* Composer */}
      <footer
        className="sticky bottom-0 z-10"
        style={{
          background: "var(--cup-nav-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderTop: "1px solid var(--cup-rule)",
        }}
      >
        <div className="cup-container py-3">
          <div className="mx-auto flex max-w-[920px] items-center gap-2">
            <button
              className="cup-btn"
              disabled={busy || uploading}
              onClick={() => fileRef.current?.click()}
              title="Upload files"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <input
              className="cup-input"
              placeholder="Message… (works even without uploads)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? send() : null)}
              disabled={busy || uploading}
            />
            <button
              className="cup-btn cup-btn-primary"
              onClick={send}
              disabled={busy || uploading || !input.trim()}
            >
              Send
            </button>
          </div>
          <p
            className="mx-auto mt-2 max-w-[920px] text-[12px] tracking-[-0.01em]"
            style={{ color: "var(--cup-ink-3)" }}
          >
            Upload PDFs/images to enable grounded answers with citations. Without uploads, this is a normal chat.
          </p>
        </div>
      </footer>
    </div>
  );
}
