"use client";
import { useEffect, useState } from "react";

export default function Live() {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const es = new EventSource("/api/calls/stream");
    es.onmessage = (e) => setLines((prev) => [...prev, e.data]);
    return () => es.close();
  }, []);

  const empty = lines.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className="text-[13px] font-medium tracking-[-0.01em] m-0 mb-1.5"
            style={{ color: "var(--cup-accent-d)" }}
          >
            Streaming
          </p>
          <h1
            className="font-bold leading-[1.05] tracking-[-0.04em] m-0"
            style={{ color: "var(--cup-ink)", fontSize: "clamp(28px, 3.6vw, 40px)" }}
          >
            Live
          </h1>
        </div>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium tracking-[-0.01em]"
          style={{
            color: empty ? "var(--cup-ink-3)" : "oklch(0.55 0.16 145)",
            background: "var(--cup-surface)",
            border: "1px solid var(--cup-rule)",
            boxShadow: "var(--cup-shadow-sm)",
          }}
        >
          <span
            className={"h-1.5 w-1.5 rounded-full " + (empty ? "" : "pulse-soft")}
            style={{
              background: empty
                ? "var(--cup-ink-3)"
                : "oklch(0.65 0.18 145)",
              boxShadow: empty
                ? undefined
                : "0 0 0 3px rgba(80,180,120,0.20)",
            }}
          />
          {empty ? "Idle" : "Streaming"}
        </span>
      </div>

      <div className="cup-card overflow-hidden">
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
            transcript-stream
          </div>
          <span />
        </div>

        <div className="p-5 min-h-[320px]">
          {empty ? (
            <div
              className="text-[14px] tracking-[-0.012em]"
              style={{ color: "var(--cup-ink-3)" }}
            >
              No active calls. Start a test call from an agent.
            </div>
          ) : (
            <div className="space-y-2.5">
              {lines.map((l, i) => {
                const isAgent = i % 2 === 1;
                return (
                  <div
                    key={i}
                    className="text-[14px] tracking-[-0.012em] flex gap-2"
                    style={{ color: "var(--cup-ink)" }}
                  >
                    <span
                      className="font-mono text-[10.5px] uppercase tracking-[0.12em] shrink-0 pt-0.5"
                      style={{
                        color: isAgent ? "var(--cup-accent-d)" : "var(--cup-ink-3)",
                      }}
                    >
                      {isAgent ? "Agent" : "Caller"}
                    </span>
                    <span>{l}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
