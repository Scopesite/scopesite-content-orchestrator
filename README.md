# Scopesite Content Orchestrator

Lightweight Express relay that lets our assistant create & schedule batches of posts via ContentStudio using a single `/posts/bulk` call. Built for month-at-a-time scheduling with approvals, windows, and retries.

## Quickstart

```bash
npx degit . my-orchestrator && cd my-orchestrator
npm i # or pnpm i / yarn

# Set up environment variables (see Environment Variables section below)
# 1. Create Supabase project at https://supabase.com
# 2. Run the migration SQL from supabase/migrations/001_initial_schema.sql
# 3. Get your ContentStudio API key
# 4. Configure all required env vars

npm run dev
```

## Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute the SQL
   - This creates the `posts` and `webhook_events` tables

3. **Get your credentials**:
   - **Database URL**: Settings → Database → Connection string (URI)
   - **Anon Key**: Settings → API → Project API keys → `anon` `public`
   - **Service Key**: Settings → API → Project API keys → `service_role` (secret)

4. **Set environment variables** (see table below)

## Environment Variables

Create a `.env` file or configure these on Railway:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CONTENTSTUDIO_API_KEY` | ✅ | - | Your ContentStudio API key (from ContentStudio Dashboard → Settings → API Keys) |
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string from Supabase |
| `SUPABASE_ANON_KEY` | ✅ | - | Supabase anonymous key (from Project Settings → API) |
| `SUPABASE_SERVICE_KEY` | ✅ | - | Supabase service role key (from Project Settings → API) |
| `PORT` | - | `3000` | Server port (Railway sets automatically) |
| `NODE_ENV` | - | `development` | Node environment |
| `CORS_ORIGIN` | - | `*` | Comma-separated allowed origins |
| `ACCOUNT_MAP_JSON` | - | `{}` | Channel-to-account ID mapping (see below) |

### Channel-to-Account Mapping

Use `ACCOUNT_MAP_JSON` to map generic channel names to ContentStudio account IDs per workspace:

```json
{
  "ws_123": {
    "linkedin": "acc_111",
    "instagram": ["acc_222", "acc_333"]
  }
}
```

**Without mapping:** Channels are passed as-is (identity fallback).
**With mapping:** `"linkedin"` → `"acc_111"`, `"instagram"` → `["acc_222", "acc_333"]`

To set on Railway, minify the JSON:
```bash
ACCOUNT_MAP_JSON={"ws_123":{"linkedin":"acc_111","instagram":["acc_222","acc_333"]}}
```

## Endpoints

- `GET /health` → health check
- `GET /workspaces` → list ContentStudio workspaces
- `GET /accounts?workspace=<id>` → list accounts for a workspace
- `GET /posts` → list posts with filtering (params: `workspace`, `status`, `limit`, `offset`)
- `GET /posts/:id` → get single post by UUID or orchestrator_id
- `POST /posts/bulk` → schedule posts with validation, retries, idempotency, and database tracking
- `POST /webhooks/contentstudio` → webhook receiver (logs events and updates post status)

## API Examples

### Health Check
```bash
curl https://your-app.railway.app/health
```

### List Workspaces
```bash
curl https://your-app.railway.app/workspaces
```

### List Accounts
```bash
curl "https://your-app.railway.app/accounts?workspace=ws_123"
```

### Bulk Schedule Posts
```bash
curl -X POST https://your-app.railway.app/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "ws_123",
    "timezone": "Europe/London",
    "posts": [{
      "title": "Visibility Truth Bomb #1",
      "body": "If Google sneezes, your traffic catches a cold…",
      "channels": ["linkedin", "instagram"],
      "firstComment": {"instagram": "#AI #SEO #SmallBusiness"},
      "media": [{"url": "https://cdn.example.com/day01.png", "alt": "Owner at laptop"}],
      "scheduledAt": "2025-11-01T09:30:00",
      "utm": {"source": "contentstudio", "campaign": "nov-pack"}
    }]
  }'
```

**Response:**
```json
{
  "results": [
    {
      "ok": true,
      "id": "post_xyz",
      "scheduledAt": "2025-11-01T09:30:00",
      "channels": ["linkedin", "instagram"]
    }
  ]
}
```

## Deploy on Railway

1. **Build Command**: `npm ci && npm run build`
2. **Start Command**: `node dist/server.js`
3. **Health Check Path**: `/health`
4. **Environment Variables**: Set all required env vars (see table above)

## Features

✅ **Database Persistence** – All posts tracked in Supabase with status updates  
✅ **Webhook Logging** – ContentStudio webhooks logged and matched to posts  
✅ **Zod Validation** – Strict payload validation with detailed error messages  
✅ **Exponential Backoff** – 3 retries with 0.5s, 1s, 2s delays  
✅ **Idempotency** – SHA256 hash prevents duplicate scheduling  
✅ **Skip Already Scheduled** – Automatically skips posts already scheduled/published  
✅ **Status Tracking** – Posts tracked as: pending → scheduled → published/failed  
✅ **Query API** – Filter posts by workspace, status, with pagination  
✅ **Configurable CORS** – Set allowed origins via env var  
✅ **UK Timezone Default** – `Europe/London` baked in

### Get Posts (with filtering)
```bash
# Get all posts for a workspace
curl "https://your-app.railway.app/posts?workspace=ws_123"

# Get failed posts only
curl "https://your-app.railway.app/posts?workspace=ws_123&status=failed"

# Get posts with pagination
curl "https://your-app.railway.app/posts?workspace=ws_123&limit=50&offset=0"
```

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid-here",
      "orchestrator_id": "abc123def456",
      "workspace_id": "ws_123",
      "contentstudio_post_id": "post_xyz",
      "title": "My Post",
      "body": "Post content...",
      "status": "scheduled",
      "scheduled_at": "2025-11-01T09:30:00Z",
      "requested_channels": ["linkedin"],
      "mapped_accounts": ["acc_111"],
      "created_at": "2025-10-15T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

### Get Single Post
```bash
# By UUID
curl "https://your-app.railway.app/posts/uuid-here"

# By orchestrator_id
curl "https://your-app.railway.app/posts/abc123def456"
```

## Notes

- **Idempotency**: Each post gets a unique `orchestrator_id` (SHA256 hash of title+body+scheduledAt+channels). Resubmitting the same post won't create duplicates.
- **Auto-skip**: Posts already in "scheduled" or "published" status are skipped automatically.
- **Channel Mapping**: If `ACCOUNT_MAP_JSON` is not set, channel values are passed through unchanged.
- **Webhook Processing**: ContentStudio webhooks update post status in real-time (scheduled → published/failed).
- **Status Flow**: `pending` → `scheduled` → `published` (or `failed` at any stage)
