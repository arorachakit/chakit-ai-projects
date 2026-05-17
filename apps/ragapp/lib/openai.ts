// apps/ragapp/lib/openai.ts
import "server-only";
import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fail at request time (server), not at build time
    throw new Error("OPENAI_API_KEY is missing");
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

export const CHAT_MODEL =
  process.env.OPENAI_MODEL ?? "gpt-4o-mini";
export const EMB_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export async function embedTexts(texts: string[]) {
  const openai = getOpenAI();
  const res = await openai.embeddings.create({
    model: EMB_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

type Msg = { role: "user" | "assistant" | "system"; content: string };

export async function generalChat(messages: Msg[]) {
  const openai = getOpenAI();
  const cc = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.2,
  });
  return cc.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}

export async function visionExtractText(imageBase64: string, mime: string) {
  const openai = getOpenAI();
  const cc = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract key text and a concise summary for RAG indexing." },
          { type: "image_url", image_url: { url: `data:${mime};base64,${imageBase64}` } },
        ],
      },
    ],
    temperature: 0.2,
  });
  return cc.choices?.[0]?.message?.content ?? "";
}
