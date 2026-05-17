import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const token = process.env.VAPI_API_KEY!;
const NAME_PREFIX = "CVA:";

const ENV_TAG = (process.env.VAPI_PROJECT_TAG || "").trim();
const ENV_KEY = (process.env.VAPI_PROJECT_KEY || "").trim();
const PROJECT_IDS = [ENV_TAG, ENV_KEY].filter(Boolean);
const vapi = new VapiClient({ token });

function belongs(a: any) {
  const meta = a?.metadata || {};
  const mp = (meta.project || "").trim();
  const mk = (meta.projectKey || "").trim();
  const name: string = a?.name || "";
  const metaMatches = (mp && PROJECT_IDS.includes(mp)) || (mk && PROJECT_IDS.includes(mk));
  const nameMatches = name.startsWith(NAME_PREFIX + " ");
  return metaMatches || nameMatches;
}

function displayNameOf(a: any) {
  const meta = a?.metadata || {};
  if (meta.displayName) return meta.displayName;
  const n: string = a?.name || "";
  return n.startsWith(NAME_PREFIX + " ") ? n.replace(/^CVA:\s*/,"") : n;
}

export async function GET() {
  try {
    const list: any = await vapi.assistants.list();
    const items: any[] = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];
    const ours = items.filter(belongs);
    const mapped = ours.map((a: any) => ({
      id: a.id,
      name: a.name,
      displayName: displayNameOf(a),
      goal: a?.metadata?.goal || "",
      systemPrompt: a?.model?.messages?.find?.((m: any) => m.role === "system")?.content || "",
      voiceId: a?.voice?.voiceId || "",
      llmModel: a?.model?.model || "gpt-4o-mini",
      createdAt: a?.createdAt || new Date().toISOString(),
      updatedAt: a?.updatedAt || new Date().toISOString(),
      assistantId: a.id,
      startingWords: a?.metadata?.startingWords,
      endingWords: a?.metadata?.endingWords,
      context: a?.metadata?.context,
      ephemeral: a?.metadata?.ephemeral === "true" || a?.metadata?.ephemeral === true,
      expiresAt: a?.metadata?.expiresAt,
    }));
    return new NextResponse(JSON.stringify(mapped), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (e: any) {
    console.error("GET /api/agents error:", e?.response?.data || e?.message || e);
    return NextResponse.json({ error: e?.message || "list_failed" }, { status: 500 });
  }
}
