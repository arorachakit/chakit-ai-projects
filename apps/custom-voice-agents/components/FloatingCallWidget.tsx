"use client";
import { useState } from "react";
import { getVapi } from "@/lib/vapiClient";
import { Phone } from "lucide-react";

type Props = { assistantId?: string };

export default function FloatingCallWidget({ assistantId }: Props) {
  const [busy, setBusy] = useState(false);

  function start() {
    if (!assistantId) return alert("No assistantId set for widget.");
    const vapi = getVapi();
    const nameForOverlay = "Voice Agent";
    try {
      sessionStorage.setItem("cva_last_assistant_name", nameForOverlay);
    } catch {}
    try {
      window.dispatchEvent(
        new CustomEvent("cva-open-call-overlay", {
          detail: { name: nameForOverlay },
        })
      );
    } catch {}
    setBusy(true);
    vapi.start(assistantId);
    const kickoff = () => {
      try {
        (vapi as any)?.send?.({ type: "input_text", text: "start" });
      } catch {}
    };
    vapi.on("call-start", kickoff);
    setTimeout(kickoff, 800);
    vapi.on("call-end", () => setBusy(false));
    vapi.on("error", () => setBusy(false));
    vapi.on("message", (m: any) => {
      if (m.type === "transcript") console.log(`${m.role}: ${m.transcript}`);
    });
  }

  return (
    <button
      onClick={start}
      className="cup-btn cup-btn-accent nr-lg fixed z-40 bottom-[max(24px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] md:right-8"
      style={{ boxShadow: "0 18px 50px -18px rgba(180,255,47,.55)" }}
      title={busy ? "Call in progress" : "Start voice chat"}
      disabled={busy}
      aria-busy={busy}
    >
      <Phone size={16} aria-hidden="true" />
      <span>{busy ? "On call…" : "Voice chat"}</span>
    </button>
  );
}
