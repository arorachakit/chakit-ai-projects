"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "chakit-theme";

function readTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

type Props = {
  variant?: "icon" | "row";
};

export default function ThemeToggle({ variant = "icon" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  }

  const isDark = mounted && theme === "dark";

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2 text-[14px] tracking-[-0.012em] transition-colors w-full"
        style={{ color: "var(--cup-ink-2)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            "var(--cup-bg-3)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span className="flex items-center gap-3">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.12em]"
          style={{ color: "var(--cup-ink-3)" }}
        >
          {isDark ? "dark" : "light"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center h-8 w-8 rounded-full transition-colors"
      style={{
        color: "var(--cup-ink-2)",
        background: "var(--cup-surface)",
        border: "1px solid var(--cup-rule)",
        boxShadow: "var(--cup-shadow-sm)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--cup-bg-3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--cup-surface)";
      }}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
