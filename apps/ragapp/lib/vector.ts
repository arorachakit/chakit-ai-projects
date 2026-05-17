import { embedTexts } from "./openai";
import { randomUUID } from "crypto";

export type Chunk = { id: string; sourceId: string; text: string; embedding: number[]; };
const mem: Map<string, Chunk[]> = new Map();

export function getSessionIdFromCookie(cookie: string | null): string {
  if (!cookie) return "anon";
  const m = /rag_sid=([^;]+)/.exec(cookie);
  return m?.[1] || "anon";
}

export function ensureSessionCookie(headers: Headers): string {
  const hit = /rag_sid=([^;]+)/.exec(headers.get("cookie") || "");
  if (hit?.[1]) return hit[1];
  const sid = randomUUID();
  headers.append("Set-Cookie", `rag_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
  return sid;
}

export function listChunks(sessionId: string) { return mem.get(sessionId) || []; }

export async function addChunks(sessionId: string, sourceId: string, raw: string[]) {
  const texts = raw.map(t => t.trim()).filter(Boolean);
  if (!texts.length) return 0;
  const embs = await embedTexts(texts);
  const chunks: Chunk[] = texts.map((text, i) => ({
    id: randomUUID(),
    sourceId,
    text,
    embedding: embs[i],
  }));
  mem.set(sessionId, (mem.get(sessionId) || []).concat(chunks));
  return chunks.length;
}

export function cosine(a: number[], b: number[]) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-12);
}

export function topK(sessionId: string, q: number[], k=6) {
  return listChunks(sessionId)
    .map(c => ({ c, s: cosine(q, c.embedding) }))
    .sort((x,y) => y.s - x.s)
    .slice(0, k)
    .map(x => x.c);
}
