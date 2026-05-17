import { NextRequest, NextResponse } from "next/server";
import { addChunks, ensureSessionCookie } from "@/lib/vector";
import { chunkText } from "@/lib/chunker";
import { isPdf, isImage } from "@/lib/mime";
import { visionExtractText } from "@/lib/openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/upload" });
}

export async function POST(req: NextRequest) {
  const headers = new Headers();
  try {
    const sid = ensureSessionCookie(headers);
    const form = await req.formData();
    const files = form.getAll("files").filter((v): v is File => v instanceof File);
    if (!files.length) return NextResponse.json({ error: "no files" }, { status: 400, headers });

    let total = 0;
    const errors: Array<{file: string; error: string}> = [];

    for (const f of files) {
      const sourceId = `${f.name}-${randomUUID().slice(0,8)}`;
      try {
        const ab = await f.arrayBuffer();
        const mime = f.type || "application/octet-stream";

        if (isPdf(mime)) {
          const text = await extractTextFromPdf(Buffer.from(ab));
          total += await addChunks(sid, sourceId, chunkText(text));
        } else if (isImage(mime)) {
          const base64 = Buffer.from(ab).toString("base64");
          const extracted = await visionExtractText(base64, mime);
          total += await addChunks(sid, sourceId, chunkText(extracted));
        } else {
          total += await addChunks(sid, sourceId, chunkText(Buffer.from(ab).toString("utf-8")));
        }
      } catch (e: any) {
        errors.push({ file: f.name, error: e?.message || "ingest failed" });
      }
    }

    const status = errors.length === files.length ? 500 : errors.length ? 207 : 200;
    return NextResponse.json({ count: files.length, chunks: total, errors }, { status, headers });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload failed (outer)" }, { status: 500, headers });
  }
}
