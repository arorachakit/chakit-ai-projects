export type Agent = {
  id: string;
  name: string;
  goal: string;
  systemPrompt: string;
  voiceId: string;
  llmModel: string;
  createdAt: string;
  updatedAt: string;
  assistantId?: string;
  startingWords?: string;
  endingWords?: string;
  context?: string;
};
export type Call = {
  id: string;
  agentId: string;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  status: "ongoing" | "completed" | "failed";
};
export type TranscriptChunk = {
  callId: string;
  t: number;
  speaker: "agent" | "caller";
  text: string;
};
