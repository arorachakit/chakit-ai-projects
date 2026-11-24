"use client";
import { useRef, useState, useEffect } from "react";
import VinciNav from "@/components/VinciNav";

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
  const listRef = useRef<HTMLDivElement>(null);

  // scroll the chat panel, not the page
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, uploading, busy]);

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
      <VinciNav />
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".pdf,image/*,.txt,.md,.mdx"
        className="hidden"
        onChange={handleUploadFromPicker}
      />

      {/* Intro */}
      <section className="cup-container pt-[clamp(20px,4vw,56px)] pb-[clamp(24px,3vw,40px)]">
        <span className="mono nr-kick">
          <i aria-hidden="true" />
          RAG chat · live demo
        </span>
        <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5.6vw, 80px)" }}>
          Ask anything. <b>Grounded in your docs.</b>
        </h1>
        <p className="nr-lede">
          Drop in a PDF or an image and the answers come back with citations.
          Without uploads, it is a normal chat.
        </p>
      </section>

      {/* Main */}
      <main className="cup-container flex-1 grid grid-cols-12 gap-5 pb-6">
        {/* Sample chats (decorative), hidden on phones to give the chat the room */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3">
          <div className="cup-card h-full">
            <div className="nr-bar">
              <span className="mono">Recent chats</span>
              <span className="mono tabular-nums">{SAMPLE_CHATS.length}</span>
            </div>
            <ul className="p-2 m-0 list-none">
              {SAMPLE_CHATS.map((t, i) => (
                <li
                  key={i}
                  className="px-3 py-2.5 text-[14px] rounded-[12px] cursor-default truncate transition-colors hover:bg-white/[.05]"
                  style={{ color: "var(--mute)" }}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Chat */}
        <section className="col-span-12 md:col-span-8 lg:col-span-9">
          <div className="nr-panel flex flex-col">
            <div className="nr-bar">
              <span className="who">
                <i className={`nr-led ${busy || uploading ? "live" : "done"}`} aria-hidden="true" />
                {uploading ? "Indexing your files" : busy ? "Thinking" : "Session"}
              </span>
              <span className="meta mono">
                <span>Grounded · cited</span>
              </span>
            </div>

            <div
              ref={listRef}
              className="h-[clamp(340px,52vh,580px)] overflow-y-auto p-4 sm:p-6 flex flex-col gap-3.5"
              aria-live="polite"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`nr-msg ${msg.role === "user" ? "hu" : "ai"}`}>
                  <span className="w">{msg.role === "user" ? "You" : "Assistant"}</span>
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
              ))}
              {(busy || uploading) && (
                <div className="nr-msg ai">
                  <span className="w">{uploading ? "Uploading" : "Assistant"}</span>
                  <span className="nr-dots" aria-label={uploading ? "Uploading" : "Thinking"}>
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Composer */}
      <footer
        className="sticky bottom-0 z-10 pt-6"
        style={{ background: "linear-gradient(rgba(6,7,10,0), var(--bg) 40%)" }}
      >
        <div className="cup-container pb-[max(16px,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[920px] items-center gap-2">
            <button
              className="cup-btn shrink-0"
              disabled={busy || uploading}
              onClick={() => fileRef.current?.click()}
              title="Upload PDFs, images or text files"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <input
              className="cup-input"
              placeholder="Ask anything…"
              aria-label="Message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? send() : null)}
              disabled={busy || uploading}
            />
            <button
              className="cup-btn cup-btn-accent shrink-0"
              onClick={send}
              disabled={busy || uploading || !input.trim()}
            >
              Send
            </button>
          </div>
          <p className="mono mx-auto mt-3 max-w-[920px] hidden sm:block" style={{ fontSize: 10.5 }}>
            Upload PDFs or images for grounded answers with citations
          </p>
        </div>
      </footer>
    </div>
  );
}
