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
      className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-medium tracking-[-0.012em] transition-all hover:scale-[1.04] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: "var(--cup-ink)",
        color: "var(--cup-bg)",
        boxShadow: "var(--cup-shadow-lg)",
      }}
      title={busy ? "Call in progress" : "Start voice chat"}
      disabled={busy}
      aria-busy={busy}
    >
      <Phone size={16} className="-mt-0.5" />
      <span>{busy ? "On call…" : "Voice chat"}</span>
    </button>
  );
}
