import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const vapi = new VapiClient({ token: process.env.VAPI_API_KEY! });
const ENV_TAG = (process.env.VAPI_PROJECT_TAG || "").trim();
const ENV_KEY = (process.env.VAPI_PROJECT_KEY || "").trim();
const PROJECT_IDS = [ENV_TAG, ENV_KEY].filter(Boolean);

function inProject(meta: any) {
  const mp = (meta?.project || "").trim();
  const mk = (meta?.projectKey || "").trim();
  return (mp && PROJECT_IDS.includes(mp)) || (mk && PROJECT_IDS.includes(mk));
}

export async function POST() {
  const now = Date.now();
  const skewMs = 5_000; // small grace
  const list: any = await vapi.assistants.list();
  const items: any[] = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];

  const candidates = items.filter((a: any) => {
    const meta = a?.metadata || {};
    if (!inProject(meta)) return false;
    const eph = meta.ephemeral === true || meta.ephemeral === "true";
    if (!eph) return false;
    const exp = Date.parse(meta.expiresAt || "");
    return isFinite(exp) && exp <= (now - skewMs);
  });

  const deleted: string[] = [];
  for (const a of candidates) {
    try { await vapi.assistants.delete(a.id); deleted.push(a.id); }
    catch (e) { console.warn("delete failed", a.id, e); }
  }

  return NextResponse.json(
    {
      scanned: items.length,
      candidates: candidates.map((c: any) => ({ id: c.id, name: c.name, expiresAt: c?.metadata?.expiresAt })),
      deleted
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
