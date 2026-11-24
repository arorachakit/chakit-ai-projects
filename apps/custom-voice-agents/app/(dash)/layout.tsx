import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import RQProvider from "@/components/RQProvider";
import FloatingCallWidget from "@/components/FloatingCallWidget";
import VinciNav from "@/components/VinciNav";

const DEFAULT_ASSISTANT_ID = process.env.NEXT_PUBLIC_DEFAULT_ASSISTANT_ID || "";

export default function DashLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <VinciNav />
      <div className="nr-gut mx-auto w-full max-w-[1400px] flex flex-col md:flex-row md:gap-10">
        <Sidebar />
        <RQProvider>
          <main className="flex-1 min-w-0 pt-6 md:pt-10 pb-32">{children}</main>
          <FloatingCallWidget assistantId={DEFAULT_ASSISTANT_ID} />
        </RQProvider>
      </div>
    </>
  );
}
