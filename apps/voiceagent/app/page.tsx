"use client";
import { useEffect, useRef, useState } from "react";

const VAPI_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "YOUR_VAPI_PUBLIC_KEY";

// default agent (yours)
const ASSISTANT_ID = "2b66014d-5769-4bfa-b463-613c980143bc";

type Role = "user" | "agent" | "system";
type Chunk = { role: Role; text: string; final?: boolean; ts: number };

export default function Page() {
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Chunk[]>([]);
  const vapiRef = useRef<any>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const wantsAutoRef = useRef(true);

  const isAtBottom = (el: HTMLElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight < 40;

  const handleTranscriptScroll = () => {
    const el = listRef.current;
    if (!el) return;
    wantsAutoRef.current = isAtBottom(el);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (wantsAutoRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [transcript]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: Vapi } = await import("@vapi-ai/web");
        if (cancelled) return;

        if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY.startsWith("YOUR_")) {
          setError(
            "Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY in apps/voiceagent/.env.local"
          );
          return;
        }

        const vapi = new Vapi(VAPI_PUBLIC_KEY);

        vapi.on("call-start", () => {
          setIsCalling(true);
          setStarting(false);
        });
        vapi.on("call-end", () => {
          setIsCalling(false);
          setStarting(false);
        });
        vapi.on("message", (msg: any) => {
          if (msg?.type === "transcript" && msg?.transcript) {
            const role: Role =
              msg.role === "assistant" ? "agent" : msg.role || "system";
            const isFinal = msg.transcriptType === "final";
            setTranscript((prev) => [
              ...prev,
              {
                role,
                text: msg.transcript as string,
                final: isFinal,
                ts: Date.now(),
              },
            ]);
          }
        });

        vapiRef.current = vapi;
        setReady(true);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load Vapi SDK");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startCall = async () => {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(
        "Microphone permission denied. Please allow mic access and try again."
      );
      return;
    }
    if (!vapiRef.current) {
      setError("Call engine not ready. Reload and try again.");
      return;
    }
    try {
      setStarting(true);
      setTranscript([]);
      await vapiRef.current.start(ASSISTANT_ID);
    } catch (e: any) {
      console.error("vapi.start failed", e);
      setStarting(false);
      setError(
        e?.message || "Failed to start call. Check keys/agent id & console."
      );
    }
  };

  const stopCall = async () => {
    setError(null);
    try {
      await vapiRef.current?.stop();
    } catch (e: any) {
      console.error("vapi.stop failed", e);
      setError(e?.message || "Failed to end call");
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] relative" style={{ background: "var(--cup-bg)" }}>
      {/* Glass nav */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "var(--cup-nav-bg)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid var(--cup-rule)",
        }}
      >
        <div className="mx-auto max-w-[1080px] px-[22px] h-12 flex items-center justify-between">
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
                / Voice Agent
              </span>
            </span>
          </div>
          <div
            className="font-mono text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--cup-ink-3)" }}
          >
            {ready ? "ready" : "loading"}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[1080px] px-[22px] pt-16 pb-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          {/* Left — hero copy + CTA */}
          <div className="flex flex-col justify-center">
            <span
              className="inline-flex items-center gap-2 self-start text-[12px] font-medium tracking-[-0.01em] mb-6 px-3 py-1.5 rounded-full"
              style={{
                color: "var(--cup-accent-d)",
                background: "var(--cup-surface)",
                border: "1px solid var(--cup-rule)",
                boxShadow: "var(--cup-shadow-sm)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full pulse-soft"
                style={{
                  background: "oklch(0.65 0.18 145)",
                  boxShadow: "0 0 0 3px rgba(80,180,120,0.20)",
                }}
              />
              Live phone agent
            </span>

            <h1
              className="font-bold leading-[1.02] tracking-[-0.04em] m-0 mb-5 text-balance"
              style={{ color: "var(--cup-ink)", fontSize: "clamp(40px, 6.8vw, 76px)" }}
            >
              One agent.
              <br />
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
                unlimited
              </em>{" "}
              phone workflows.
            </h1>

            <p
              className="text-[18px] leading-[1.4] tracking-[-0.018em] max-w-[520px] m-0 mb-8"
              style={{ color: "var(--cup-ink-2)" }}
            >
              Automated calls, appointment booking, order taking, follow-ups,
              reminders, lead qualification, and FAQs — all from a single
              voice agent.
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {!isCalling ? (
                <button
                  onClick={startCall}
                  disabled={!ready || starting}
                  aria-busy={starting}
                  className="inline-flex items-center gap-2 px-[22px] py-3 rounded-full text-[15px] font-medium tracking-[-0.012em] transition-all hover:scale-[1.04] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: "var(--cup-ink)", color: "var(--cup-bg)" }}
                >
                  {starting ? (
                    <>
                      <Spinner />
                      <span>Connecting…</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden>▶︎</span>
                      <span>Start a live call</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopCall}
                  className="inline-flex items-center gap-2 px-[22px] py-3 rounded-full text-[15px] font-medium tracking-[-0.012em] transition-all hover:scale-[1.04]"
                  style={{
                    background: "var(--cup-surface)",
                    color: "var(--cup-ink)",
                    border: "1px solid var(--cup-rule-2)",
                  }}
                >
                  <span aria-hidden>■</span> End call
                </button>
              )}
              <span
                className="text-[12.5px] tracking-[-0.01em]"
                style={{ color: "var(--cup-ink-3)" }}
              >
                {starting
                  ? "Dialing the agent…"
                  : ready
                    ? "Uses your mic & speakers."
                    : "Loading call engine…"}
              </span>
            </div>

            {error && (
              <div
                className="mt-5 text-[13px] rounded-[12px] px-3.5 py-2.5"
                style={{
                  background: "color-mix(in oklch, var(--cup-accent) 12%, transparent)",
                  color: "var(--cup-accent-d)",
                  border: "1px solid color-mix(in oklch, var(--cup-accent) 28%, transparent)",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Right — Mac window: live transcript */}
          <div
            className="relative rounded-[14px] overflow-hidden"
            style={{
              background: "var(--cup-surface)",
              border: "1px solid var(--cup-rule)",
              boxShadow: "var(--cup-shadow-lg)",
            }}
          >
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
                live-transcript
              </div>
              <span className="relative inline-flex h-2 w-2 rounded-full">
                <span
                  className="ping-soft"
                  style={{
                    background: isCalling ? "oklch(0.65 0.18 145)" : "var(--cup-ink-3)",
                  }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{
                    background: isCalling ? "oklch(0.65 0.18 145)" : "var(--cup-ink-3)",
                  }}
                />
              </span>
            </div>

            <div className="p-4 md:p-5">
              <h3
                className="font-mono text-[11px] uppercase tracking-[0.16em] m-0 mb-3"
                style={{ color: "var(--cup-ink-3)" }}
              >
                Transcript
              </h3>
              <div
                className="h-[420px] overflow-y-auto pr-1 space-y-3"
                ref={listRef}
                onScroll={handleTranscriptScroll}
              >
                {transcript.length === 0 && (
                  <div
                    className="text-[14px] tracking-[-0.012em]"
                    style={{ color: "var(--cup-ink-3)" }}
                  >
                    Transcript will appear here with partial (faded) and final
                    (solid) lines.
                  </div>
                )}
                {transcript.map((c, i) => (
                  <Bubble key={c.ts + i} {...c} />
                ))}
              </div>
              <div
                className="mt-3 text-[12px] tracking-[-0.01em]"
                style={{ color: "var(--cup-ink-3)" }}
              >
                Tip: keep your mic close; interim results stream live.
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="mx-auto max-w-[1080px] px-[22px] pb-10 pt-2 text-[12px] tracking-[-0.01em]"
        style={{ color: "var(--cup-ink-3)" }}
      >
        © {new Date().getFullYear()} chakit.ai — multipurpose voice agent demo.
      </footer>
    </main>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block align-middle size-4 rounded-full border-2 animate-spin"
      style={{ borderColor: "currentColor", borderTopColor: "transparent" }}
      aria-hidden="true"
    />
  );
}

function Bubble({
  role,
  text,
  final,
}: {
  role: Role;
  text: string;
  final?: boolean;
}) {
  const isAgent = role === "agent";
  const baseClasses =
    "max-w-[88%] rounded-[14px] px-3.5 py-2.5 text-[14px] leading-relaxed tracking-[-0.012em]";
  const agentStyle: React.CSSProperties = {
    background: "var(--cup-surface-2)",
    color: "var(--cup-ink)",
    border: "1px solid var(--cup-rule)",
  };
  const userStyle: React.CSSProperties = {
    background: "var(--cup-ink)",
    color: "var(--cup-bg)",
  };
  const opacity = final ? 1 : 0.7;
  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className={baseClasses}
        style={{ ...(isAgent ? agentStyle : userStyle), opacity }}
      >
        <div
          className="font-mono text-[10px] uppercase tracking-[0.12em] mb-1"
          style={{ opacity: 0.65 }}
        >
          {isAgent ? "Agent" : role === "user" ? "You" : "System"}
        </div>
        <div>{text}</div>
      </div>
    </div>
  );
}
