export default function Settings() {
  return (
    <div className="opacity-60 select-none pointer-events-none space-y-10">
      <div>
        <span className="mono nr-kick">
          <i aria-hidden="true" />
          Configuration
        </span>
        <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
          Agent <b>settings</b>
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
