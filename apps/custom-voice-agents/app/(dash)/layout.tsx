import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import RQProvider from "@/components/RQProvider";
import FloatingCallWidget from "@/components/FloatingCallWidget";
import BackgroundDecor from "@/components/BackgroundDecor";

const DEFAULT_ASSISTANT_ID = process.env.NEXT_PUBLIC_DEFAULT_ASSISTANT_ID || "";

export default function DashLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--cup-bg)" }}>
      <BackgroundDecor />
      <Sidebar />
      <RQProvider>
        <main className="flex-1 p-8 md:p-10 max-w-[1280px] mx-auto w-full">
          {children}
        </main>
        <FloatingCallWidget assistantId={DEFAULT_ASSISTANT_ID} />
      </RQProvider>
    </div>
  );
}
