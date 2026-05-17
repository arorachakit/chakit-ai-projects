/**
 * Shared Tailwind preset for chakit.ai apps.
 *
 * Mirrors the design tokens in chakit.ai/tailwind.config.ts so every app
 * in the monorepo speaks the same visual language. Colors and surfaces
 * are also expressed as CSS variables (--cup-*) inside each app's
 * globals.css; the Tailwind tokens here are for utility-class usage.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0807",
          900: "#120e0b",
          850: "#191310",
          800: "#221a15",
          700: "#2d231d",
          600: "#3a2e25",
        },
        cream: {
          50: "#fbf4e9",
          100: "#f5ebe0",
          200: "#ede1d2",
          300: "#dccfba",
          400: "#bba994",
          500: "#8a7864",
        },
        chrome: {
          50: "#fafaf8",
          100: "#ebe9e4",
          200: "#d2cfc7",
          300: "#aba79f",
          400: "#7a766d",
          500: "#4f4b44",
        },
        flame: {
          DEFAULT: "#ff5e1f",
          400: "#ff7b46",
          500: "#ff5e1f",
          600: "#e84b10",
          700: "#b9380a",
        },
        sun: {
          DEFAULT: "#f1c84b",
          400: "#f8d870",
          500: "#f1c84b",
          600: "#d4a925",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif-cup)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widestplus: "0.2em",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        cup: "0 1px 2px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.04)",
        "cup-md": "0 6px 20px -8px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
        "cup-lg": "0 30px 80px -20px rgba(0,0,0,0.18), 0 10px 30px -10px rgba(0,0,0,0.08)",
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 80s linear infinite",
        blink: "blink 1.05s steps(1) infinite",
        rise: "rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        rise: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};
