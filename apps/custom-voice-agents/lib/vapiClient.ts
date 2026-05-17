"use client";
import Vapi from "@vapi-ai/web";
let vapi: Vapi | null = null;
export function getVapi() {
  if (!vapi) vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
  return vapi!;
}
