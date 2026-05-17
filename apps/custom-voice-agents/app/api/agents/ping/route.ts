import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = process.env.VAPI_API_KEY;
    if (!token) return NextResponse.json({ ok: false, reason: "Missing VAPI_API_KEY" }, { status: 500 });
    const vapi = new VapiClient({ token });
    const list: any = await vapi.assistants.list();
    const items: any[] = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];
    return NextResponse.json({ ok: true, count: items.length, shape: Array.isArray(list?.items) ? "items[]" : Array.isArray(list) ? "array" : typeof list });
  } catch (e: any) {
    console.error("PING error:", e?.response?.data || e?.message || e);
    return NextResponse.json({ ok: false, error: e?.response?.data || e?.message || "ping_failed" }, { status: 500 });
  }
}
