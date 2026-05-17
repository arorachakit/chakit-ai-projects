import { Agent, Call } from "./types";

let agents: Agent[] = [
  {
    id: "sales-pro",
    name: "Sales Pro",
    goal: "Qualify inbound leads and book demos",
    systemPrompt: "You are a concise SDR.",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // swap to your 11L voice
    llmModel: "gpt-4o-mini",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "support-lite",
    name: "Support Lite",
    goal: "Triage support requests and create tickets",
    systemPrompt: "You are a calm support rep.",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // another 11L voice if you want
    llmModel: "gpt-4o-mini",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let calls: Call[] = [];
export const dbMem = { agents, calls };
