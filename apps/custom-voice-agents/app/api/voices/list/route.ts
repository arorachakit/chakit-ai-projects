import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Friendly names mapped to well-known ElevenLabs voices
  const voices = [
    { key: "sofia",  name: "Sofia",  voiceId: "21m00Tcm4TlvDq8ikWAM" }, // clear/dynamic
    { key: "bella",  name: "Bella",  voiceId: "EXAVITQu4vr4xnSDxMaL" }, // warm
    { key: "josh",   name: "Josh",   voiceId: "JBFqnCBsd6RMkjVDRZzb" }, // friendly
    { key: "antoni", name: "Antoni", voiceId: "MF3mGyEYCl7XYWbV9V6O" }, // confident
    { key: "elli",   name: "Elli",   voiceId: "TX3LPaxmHKxFdv7VOQHJ" }, // calm
  ];
  return NextResponse.json(voices, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}
