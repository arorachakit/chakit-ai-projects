import "./globals.css";
import "@chakit/config/neural.css";
import React from "react";
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--nr-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--nr-mono", display: "swap" });

export const metadata: Metadata = {
  title: "RAG chat · Live demo · The Vinci Labs",
  description:
    "Chat with your documents. Upload PDFs and images for grounded answers with citations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
