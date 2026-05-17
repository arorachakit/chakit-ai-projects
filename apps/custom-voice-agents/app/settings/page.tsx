export default function Settings() {
  return (
    <div className="opacity-60 select-none pointer-events-none space-y-6">
      <div>
        <p
          className="text-[13px] font-medium tracking-[-0.01em] m-0 mb-1.5"
          style={{ color: "var(--cup-accent-d)" }}
        >
          Configuration
        </p>
        <h1
          className="font-bold leading-[1.05] tracking-[-0.04em] m-0"
          style={{ color: "var(--cup-ink)", fontSize: "clamp(28px, 3.6vw, 40px)" }}
        >
          Settings
        </h1>
      </div>
      <div className="cup-card p-8">
        <p
          className="text-[14px] tracking-[-0.012em] m-0"
          style={{ color: "var(--cup-ink-2)" }}
        >
          This section is disabled in the demo. Keys are managed server-side.
        </p>
      </div>
    </div>
  );
}
