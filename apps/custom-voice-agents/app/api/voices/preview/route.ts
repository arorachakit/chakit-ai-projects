import { NextRequest } from "next/server";
export const runtime = "nodejs";

const VOICE_MAP: Record<string,string> = {
  sofia:  "21m00Tcm4TlvDq8ikWAM",
  bella:  "EXAVITQu4vr4xnSDxMaL",
  josh:   "JBFqnCBsd6RMkjVDRZzb",
  antoni: "MF3mGyEYCl7XYWbV9V6O",
  elli:   "TX3LPaxmHKxFdv7VOQHJ",
};

export async function GET(req: NextRequest) {
  const key = (req.nextUrl.searchParams.get("key") || "sofia").toLowerCase();
  const name = (req.nextUrl.searchParams.get("name") || "your agent").slice(0,60);
  const voiceId = VOICE_MAP[key] || VOICE_MAP["sofia"];

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new Response("Missing ELEVENLABS_API_KEY", { status: 500 });

  const text = `Hi, I'm ${name}. This is a short sample of my voice.`;

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.4, similarity_boost: 0.5 }
      })
    });

    if (!r.ok || !r.body) {
      const msg = await r.text().catch(()=>"");
      return new Response(`TTS failed: ${r.status} ${msg}`, { status: 500 });
    }

    return new Response(r.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (e: any) {
    // Typical local error you saw: getaddrinfo ENOTFOUND api.elevenlabs.io
    return new Response(`TTS network error: ${String(e)}`, { status: 500 });
  }
}
