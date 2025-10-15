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

## Connect to ContentStudio

### Required Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CONTENTSTUDIO_API_KEY` | ✅ | - | Your ContentStudio API key (Dashboard → Settings → API Keys) |
| `DEFAULT_TIMEZONE` | - | `Europe/London` | Fallback timezone for scheduling |
| `ACCOUNT_MAP_JSON` | - | `{}` | Channel-to-account ID mapping (see below) |
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string from Supabase |
| `SUPABASE_SERVICE_KEY` | ✅ | - | Supabase service role key |
| `CORS_ORIGIN` | - | `*` | Comma-separated allowed origins (dev: `*`, prod: specific domains) |
| `PORT` | - | `3000` | Server port (Railway auto-sets) |

### Fetching Workspaces & Accounts

**1. Get your workspaces:**
```bash
curl https://contentgen.up.railway.app/workspaces | jq '.data[] | {id: ._id, name}'
```

**2. Get accounts for a workspace:**
```bash
# Replace WS_ID with your workspace ID from step 1
curl "https://contentgen.up.railway.app/accounts?workspace=WS_ID" | jq '.data[] | {platform, name: .account_name, id: ._id}'
```

**3. Build your ACCOUNT_MAP_JSON:**

Example mapping that routes channel slugs to ContentStudio account IDs:
```json
{
  "689bafde0d2bac56570e9e9b": {
    "linkedin": "nhMCc6G8ct",
    "twitter": "1870790545192140800",
    "instagram": "17841471037952239",
    "facebook": "10239344454777631",
    "gmb": "accounts/103369041263560888812/locations/8554869267175457746"
  }
}
```

**Identity Fallback:** Without mapping, channel slugs are passed as-is to ContentStudio.

**Set on Railway (minified):**
```bash
ACCOUNT_MAP_JSON={"689bafde0d2bac56570e9e9b":{"linkedin":"nhMCc6G8ct","twitter":"1870790545192140800"}}
```

### Security: CORS Origins

**Dev (allow all):**
```bash
CORS_ORIGIN=*
```

**Production (restrict to specific domains):**
```bash
CORS_ORIGIN=https://admin.scopesite.com,https://contentgen.up.railway.app
```

## Endpoints

- `GET /health` → health check
- `GET /workspaces` → list ContentStudio workspaces (returns `{ data: [...] }`)
- `GET /accounts?workspace=<id>` → list accounts (returns `{ data: [...] }`, 400 if workspace missing)
- `GET /posts?workspace=<id>` → list posts (returns `{ data: [...], total, limit, offset }`)
- `GET /posts/:id` → get single post by UUID or orchestrator_id
- `POST /posts/bulk` → schedule posts (supports `?dry=1` for payload preview)
- `POST /webhooks/contentstudio` → webhook receiver

## Smoke Tests

Run these to verify connectivity after deployment:

```bash
# 1. Health check
curl -s https://contentgen.up.railway.app/health

# 2. List workspaces (returns { data: [...] })
curl -s https://contentgen.up.railway.app/workspaces | jq .

# 3. List accounts (replace WS_ID with real workspace ID)
curl -s "https://contentgen.up.railway.app/accounts?workspace=WS_ID" | jq .

# 4. Dry-run schedule (no actual posting)
curl -sX POST "https://contentgen.up.railway.app/posts/bulk?dry=1" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId":"WS_ID",
    "timezone":"Europe/London",
    "posts":[
      {
        "title":"Demo",
        "body":"Dry run test",
        "channels":["linkedin"],
        "scheduledAt":"2025-11-01T09:30:00"
      }
    ]
  }' | jq .

# 5. Live schedule (15 mins from now)
curl -sX POST https://contentgen.up.railway.app/posts/bulk \
  -H "Content-Type: application/json" \
  -d "{
    \"workspaceId\":\"WS_ID\",
    \"timezone\":\"Europe/London\",
    \"posts\":[{
      \"title\":\"ScopeSite demo\",
      \"body\":\"Posted via orchestrator\",
      \"channels\":[\"linkedin\"],
      \"scheduledAt\":\"$(date -u -d '+15 minutes' +%Y-%m-%dT%H:%M:%SZ)\"
    }]
  }" | jq .
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
