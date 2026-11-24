"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getVapi } from "@/lib/vapiClient";
import DotWave, { type WaveSource } from "@/components/DotWave";

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
  const wave = useRef<WaveSource>({ live: false, vol: 0, userAt: 0 });
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
      wave.current.live = true;
    };
    const onEnd = () => {
      wave.current.live = false;
      closeOverlay();
    };
    const onVol = (v: number) => {
      wave.current.vol = v;
    };
    const onMsg = (m: any) => {
      if (m?.type === "transcript" && m.role === "user") wave.current.userAt = performance.now();
    };
    const onErr = () => {
      wave.current.live = false;
      setStatus("error");
      stopTimer();
      setTimeout(() => setOpen(false), 600);
    };

    vapi.on("call-start", onStart);
    vapi.on("call-end", onEnd);
    vapi.on("error", onErr);
    vapi.on("volume-level", onVol);
    vapi.on("message", onMsg);

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
      vapi.off?.("volume-level", onVol);
      vapi.off?.("message", onMsg);
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

  return createPortal(
    <div className="fixed inset-0 z-[99999]">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(6,7,10,.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />
      <div className="relative h-full w-full grid place-items-center p-4 pointer-events-none">
        <div
          className="nr-panel w-full max-w-md pointer-events-auto"
          style={{ background: "#0B0C10", boxShadow: "var(--cup-shadow-lg)" }}
          role="dialog"
          aria-label={`Call with ${assistantName}`}
        >
          <div className="nr-bar">
            <span className="who">
              <i className={`nr-led ${isLive ? "live" : status === "ended" ? "done" : ""}`} aria-hidden="true" />
              {status === "oncall"
                ? "On the call"
                : status === "connecting"
                ? "Starting the call…"
                : status === "ended"
                ? "Call ended"
                : "Call error"}
            </span>
            <span className="meta mono">
              <span>{assistantName} · AI</span>
              <b>
                {mm}:{ss}
              </b>
            </span>
          </div>

          <DotWave src={wave} />

          <div className="px-6 pb-6">
            <p className="text-[15px] m-0" style={{ color: "var(--mute)" }} aria-live="polite">
              {status === "connecting" && "Setting up audio…"}
              {status === "oncall" &&
                "You’re connected. Speak normally; transcripts log in the console."}
              {status === "ended" && "Thanks for testing!"}
              {status === "error" && "We hit a snag. Try again."}
            </p>

            <div className="mt-6 flex justify-end">
              <button onClick={endCall} className="cup-btn cup-btn-primary">
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
