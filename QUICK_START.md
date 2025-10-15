# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1️⃣ Open Admin Panel
👉 **https://contentgen.up.railway.app/admin**

The dashboard shows:
- ✅ **Health Status**: ContentStudio & Supabase connectivity
- 📊 **Metrics**: Scheduled, Published, Failed, Pending posts
- 🎯 **Quick Actions**: Health check, View accounts, Schedule demo

### 2️⃣ Test Connectivity

**Click "Accounts" button** to view connected social accounts:
- Shows up to 6 accounts with platform, name, ID, and status
- Verifies ContentStudio API is working
- Confirms workspace is properly configured

**Expected output:**
```
Platform  | Account Name      | ID                  | Status
--------------------------------------------------------------
facebook  | Dan Cartwright    | 10239344454777631   | ✓ Active
twitter   | DlgltaI           | 1870790545192...    | ✓ Active
linkedin  | ScopeSite         | nhMCc6G8ct          | ✓ Active
```

### 3️⃣ Schedule a Test Post

**Option A: Dry-Run (Recommended First)**
1. Check "Dry-Run" checkbox
2. Click "Schedule Demo"
3. Review expanded payload in popup
4. Verify channel mapping is correct

**Option B: Live Schedule**
1. Uncheck "Dry-Run" checkbox
2. Click "Schedule Demo"
3. Post schedules 15 mins in future
4. Check "Recent Posts" table for status
5. Verify in ContentStudio dashboard

## 📋 Quick Reference

### API Endpoints
```bash
# Health
curl https://contentgen.up.railway.app/health

# Workspaces
curl https://contentgen.up.railway.app/workspaces

# Accounts (replace WS_ID)
curl "https://contentgen.up.railway.app/accounts?workspace=WS_ID"

# Posts
curl "https://contentgen.up.railway.app/posts?workspace=WS_ID&limit=10"

# Dry-Run
curl -X POST "https://contentgen.up.railway.app/posts/bulk?dry=1" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"WS_ID","timezone":"Europe/London","posts":[...]}'

# Live Schedule
curl -X POST "https://contentgen.up.railway.app/posts/bulk" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"WS_ID","timezone":"Europe/London","posts":[...]}'
```

### Your Workspace ID
```
689bafde0d2bac56570e9e9b
```

### Your Account IDs
Run this to get them:
```bash
curl -s "https://contentgen.up.railway.app/accounts?workspace=689bafde0d2bac56570e9e9b" | jq '.data[] | {platform, id: ._id}'
```

Example output:
```json
{"platform": "linkedin", "id": "nhMCc6G8ct"}
{"platform": "twitter", "id": "1870790545192140800"}
{"platform": "facebook", "id": "10239344454777631"}
{"platform": "instagram", "id": "17841471037952239"}
```

## 🎯 Next: Configure Account Mapping

Set `ACCOUNT_MAP_JSON` on Railway to route channel names to account IDs:

```json
{
  "689bafde0d2bac56570e9e9b": {
    "linkedin": "nhMCc6G8ct",
    "twitter": "1870790545192140800",
    "instagram": "17841471037952239",
    "facebook": "10239344454777631"
  }
}
```

**Set in Railway (minified):**
```bash
ACCOUNT_MAP_JSON={"689bafde0d2bac56570e9e9b":{"linkedin":"nhMCc6G8ct","twitter":"1870790545192140800","instagram":"17841471037952239","facebook":"10239344454777631"}}
```

**Without mapping:** Channels pass through as-is (identity fallback)

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| No workspaces showing | Check `CONTENTSTUDIO_API_KEY` in Railway env vars |
| "Failed to load accounts" | Verify workspace ID is correct |
| Post scheduling fails | Use dry-run to inspect payload, check account IDs |
| CORS errors | Add domain to `CORS_ORIGIN` or set to `*` |
| Wrong account posts | Configure `ACCOUNT_MAP_JSON` with correct IDs |

## 📚 Learn More

- **Full docs**: See `README.md`
- **Connectivity details**: See `CONNECTIVITY.md`
- **Railway logs**: https://railway.app → scopesite-content-orchestrator → Logs
- **ContentStudio**: https://app.contentstudio.io

## ✅ Checklist

- [ ] Admin panel loads at `/admin`
- [ ] Workspace dropdown populates
- [ ] "Accounts" button shows account table
- [ ] Dry-run returns payload preview
- [ ] Live schedule creates post in ContentStudio
- [ ] Recent posts table updates
- [ ] Metrics cards show counts
- [ ] `ACCOUNT_MAP_JSON` configured (optional)

---

**Need help?** Check Railway logs or ContentStudio dashboard for error details.

