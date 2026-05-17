import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
export const runtime = "nodejs";

export async function POST() {
  const token = process.env.VAPI_API_KEY;
  const projectTag = process.env.VAPI_PROJECT_TAG || "custom-voice-agents";
  if (!token) return NextResponse.json({ ok:false, reason:"Missing VAPI_API_KEY" }, { status: 500 });
  const vapi = new VapiClient({ token });
  try {
    const a = await vapi.assistants.create({
      name: "CVA: Minimal Test",
      model: { provider: "openai", model: "gpt-4o-mini", messages: [{ role: "system", content: "Say hi." }] },
      voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
      metadata: { project: projectTag, ephemeral: "true", expiresAt: new Date(Date.now()+5*60*1000).toISOString() }
    });
    return NextResponse.json({ ok:true, id:a.id });
  } catch (e: any) {
    const data = e?.response?.data ?? e?.data ?? e?.message ?? String(e);
    return NextResponse.json({ ok:false, error:data }, { status: 500 });
  }
}
