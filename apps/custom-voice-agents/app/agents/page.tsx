"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Phone, RefreshCcw, Trash2, Play } from "lucide-react";
import type { Agent } from "@/lib/types";
import { getVapi } from "@/lib/vapiClient";

import CallOverlayAuto from "@/components/CallOverlayAuto";

type Voice = { key: string; name: string; voiceId: string };

async function fetchAgents(): Promise<(Agent & { assistantId?: string; displayName?: string })[]> {
  const res = await fetch("/api/agents", { cache: "no-store" });
  if (!res.ok) return [];
  try {
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}
async function fetchVoices(): Promise<Voice[]> {
  const res = await fetch("/api/voices/list", { cache: "no-store" });
  return res.ok ? res.json() : [];
}
async function createAgent(payload: any) {
  const res = await fetch("/api/agents/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create agent");
  return res.json();
}
async function runCleanup() {
  const res = await fetch("/api/agents/cleanup", { method: "POST", cache: "no-store" });
  return res.json();
}

function startWebCall(assistantId: string, assistantDisplayName?: string) {
  const vapi = getVapi();
  const nameForOverlay = assistantDisplayName || "Voice Agent";
  try {
    sessionStorage.setItem("cva_last_assistant_name", nameForOverlay);
  } catch {}
  try {
    window.dispatchEvent(
      new CustomEvent("cva-open-call-overlay", { detail: { name: nameForOverlay } })
    );
  } catch {}
  vapi.start(assistantId);

  const kickoff = () => {
    try {
      (vapi as any)?.send?.({ type: "input_text", text: "introduce_yourself" });
    } catch {}
  };
  const onStart = () => {
    kickoff();
    vapi.off?.("call-start", onStart);
  };
  vapi.on?.("call-start", onStart);
  setTimeout(kickoff, 1200);
  setTimeout(kickoff, 2500);

  vapi.on?.("message", (m: any) => {
    if (m?.type === "transcript") console.log(`${m.role}: ${m.transcript}`);
  });
  vapi.on?.("call-end", () => console.log("Call ended"));
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      data-testid="create-agent-modal"
      className="fixed inset-0 z-[9999] grid place-items-center p-4"
      style={{
        background: "rgba(6,7,10,.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        className="nr-panel w-full max-w-lg max-h-[calc(100dvh-32px)]"
        style={{ background: "#0B0C10", boxShadow: "var(--cup-shadow-lg)", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create agent"
      >
        <div className="nr-bar">
          <span className="who">
            <i className="nr-led done" aria-hidden="true" />
            New agent
          </span>
          <button type="button" onClick={onClose} className="mono hover:text-[var(--fg)] min-h-[32px]">
            Close ✕
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function Agents() {
  const qc = useQueryClient();
  const { data, isFetching } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 0,
  });
  const { data: voices } = useQuery({
    queryKey: ["voices"],
    queryFn: fetchVoices,
    staleTime: Infinity,
  });

  const [open, setOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultVoiceKey = useMemo(() => voices?.[0]?.key ?? "sofia", [voices]);

  const [form, setForm] = useState({
    name: "",
    goal: "",
    context: "",
    startingWords: "Excited to chat today.",
    endingWords: "Thanks for your time — talk soon.",
    voiceKey: "",
  });

  useEffect(() => {
    if (!voices?.length) return;
    setForm((f) => ({ ...f, voiceKey: f.voiceKey || voices[0].key }));
  }, [voices]);

  const mCreate = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
  const mCleanup = useMutation({
    mutationFn: runCleanup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  function previewVoice() {
    const key = form.voiceKey || defaultVoiceKey;
    const name = form.name?.trim() || "your agent";
    const url = `/api/voices/preview?key=${encodeURIComponent(key)}&name=${encodeURIComponent(name)}`;
    try {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch((e) => {
          console.warn("Preview failed", e);
          alert("Voice preview failed. Start a quick test call to hear the voice.");
        });
      }
    } catch (e) {
      console.warn("Preview failed", e);
      alert("Voice preview failed. Start a quick test call to hear the voice.");
    }
  }

  const agents = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-10">
      <CallOverlayAuto />
      <audio ref={audioRef} hidden />

      {/* Section head */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="mono nr-kick">
            <i aria-hidden="true" />
            Roster
          </span>
          <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
            Voice <b>agents</b>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["agents"] })}
            className="cup-btn"
            title="Refresh"
          >
            <RefreshCcw size={14} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => mCleanup.mutate()}
            className="cup-btn"
            title="Run cleanup now"
            disabled={mCleanup.isPending}
          >
            <Trash2 size={14} />
            {mCleanup.isPending ? "Cleaning…" : "Cleanup"}
          </button>
          <button onClick={() => setOpen(true)} className="cup-btn cup-btn-primary">
            <Plus size={14} /> New agent
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((a: any) => {
          const display =
            a.displayName ||
            (typeof a.name === "string" ? a.name.replace(/^CVA:\s*/, "") : "Agent");
          return (
            <div
              key={a.id}
              className="cup-card p-6 flex flex-col transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-[21px] font-normal tracking-[-0.03em]">
                  {display}
                </div>
                <span className="mono inline-flex items-center gap-2 pt-1.5" style={{ color: "var(--accent)", fontSize: 10.5 }}>
                  <i className="nr-led done" aria-hidden="true" />
                  Live
                </span>
              </div>
              <p
                className="text-[15px] m-0 mb-6 leading-relaxed flex-1"
                style={{ color: "var(--mute)" }}
              >
                {a.goal}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    a.assistantId && startWebCall(a.assistantId, display || "Voice Agent")
                  }
                  className="cup-btn"
                  disabled={!a.assistantId}
                  title={!a.assistantId ? "No assistant provisioned" : "Start web call"}
                >
                  <Phone size={14} /> Test call
                </button>
              </div>
            </div>
          );
        })}
        {agents.length === 0 && (
          <div
            className="col-span-full cup-card p-10 text-center"
            style={{ color: "var(--cup-ink-2)" }}
          >
            <p className="text-[14px] tracking-[-0.012em] m-0">
              No agents yet. Click <span style={{ color: "var(--cup-ink)" }}>New agent</span> to create one.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="nr-title" style={{ fontSize: 34, margin: "0 0 24px" }}>
          Create an <b>agent</b>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="cup-label">Agent name</label>
            <input
              className="cup-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Aurora"
            />
          </div>
          <div>
            <label className="cup-label">Goal</label>
            <input
              className="cup-input"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="What should this agent achieve?"
            />
          </div>
          <div>
            <label className="cup-label">Context</label>
            <textarea
              className="cup-input min-h-[100px]"
              value={form.context}
              onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
              placeholder="Who the agent is, audience, brand/product details, FAQs, playbook, etc."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="cup-label">Starting words</label>
              <input
                className="cup-input"
                value={form.startingWords}
                onChange={(e) => setForm((f) => ({ ...f, startingWords: e.target.value }))}
              />
            </div>
            <div>
              <label className="cup-label">Ending words</label>
              <input
                className="cup-input"
                value={form.endingWords}
                onChange={(e) => setForm((f) => ({ ...f, endingWords: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="cup-label">Voice</label>
            <div className="flex gap-2">
              <select
                className="cup-input flex-1"
                value={form.voiceKey}
                onChange={(e) => setForm((f) => ({ ...f, voiceKey: e.target.value }))}
              >
                {(voices || []).map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={previewVoice}
                className="cup-btn"
                title="Preview selected voice"
              >
                <Play size={14} />
                Preview
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setOpen(false)} className="cup-btn">
            Cancel
          </button>
          <button
            onClick={() => {
              (window as any).gtag?.("event", "create_agent");
              mCreate.mutate(form);
            }}
            className="cup-btn cup-btn-accent"
            disabled={mCreate.isPending}
          >
            {mCreate.isPending ? "Creating…" : "Create agent"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
