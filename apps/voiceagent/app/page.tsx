"use client";
import { useEffect, useRef, useState } from "react";
import DotWave, { type WaveSource } from "../components/DotWave";
import VinciNav from "../components/VinciNav";

const VAPI_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "YOUR_VAPI_PUBLIC_KEY";

// default agent (yours)
const ASSISTANT_ID = "2b66014d-5769-4bfa-b463-613c980143bc";

type Role = "user" | "agent" | "system";
type Chunk = { role: Role; text: string; final?: boolean; ts: number };

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Page() {
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Chunk[]>([]);
  const vapiRef = useRef<any>(null);
  const wave = useRef<WaveSource>({ live: false, vol: 0, userAt: 0 });
  const [secs, setSecs] = useState(0);

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
    if (!isCalling) return;
    setSecs(0);
    const clock = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(clock);
  }, [isCalling]);

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
          wave.current.live = true;
        });
        vapi.on("call-end", () => {
          setIsCalling(false);
          setStarting(false);
          wave.current.live = false;
        });
        vapi.on("volume-level", (v: number) => {
          wave.current.vol = v;
        });
        vapi.on("message", (msg: any) => {
          if (msg?.type === "transcript" && msg?.transcript) {
            const role: Role =
              msg.role === "assistant" ? "agent" : msg.role || "system";
            const isFinal = msg.transcriptType === "final";
            if (role === "user") wave.current.userAt = performance.now();
            // Vapi resends the whole utterance on every partial, so a partial line is replaced by its next version
            setTranscript((prev) => {
              const last = prev[prev.length - 1];
              const same = last && !last.final && last.role === role;
              const chunk = { role, text: msg.transcript as string, final: isFinal, ts: same ? last.ts : Date.now() };
              return same ? [...prev.slice(0, -1), chunk] : [...prev, chunk];
            });
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
    <>
      <VinciNav />
      <main className="nr-gut mx-auto max-w-[1180px] pt-[clamp(32px,6vw,88px)] pb-[clamp(64px,9vw,120px)]">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-[clamp(40px,5vw,72px)] items-center">
          {/* Left: headline + call controls */}
          <div>
            <span className="mono nr-kick">
              <i aria-hidden="true" />
              Voice agent · live demo
            </span>
            <h1 className="nr-title" style={{ fontSize: "clamp(42px, 6.4vw, 92px)" }}>
              One agent. <b>Unlimited</b> phone workflows.
            </h1>
            <p className="nr-lede">
              Automated calls, appointment booking, order taking, follow-ups,
              reminders, lead qualification, and FAQs, all from a single
              voice agent.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              {!isCalling ? (
                <button
                  onClick={startCall}
                  disabled={!ready || starting}
                  aria-busy={starting}
                  className="cup-btn cup-btn-accent nr-lg"
                >
                  {starting ? (
                    <>
                      <Spinner />
                      <span>Connecting…</span>
                    </>
                  ) : (
                    <span>Start a live call</span>
                  )}
                </button>
              ) : (
                <button onClick={stopCall} className="cup-btn nr-lg">
                  End call
                </button>
              )}
              <span className="mono">
                {starting
                  ? "Dialing the agent…"
                  : isCalling
                    ? "You're live. Just talk."
                    : ready
                      ? "Uses your mic & speakers"
                      : "Loading call engine…"}
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-6 max-w-[520px] rounded-[14px] px-4 py-3 text-[14px]"
                style={{ border: "1px solid rgba(180,255,47,.45)", background: "rgba(180,255,47,.06)" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Right: live transcript with a dot waveform */}
          <section className="nr-panel">
            <div className="nr-bar">
              <span className="who">
                <i className={`nr-led ${isCalling ? "live" : ""}`} aria-hidden="true" />
                {isCalling ? "On the call" : starting ? "Connecting" : "Live transcript"}
              </span>
              <span className="meta mono">
                <span>{ready ? "Engine ready" : "Loading"}</span>
                <b>{mmss(secs)}</b>
              </span>
            </div>
            <DotWave src={wave} />
            <div
              className="h-[clamp(280px,42vh,400px)] overflow-y-auto px-4 sm:px-[22px] pt-2 pb-6 flex flex-col gap-3.5"
              ref={listRef}
              onScroll={handleTranscriptScroll}
              aria-live="polite"
            >
              {transcript.length === 0 && (
                <p className="nr-empty">
                  Start a call and talk to the agent. The transcript streams here:
                  partial lines faded, final lines solid.
                </p>
              )}
              {transcript.map((c, i) => (
                <Line key={`${c.ts}-${i}`} {...c} />
              ))}
            </div>
            <div className="mono px-4 sm:px-[22px] py-4" style={{ borderTop: "1px solid var(--line)" }}>
              Tip: keep your mic close; interim results stream live.
            </div>
          </section>
        </div>
      </main>

      {/* Fixed year on purpose: this page is prerendered, and a computed year breaks hydration (React #418) once the year rolls over. */}
      <footer className="nr-foot nr-gut mono">
        <span>© 2026 The Vinci Labs — Techpedition Pvt Ltd</span>
        <span>London · India</span>
      </footer>
    </>
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

function Line({ role, text, final }: Chunk) {
  const who = role === "agent" ? "Agent" : role === "user" ? "You" : "System";
  return (
    <div className={`nr-ln ${role === "agent" ? "ai" : "hu"}${final ? "" : " partial"}`}>
      <span className="w">{who}</span>
      <p>{text}</p>
    </div>
  );
}
