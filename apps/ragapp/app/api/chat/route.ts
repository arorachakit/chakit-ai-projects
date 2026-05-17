// apps/ragapp/app/api/chat/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { CHAT_MODEL, embedTexts, generalChat, getOpenAI } from "@/lib/openai"; // <-- use getOpenAI (not `openai`)
import { getSessionIdFromCookie, topK } from "@/lib/vector";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  query: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Optional early check; `getOpenAI()` will also throw if missing:
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing (set it in Vercel Project → Settings → Environment Variables)" },
        { status: 500 }
      );
    }

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { query, history } = parsed.data;

    const sid = getSessionIdFromCookie(req.headers.get("cookie"));
    const [qEmb] = await embedTexts([query]);
    const hits = topK(sid, qEmb, 6);

    // No context? fall back to general chat
    if (!hits.length) {
      const msgs = [
        { role: "system" as const, content: "You are a helpful, concise assistant." },
        ...(history || []),
        { role: "user" as const, content: query },
      ];
      const answer = await generalChat(msgs);
      return NextResponse.json({ answer, citations: [] });
    }

    const context = hits
      .map((c, i) => `[[Source ${i + 1} | ${c.sourceId}]]\n${c.text}`)
      .join("\n\n---\n\n");

    const system = `You are a precise, citation-first assistant.
Use ONLY the provided context if relevant; otherwise say there isn't enough info.
When you use context, include inline citations like [Source N]. Be concise.`;

    // ✅ Lazy init here (won’t run during build)
    const openai = getOpenAI();

    const cc = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Question: ${query}\n\nContext:\n${context}` },
      ],
      temperature: 0.2,
    });

    const answer = cc.choices?.[0]?.message?.content ?? "Sorry, couldn't generate an answer.";
    const citations = hits.map((c, i) => ({
      sourceId: `Source ${i + 1}`,
      snippet: c.text.slice(0, 180) + (c.text.length > 180 ? "…" : ""),
    }));

    return NextResponse.json({ answer, citations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "chat failed" }, { status: 500 });
  }
}
