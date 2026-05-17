import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
export const runtime = "nodejs";

const vapi = new VapiClient({ token: process.env.VAPI_API_KEY! });
const projectTag = process.env.VAPI_PROJECT_TAG || "custom-voice-agents";
const NAME_PREFIX = "CVA:";
const VOICE_PROVIDER = "11labs";

export async function POST() {
  const defs = [
    {
      name: "Sales Pro",
      goal: "Qualify inbound leads and book demos",
      startingWords: "Hey! I’ll get us started.",
      endingWords: "I’ve booked it—talk soon!",
      context: "Prospecting B2B leads for demo booking.",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      llmModel: "gpt-4o-mini",
    },
    {
      name: "Support Lite",
      goal: "Triage support requests and create tickets",
      startingWords: "Hi there, I’ll kick us off.",
      endingWords: "Thanks—ticket created.",
      context: "Level‑1 support triage for SaaS.",
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      llmModel: "gpt-4o-mini",
    },
  ];

  const created: string[] = [];
  for (const d of defs) {
    const system = [
      "You are a helpful voice agent.",
      `Context: ${d.context}`,
      `When a session starts, greet first with: "${d.startingWords}".`,
      `When ending the session, close with: "${d.endingWords}".`,
    ].join(" ");

    const a = await vapi.assistants.create({
      name: `${NAME_PREFIX} ${d.name}`,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: system }],
      },
      voice: { provider: VOICE_PROVIDER, voiceId: d.voiceId },
      metadata: {
        project: projectTag,
        goal: d.goal,
        startingWords: d.startingWords,
        endingWords: d.endingWords,
        context: d.context,
        ephemeral: "false",
      },
    });
    created.push(a.id);
  }
  return NextResponse.json({ created });
}
