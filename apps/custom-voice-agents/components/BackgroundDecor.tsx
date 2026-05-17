"use client";

/**
 * Subtle ambient backdrop. Uses warm chakit.ai accent colors at low opacity so
 * it sits behind content without competing with the Cupertino UI.
 */
export default function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.78 0.18 50 / 0.55), transparent)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-16 h-[360px] w-[360px] rounded-full blur-3xl opacity-20"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.58 0.21 40 / 0.55), transparent)",
        }}
      />
    </div>
  );
}
