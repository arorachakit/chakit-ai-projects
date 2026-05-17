const chakitPreset = require("@chakit/config/tailwind/preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [chakitPreset],
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
