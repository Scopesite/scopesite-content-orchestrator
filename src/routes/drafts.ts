import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// Get all drafts for a workspace
router.get("/drafts", async (req, res) => {
  const { workspace, status } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  let query = supabase
    .from("post_drafts")
    .select("*")
    .eq("workspace_id", workspace)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ drafts: data });
});

// Get single draft
router.get("/drafts/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("post_drafts")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Draft not found" });
  }

  res.json(data);
});

// Create draft
router.post("/drafts", async (req, res) => {
  const { workspace_id, title, body, channels, media, first_comment, tags, link, utm, scheduled_at, timezone, created_by } = req.body;

  if (!workspace_id || !body || !channels || channels.length === 0) {
    return res.status(400).json({ error: "workspace_id, body, and channels are required" });
  }

  const { data, error } = await supabase
    .from("post_drafts")
    .insert({
      workspace_id,
      title,
      body,
      channels,
      media: media ?? [],
      first_comment: first_comment ?? {},
      tags: tags ?? [],
      link,
      utm: utm ?? {},
      scheduled_at,
      timezone: timezone ?? "Europe/London",
      status: "draft",
      created_by
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update draft
router.patch("/drafts/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("post_drafts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete draft
router.delete("/drafts/:id", async (req, res) => {
  const { error } = await supabase
    .from("post_drafts")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Approve draft
router.post("/drafts/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { approved_by, notes } = req.body;

  const { data, error } = await supabase
    .from("post_drafts")
    .update({
      status: "approved",
      approved_by,
      approved_at: new Date().toISOString(),
      approval_notes: notes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Reject draft
router.post("/drafts/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { rejected_reason } = req.body;

  const { data, error } = await supabase
    .from("post_drafts")
    .update({
      status: "rejected",
      rejected_reason
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;

