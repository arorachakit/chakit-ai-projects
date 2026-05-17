export default function Calls() {
  return (
    <div className="space-y-6">
      <div>
        <p
          className="text-[13px] font-medium tracking-[-0.01em] m-0 mb-1.5"
          style={{ color: "var(--cup-accent-d)" }}
        >
          History
        </p>
        <h1
          className="font-bold leading-[1.05] tracking-[-0.04em] m-0"
          style={{ color: "var(--cup-ink)", fontSize: "clamp(28px, 3.6vw, 40px)" }}
        >
          Calls
        </h1>
      </div>
      <div className="cup-card p-10 text-center">
        <p
          className="text-[14px] tracking-[-0.012em] m-0"
          style={{ color: "var(--cup-ink-2)" }}
        >
          Call history will appear here once real webhooks are wired.
        </p>
      </div>
    </div>
  );
}
