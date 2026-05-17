import { NextRequest, NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
export const runtime = "nodejs";

const vapi = new VapiClient({ token: process.env.VAPI_API_KEY! });
const projectTag = process.env.VAPI_PROJECT_TAG || "custom-voice-agents";
const projectKey = process.env.VAPI_PROJECT_KEY || "cva-demo";
const NAME_PREFIX = "CVA:";
const DEFAULT_LLM = "gpt-4o-mini";

const VOICE_MAP: Record<string,string> = {
  sofia:  "21m00Tcm4TlvDq8ikWAM",
  bella:  "EXAVITQu4vr4xnSDxMaL",
  josh:   "JBFqnCBsd6RMkjVDRZzb",
  antoni: "MF3mGyEYCl7XYWbV9V6O",
  elli:   "TX3LPaxmHKxFdv7VOQHJ",
};

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { name, goal, context, startingWords, endingWords, voiceKey = "sofia" } = payload;

    const safeName = (name || "Custom Agent").trim().slice(0, 60);
    const voiceId = VOICE_MAP[(voiceKey as string || "sofia").toLowerCase()] || VOICE_MAP["sofia"];

    // Fixed TTL: 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // System prompt with a clear kickoff hook
    const parts = [
      `Your name is "${safeName}". Always introduce yourself as ${safeName}.`,
      context ? `Context: ${context}` : "",
      goal ? `Your primary goal: ${goal}.` : "",
      `When a session starts, greet first and mention your name in the first sentence.`,
      startingWords ? `After the greeting, add: "${startingWords}".` : "",
      endingWords ? `When ending the session, close with: "${endingWords}".` : "",
      `If you receive the input text EXACTLY "introduce_yourself", immediately greet first with your name and offer help, then continue naturally.`,
      `Keep responses concise and natural.`
    ].filter(Boolean);
    const system = parts.join(" ");

    const assistant = await vapi.assistants.create({
      name: `${NAME_PREFIX} ${safeName}`,
      model: {
        provider: "openai",
        model: DEFAULT_LLM,
        messages: [{ role: "system", content: system }],

      },
      firstMessage: `Hey this is ${safeName}. ${startingWords} How can I assist you today?`,
      endCallMessage: endingWords ? `Great speaking with you! ${endingWords}` : "Great speaking with you! Goodbye.",
      voice: { provider: "11labs", voiceId },
      metadata: {
        project: projectTag,
        projectKey: projectKey,
        displayName: safeName,
        goal: goal || "",
        context: context || "",
        startingWords: startingWords || "",
        endingWords: endingWords || "",
        ephemeral: "true",
        expiresAt,
      }
    });

    return NextResponse.json({
      id: assistant.id,
      assistantId: assistant.id,
      name: assistant.name,
      displayName: safeName,
      goal,
      systemPrompt: system,
      voiceId,
      llmModel: DEFAULT_LLM,
      createdAt: assistant.createdAt || new Date().toISOString(),
      updatedAt: assistant.updatedAt || new Date().toISOString(),
      startingWords: startingWords || "",
      endingWords: endingWords || "",
      context: context || "",
      ephemeral: true,
      expiresAt,
    });
  } catch (e: any) {
    console.error("create agent error", e?.response?.data || e?.message || e);
    return NextResponse.json({ error: e?.response?.data || e?.message || "create_failed" }, { status: 500 });
  }
}
