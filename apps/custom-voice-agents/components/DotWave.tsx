"use client";
import { useEffect, useRef } from "react";

/* Who is talking and how loudly. Written by Vapi event handlers, read every frame (a ref, so no re-renders). */
export type WaveSource = { live: boolean; vol: number; userAt: number };

/* A voice waveform drawn as columns of dots, as on thevincilabs.com: lime while the agent talks,
   white while the caller talks, a low idle ripple otherwise. */
export default function DotWave({ src }: { src: { current: WaveSource } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0, lv = 0, t = 0, last = performance.now();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; if (!reduce) t += dt;
      const s = src.current, user = now - s.userAt < 800;
      // Vapi's volume-level is the agent's output level, usually 0–0.4; scale it up into 0–1
      const target = !s.live ? 0.04 : user ? 0.55 : Math.max(0.12, Math.min(1, s.vol * 2.5));
      const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      lv += (target - lv) * Math.min(1, dt * 6);
      const cols = Math.max(16, Math.floor(w / 11)), gap = 6, cy = h / 2;
      ctx.fillStyle = user ? "rgba(241,241,238,.85)" : "rgba(180,255,47,.92)";
      for (let c = 0; c < cols; c++) {
        const env = Math.sin((Math.PI * (c + 0.5)) / cols);
        const amp = 0.05 + lv * env * (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 7.3 + c * 0.9)) * (0.5 + 0.5 * Math.sin(t * 3.1 - c * 0.37)));
        const n = Math.max(1, Math.round((amp * h) / gap)), x = (c + 0.5) * (w / cols);
        ctx.beginPath();
        for (let k = -n; k <= n; k++) { ctx.moveTo(x + 1.6, cy + k * gap * 0.5); ctx.arc(x, cy + k * gap * 0.5, 1.6, 0, Math.PI * 2); }
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [src]);
  return <canvas className="nr-wave" ref={ref} aria-hidden="true" />;
}
