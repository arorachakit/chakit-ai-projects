export function chunkText(text: string, chunkSize = 1200, overlap = 150) {
  const out: string[] = [];
  const clean = text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n");
  for (let i = 0; i < clean.length; i += (chunkSize - overlap)) out.push(clean.slice(i, i + chunkSize));
  return out;
}
