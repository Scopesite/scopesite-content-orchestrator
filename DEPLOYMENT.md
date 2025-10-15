# Railway Deployment Guide

## Environment Variables for Railway

Based on your provided credentials, here's what to set in Railway:

### Required Variables

```bash
# ContentStudio API
CONTENTSTUDIO_API_KEY=cs_3b3694a56c2a0051ca892cd8f6b30f00980891c267b7370608d7ddffd928a66b

# Supabase Database
DATABASE_URL=postgres://postgres:BpPmSDu9y4Zpsmmg@db.ifmlinqbztysxhmidkfa.supabase.co:6543/postgres
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbWxpbnFienR5c3hobWlka2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjAzMDQsImV4cCI6MjA3NjEzNjMwNH0.mfszYWUzVF0AkGR7tIT6l2vn8_QtIW0QTlV_JBFPre8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbWxpbnFienR5c3hobWlka2ZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU2MDMwNCwiZXhwIjoyMDc2MTM2MzA0fQ.Gn6exE8qbZ3OvMKe635eupMiFonLNd1M3t1Xr9QCy-Q

# Node Environment
NODE_ENV=production

# CORS (adjust based on your frontend domain)
CORS_ORIGIN=*
```

### Optional Variables

```bash
# Channel mapping - Configure after you get workspace/account IDs
# Example format:
# ACCOUNT_MAP_JSON={"ws_abc123":{"linkedin":"acc_linkedin_id","instagram":["acc_ig_1","acc_ig_2"]}}
```

---

## Deployment Steps

### 1. Run Supabase Migration

Before deploying, set up your database schema:

1. Go to [Supabase SQL Editor](https://app.supabase.com/project/ifmlinqbztysxhmidkfa/sql)
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste into the SQL editor
4. Click "Run" to create the tables

### 2. Deploy to Railway

Railway will auto-detect your project settings, but ensure these are configured:

**Build Settings:**
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `node dist/server.js`
- **Watch Paths**: `src/**`

**Service Settings:**
- **Health Check Path**: `/health`
- **Health Check Timeout**: 30 seconds
- **Restart Policy**: On failure

### 3. Set Environment Variables

In Railway project settings:
1. Go to your service → **Variables** tab
2. Click **+ New Variable** for each variable above
3. Paste the values (Railway auto-detects sensitive keys)
4. Save and redeploy

### 4. Get Your Deployment URL

After deployment, Railway provides a URL like:
```
https://scopesite-content-orchestrator-production.up.railway.app
```

Test it:
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{"ok": true, "service": "scopesite-content-orchestrator"}
```

---

## Setting Up Channel Mapping

To configure `ACCOUNT_MAP_JSON`:

### Step 1: Get Your Workspace IDs

```bash
curl https://your-app.railway.app/workspaces
```

Look for your workspace ID (e.g., `ws_abc123`)

### Step 2: Get Account IDs for Each Workspace

```bash
curl "https://your-app.railway.app/accounts?workspace=ws_abc123"
```

Note the account IDs for each social channel (e.g., `acc_linkedin_12345`)

### Step 3: Create Mapping JSON

```json
{
  "ws_abc123": {
    "linkedin": "acc_linkedin_12345",
    "instagram": ["acc_instagram_personal", "acc_instagram_business"],
    "facebook": "acc_facebook_page"
  }
}
```

### Step 4: Minify and Set as Env Var

In Railway, add:
```bash
ACCOUNT_MAP_JSON={"ws_abc123":{"linkedin":"acc_linkedin_12345","instagram":["acc_instagram_personal","acc_instagram_business"]}}
```

Redeploy after adding this variable.

---

## Webhook Configuration (Optional)

To receive post status updates from ContentStudio:

1. In ContentStudio dashboard, go to **Settings → Webhooks**
2. Add webhook URL: `https://your-app.railway.app/webhooks/contentstudio`
3. Select events: `post.scheduled`, `post.published`, `post.failed`
4. Save

The webhook handler will:
- Log all events to `webhook_events` table
- Match events to posts via `contentstudio_post_id`
- Update post status automatically

---

## Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

### 2. List Workspaces
```bash
curl https://your-app.railway.app/workspaces
```

### 3. Schedule a Test Post
```bash
curl -X POST https://your-app.railway.app/posts/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "ws_abc123",
    "timezone": "Europe/London",
    "posts": [{
      "title": "Test Post",
      "body": "This is a test post from the orchestrator",
      "channels": ["linkedin"],
      "scheduledAt": "2025-10-16T14:00:00",
      "tags": ["test"]
    }]
  }'
```

### 4. Check Posts in Database
```bash
curl "https://your-app.railway.app/posts?workspace=ws_abc123"
```

---

## Monitoring

### Logs
View logs in Railway dashboard:
- Service → **Logs** tab
- Filter by severity: info, warning, error

### Database
Check post status in Supabase:
- Dashboard → **Table Editor**
- View `posts` and `webhook_events` tables

### Metrics
Railway provides built-in metrics:
- CPU usage
- Memory usage
- Request count
- Response times

---

## Troubleshooting

### "Missing CONTENTSTUDIO_API_KEY"
- Verify the env var is set in Railway
- Check for typos in the variable name
- Redeploy after adding

### "Failed to create database record"
- Ensure migration SQL was run in Supabase
- Check `SUPABASE_SERVICE_KEY` is correct
- Verify RLS policies allow service role access

### "Connection failed" errors
- Check `DATABASE_URL` format
- Ensure Supabase project is active
- Verify network connectivity

### Posts showing as "pending"
- Check ContentStudio API key permissions
- Verify workspace/account IDs are correct
- Check Railway logs for API errors

---

## Security Notes

🔒 **Never commit sensitive keys to Git**
🔒 Railway automatically hides sensitive env vars
🔒 Service role key bypasses RLS - keep it secret
🔒 Use CORS_ORIGIN to restrict frontend access
🔒 Consider adding API authentication for production

---

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Run database migration
3. ✅ Set environment variables
4. ✅ Test with a sample post
5. ⏭️ Configure channel mapping
6. ⏭️ Set up ContentStudio webhooks
7. ⏭️ Integrate with your frontend/AI assistant

