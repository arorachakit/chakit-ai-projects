# Custom Voice Agents — chakit.ai Dashboard

Next.js App Router dashboard for creating, listing, and test-calling custom voice agents (Vapi-backed). Re-skinned with the chakit.ai Cupertino design system.

## Quick start
1. `cp .env.example .env.local` and fill VAPI/LLM/TTS keys (or use Vapi defaults).
2. `pnpm install`
3. `pnpm dev`

## What's included
- Dashboard shell (Agents, Live, Calls, Analytics, Settings-disabled)
- Agents list with defaults + Create Agent modal
- API routes: `/api/agents`, `/api/agents/create`, `/api/calls/start`, `/api/calls/stream`
- SSE mock stream for the Live page
- Recharts-based Analytics (mock data)

## Wire real Vapi later
- Replace `provisionWithVapi()` in `/app/api/agents/create/route.ts`
- Implement `/app/api/webhooks/voice` to receive provider events
- Point Vapi webhooks to `https://<your-domain>/api/webhooks/voice`
