export default function Calls() {
  return (
    <div className="space-y-10">
      <div>
        <span className="mono nr-kick">
          <i aria-hidden="true" />
          History
        </span>
        <h1 className="nr-title" style={{ fontSize: "clamp(40px, 5vw, 72px)" }}>
          Call <b>history</b>
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
