# Scopesite Content Orchestrator

Lightweight Express relay that lets our assistant create & schedule batches of posts via ContentStudio using a single `/posts/bulk` call. Built for month-at-a-time scheduling with approvals, windows, and retries.

## Quickstart

```bash
npx degit . my-orchestrator && cd my-orchestrator
pnpm i # or npm i / yarn
cp .env.example .env
# edit CONTENTSTUDIO_API_KEY, PUBLIC_URL etc.
pnpm dev
```

## Endpoints

- `GET /workspaces` → pass-through
- `GET /accounts?workspace=<id>` → pass-through + 10 min cache
- `POST /posts/bulk` → schedule many posts
- `POST /webhooks/contentstudio` → webhook receiver

### /posts/bulk payload (example)

```json
{
  "workspaceId": "ws_123",
  "timezone": "Europe/London",
  "posts": [{
    "title": "Visibility Truth Bomb #1",
    "body": "If Google sneezes, your traffic catches a cold…",
    "channels": ["linkedin","facebook","instagram"], 
    "firstComment": {"instagram": "Hashtags live here"},
    "media": [{"url":"https://cdn.example.com/day01.png","alt":"Owner at laptop"}],
    "scheduledAt": "2025-11-01T09:30:00",
    "utm": {"source":"contentstudio","campaign":"nov-pack"}
  }]
}
```

## Deploy on Railway

- **Build**: `npm ci && npm run build`
- **Start**: `node dist/server.js`
- Add env vars from `.env.example`.
- Set Health Check: `/health`

## Notes

- Map your platform channels to ContentStudio account IDs inside `src/lib/mapping.ts` (or replace with DB lookup).
- Add persistence and approvals later (Supabase + Drizzle).
