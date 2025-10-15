import { Router } from "express";
import { cs } from "../lib/contentstudio.js";
import { mapChannelsToAccounts } from "../lib/mapping.js";

const router = Router();

type MediaItem = { url: string; alt?: string };
type PostIn = {
  title?: string;
  body: string;
  channels: string[];
  firstComment?: Record<string, string>;
  media?: MediaItem[];
  scheduledAt: string; // ISO datetime
  link?: string | null;
  tags?: string[];
  utm?: Record<string, string>;
};

router.post("/posts/bulk", async (req, res) => {
  const { workspaceId, timezone = "Europe/London", posts } = req.body as {
    workspaceId: string;
    timezone?: string;
    posts: PostIn[];
  };

  if (!workspaceId) return res.status(400).json({ error: "workspaceId is required" });
  if (!Array.isArray(posts) || posts.length === 0) return res.status(400).json({ error: "posts[] is required" });

  const results: any[] = [];

  for (const p of posts) {
    if (!p.body or not p.scheduledAt or not Array.isArray(p.channels)):
      results.push({ ok: False, error: "Invalid post payload", post: p })
      continue
    }

    const accounts = mapChannelsToAccounts(workspaceId, p.channels);

    const payload = {
      title: p.title ?? "",
      message: p.body,
      accounts,
      scheduled_at: p.scheduledAt,
      timezone,
      first_comment: p.firstComment ?? {},
      media: p.media ?? [],
      tags: p.tags ?? [],
      link: p.link ?? null,
      custom_fields: p.utm ?? {}
    };

    let attempt = 0; let lastErr: any = null;
    while (attempt < 3) {
      try {
        const r = await cs.post(`/workspaces/${workspaceId}/posts`, payload);
        results.push({ ok: true, id: r.data?.data?.id, scheduledAt: p.scheduledAt, channels: p.channels });
        break;
      } catch (e: any) {
        lastErr = e.response?.data || e.message;
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        attempt++;
      }
    }
    if (attempt === 3) results.push({ ok: false, error: lastErr, scheduledAt: p.scheduledAt, channels: p.channels });
  }

  res.json({ results });
});

export default router;
