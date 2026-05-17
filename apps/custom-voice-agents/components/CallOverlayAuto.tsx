"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getVapi } from "@/lib/vapiClient";

type OpenEventDetail = { name?: string };

export default function CallOverlayAuto() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<
    "connecting" | "oncall" | "ended" | "error"
  >("connecting");
  const [seconds, setSeconds] = useState(0);
  const [assistantName, setAssistantName] = useState("Voice Agent");
  const timerRef = useRef<any>(null);
  const vapiRef = useRef<any>(null);
  const portalEl = useMemo(() => {
    if (typeof document === "undefined") return null;
    let el = document.getElementById("cva-overlay-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "cva-overlay-portal";
      document.body.appendChild(el);
    }
    return el;
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };
  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const readName = () => {
    try {
      const s = sessionStorage.getItem("cva_last_assistant_name");
      if (s) setAssistantName(s);
    } catch {}
  };

  const openOverlay = (
    name?: string,
    state: "connecting" | "oncall" = "connecting"
  ) => {
    if (name) {
      try {
        sessionStorage.setItem("cva_last_assistant_name", name);
      } catch {}
      setAssistantName(name);
    }
    setOpen(true);
    setStatus(state);
    if (state === "oncall") startTimer();
    else stopTimer();
  };
  const closeOverlay = () => {
    setStatus("ended");
    stopTimer();
    setTimeout(() => setOpen(false), 300);
  };

  const endCall = () => {
    const v = vapiRef.current || getVapi();
    try {
      (v as any)?.stop?.();
      (v as any)?.end?.();
      (v as any)?.hangUp?.();
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    const vapi = getVapi();
    vapiRef.current = vapi;

    const onStart = () => {
      readName();
      openOverlay(undefined, "oncall");
    };
    const onEnd = () => closeOverlay();
    const onErr = () => {
      setStatus("error");
      stopTimer();
      setTimeout(() => setOpen(false), 600);
    };

    vapi.on("call-start", onStart);
    vapi.on("call-end", onEnd);
    vapi.on("error", onErr);

    const opener = (e: Event) => {
      const detail = (e as CustomEvent<OpenEventDetail>).detail || {};
      if (detail.name) {
        try {
          sessionStorage.setItem("cva_last_assistant_name", detail.name);
        } catch {}
        setAssistantName(detail.name);
      } else {
        readName();
      }
      openOverlay(undefined, "connecting");
    };
    window.addEventListener("cva-open-call-overlay", opener as EventListener);

    (window as any).cvaOpenOverlay = (name?: string) =>
      openOverlay(name || "Voice Agent", "connecting");
    (window as any).cvaCloseOverlay = () => setOpen(false);

    return () => {
      vapi.off?.("call-start", onStart);
      vapi.off?.("call-end", onEnd);
      vapi.off?.("error", onErr);
      window.removeEventListener(
        "cva-open-call-overlay",
        opener as EventListener
      );
      stopTimer();
    };
  }, []);

  if (!mounted || !portalEl || !open) return null;

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const isLive = status === "oncall";
  const dotColor = isLive
    ? "oklch(0.65 0.18 145)"
    : status === "error"
    ? "oklch(0.58 0.21 40)"
    : "var(--cup-ink-3)";

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      <div
        className="absolute inset-0"
        style={{
          background: "color-mix(in oklch, var(--cup-bg) 70%, transparent)",
          backdropFilter: "blur(10px) saturate(180%)",
          WebkitBackdropFilter: "blur(10px) saturate(180%)",
        }}
      />
      <div className="relative h-full w-full grid place-items-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md rounded-[18px] pointer-events-auto overflow-hidden"
          style={{
            background: "var(--cup-surface)",
            border: "1px solid var(--cup-rule)",
            boxShadow: "var(--cup-shadow-lg)",
          }}
        >
          {/* Mac chrome title bar */}
          <div
            className="h-9 grid grid-cols-[auto_1fr_auto] items-center px-3.5 gap-3"
            style={{
              background: "var(--cup-bg-2)",
              borderBottom: "1px solid var(--cup-rule)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full cursor-pointer"
                style={{ background: "#FF5F57" }}
                onClick={endCall}
                title="End call"
              />
              <span className="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
            </div>
            <div
              className="text-center font-mono text-[11px] tracking-[0.06em]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              live-session · {mm}:{ss}
            </div>
            <span />
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <div
                className="relative h-12 w-12 rounded-full grid place-items-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--cup-accent-w), var(--cup-accent-d))",
                  boxShadow: "0 8px 24px -8px rgba(255,94,31,0.45)",
                }}
              >
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white">
                  {isLive && (
                    <span
                      className="ping-soft"
                      style={{ background: "#fff" }}
                    />
                  )}
                </span>
              </div>
              <div className="flex-1">
                <div
                  className="text-[16px] font-semibold tracking-[-0.022em]"
                  style={{ color: "var(--cup-ink)" }}
                >
                  {assistantName}
                </div>
                <div
                  className="text-[12px] flex items-center gap-1.5 mt-0.5"
                  style={{ color: "var(--cup-ink-2)" }}
                >
                  <span
                    className={"inline-block h-1.5 w-1.5 rounded-full " + (isLive ? "pulse-soft" : "")}
                    style={{ background: dotColor }}
                  />
                  {status === "oncall"
                    ? "On call"
                    : status === "connecting"
                    ? "Starting the call…"
                    : status === "ended"
                    ? "Call ended"
                    : "Call error"}
                </div>
              </div>
              <div
                className="font-mono text-[14px] tabular-nums"
                style={{ color: "var(--cup-ink-2)" }}
              >
                {mm}:{ss}
              </div>
            </div>

            <div
              className="mt-5 text-[14px] tracking-[-0.012em]"
              style={{ color: "var(--cup-ink-2)" }}
            >
              {status === "connecting" && "Setting up audio…"}
              {status === "oncall" &&
                "You’re connected. Speak normally; transcripts log in the console."}
              {status === "ended" && "Thanks for testing!"}
              {status === "error" && "We hit a snag. Try again."}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={endCall}
                className="cup-btn cup-btn-primary"
              >
                End call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalEl
  );
}
