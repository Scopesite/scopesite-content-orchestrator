import { Router } from "express";
import { cs } from "../lib/contentstudio.js";
import { mapChannelsToAccounts } from "../lib/mapping.js";
import { supabase } from "../lib/supabase.js";
import { z } from "zod";
import { createHash } from "node:crypto";

const router = Router();

const MediaSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional()
});

const PostSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1),
  channels: z.array(z.string()).min(1),
  firstComment: z.record(z.string()).optional(),
  media: z.array(MediaSchema).optional(),
  scheduledAt: z.string().refine(v => !Number.isNaN(Date.parse(v)), "scheduledAt must be ISO datetime"),
  link: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  utm: z.record(z.string()).optional()
});

const BulkSchema = z.object({
  workspaceId: z.string().min(1),
  timezone: z.string().default("Europe/London"),
  posts: z.array(PostSchema).min(1)
});

function idKey(p: z.infer<typeof PostSchema>) {
  return createHash("sha256")
    .update([p.title ?? "", p.body, p.scheduledAt, (p.channels ?? []).join(",")].join("|"))
    .digest("hex")
    .slice(0, 16);
}

async function postWithRetry(workspaceId: string, payload: any) {
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await cs.post(`/workspaces/${workspaceId}/posts`, payload);
    } catch (e: any) {
      lastErr = e.response?.data || e.message;
      const delay = 500 * Math.pow(2, attempt); // 0.5s, 1s, 2s
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

// GET posts with filtering
router.get("/posts", async (req, res) => {
  const { workspace, status, limit = "100", offset = "0" } = req.query;

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("scheduled_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (workspace) {
    query = query.eq("workspace_id", workspace);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: "Failed to fetch posts", details: error });
  }

  res.json({ posts: data, total: count, limit: Number(limit), offset: Number(offset) });
});

// GET single post by ID or orchestrator_id
router.get("/posts/:id", async (req, res) => {
  const { id } = req.params;

  // Try UUID first, then orchestrator_id
  let query = supabase.from("posts").select("*");
  
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    query = query.eq("id", id);
  } else {
    query = query.eq("orchestrator_id", id);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(data);
});

router.post("/posts/bulk", async (req, res) => {
  const parse = BulkSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });

  const { workspaceId, timezone, posts } = parse.data;
  const results: any[] = [];

  for (const p of posts) {
    const accounts = mapChannelsToAccounts(workspaceId, p.channels);
    const orchestratorId = idKey(p);

    // First, insert/upsert the post record in database
    const { data: existingPost } = await supabase
      .from("posts")
      .select("id, status, contentstudio_post_id, retry_count")
      .eq("orchestrator_id", orchestratorId)
      .single();

    // If already scheduled/published, skip
    if (existingPost && ["scheduled", "published"].includes(existingPost.status)) {
      results.push({
        ok: true,
        id: existingPost.contentstudio_post_id,
        orchestratorId,
        scheduledAt: p.scheduledAt,
        channels: p.channels,
        skipped: true,
        reason: "Already scheduled"
      });
      continue;
    }

    // Create or update post record
    const postRecord = {
      orchestrator_id: orchestratorId,
      workspace_id: workspaceId,
      title: p.title ?? null,
      body: p.body,
      scheduled_at: p.scheduledAt,
      timezone,
      requested_channels: p.channels,
      mapped_accounts: accounts,
      media: p.media ?? [],
      first_comment: p.firstComment ?? {},
      tags: p.tags ?? [],
      link: p.link ?? null,
      utm: p.utm ?? {},
      status: "pending" as const
    };

    const { data: dbPost, error: dbError } = await supabase
      .from("posts")
      .upsert(postRecord, { onConflict: "orchestrator_id" })
      .select("id")
      .single();

    if (dbError || !dbPost) {
      results.push({
        ok: false,
        error: "Failed to create database record",
        details: dbError,
        scheduledAt: p.scheduledAt,
        channels: p.channels
      });
      continue;
    }

    // Build ContentStudio payload
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
      custom_fields: { ...(p.utm ?? {}), orchestrator_id: orchestratorId }
    };

    // Try to schedule via ContentStudio
    try {
      const r = await postWithRetry(workspaceId, payload);
      const csPostId = r.data?.data?.id;

      // Update database: mark as scheduled
      await supabase
        .from("posts")
        .update({
          contentstudio_post_id: csPostId,
          status: "scheduled",
          error_message: null
        })
        .eq("id", dbPost.id);

      results.push({
        ok: true,
        id: csPostId,
        orchestratorId,
        scheduledAt: p.scheduledAt,
        channels: p.channels
      });
    } catch (e: any) {
      const errorMsg = e?.response?.data || e?.message || String(e);
      
      // Update database: mark as failed
      await supabase
        .from("posts")
        .update({
          status: "failed",
          error_message: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg),
          retry_count: (existingPost?.retry_count ?? 0) + 1,
          last_retry_at: new Date().toISOString()
        })
        .eq("id", dbPost.id);

      results.push({
        ok: false,
        error: errorMsg,
        orchestratorId,
        scheduledAt: p.scheduledAt,
        channels: p.channels
      });
    }
  }

  res.json({ results });
});

export default router;
