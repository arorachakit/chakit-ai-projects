"use client";
import { useEffect, useState } from "react";

export default function Live() {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const es = new EventSource("/api/calls/stream");
    es.onmessage = (e) => setLines((prev) => [...prev, e.data]);
    es.onerror = () => es.close(); // the server closes the stream when the transcript ends; without this EventSource reconnects and replays it
    return () => es.close();
  }, []);

  const empty = lines.length === 0;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="mono nr-kick">
            <i aria-hidden="true" />
            Monitor
          </span>
          <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
            Live <b>transcript</b>
          </h1>
        </div>
        <span className="mono inline-flex items-center gap-2.5 pb-2" style={{ color: empty ? "var(--mute)" : "var(--accent)" }}>
          <i className={`nr-led ${empty ? "" : "live"}`} aria-hidden="true" />
          {empty ? "Idle" : "Streaming"}
        </span>
      </div>

      <section className="nr-panel">
        <div className="nr-bar">
          <span className="who">
            <i className={`nr-led ${empty ? "" : "live"}`} aria-hidden="true" />
            Transcript stream
          </span>
          <span className="meta mono">
            <span>{lines.length} lines</span>
          </span>
        </div>

        <div className="p-5 sm:p-6 min-h-[320px] flex flex-col gap-3.5" aria-live="polite">
          {empty ? (
            <p className="nr-empty">No active calls. Start a test call from an agent.</p>
          ) : (
            lines.map((l, i) => {
              const isAgent = i % 2 === 0; // the stream opens with the agent's greeting
              return (
                <div key={i} className={`nr-ln ${isAgent ? "ai" : "hu"}`}>
                  <span className="w">{isAgent ? "Agent" : "Caller"}</span>
                  <p>{l}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
