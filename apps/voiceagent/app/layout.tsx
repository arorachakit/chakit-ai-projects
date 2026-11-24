import "./globals.css";
import "@chakit/config/neural.css";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--nr-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--nr-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Voice agent · Live demo · The Vinci Labs",
  description: "One agent. Unlimited phone workflows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
