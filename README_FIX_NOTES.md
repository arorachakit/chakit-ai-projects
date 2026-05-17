# chakit.ai projects — Monorepo

Three apps share a single chakit.ai Cupertino design system (warm orange accents, Inter Tight + Fraunces + Instrument Serif + JetBrains Mono, light/dark via `data-theme`). All app logic, API routes, and integrations are unchanged from the upstream — only the UI has been re-skinned to match the chakit.ai aesthetic.

## Apps
- **ragapp** — RAG chat: upload PDFs/images, get grounded answers with citations.
- **voiceagent** — single-assistant phone agent demo backed by Vapi.
- **custom-voice-agents** — multi-agent dashboard (create, list, test-call, live).

## Run
```bash
pnpm install
pnpm --filter ragapp dev
pnpm --filter @apps/voiceagent dev
pnpm --filter custom-voice-agents dev

# or build all:
pnpm build
```
