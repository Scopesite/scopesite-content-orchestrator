import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// Get all hashtag sets for a workspace
router.get("/hashtags/sets", async (req, res) => {
  const { workspace } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  const { data, error } = await supabase
    .from("hashtag_sets")
    .select("*")
    .eq("workspace_id", workspace)
    .order("usage_count", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ sets: data });
});

// Get single hashtag set
router.get("/hashtags/sets/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("hashtag_sets")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Hashtag set not found" });
  }

  res.json(data);
});

// Create hashtag set
router.post("/hashtags/sets", async (req, res) => {
  const { workspace_id, name, hashtags, description, created_by } = req.body;

  if (!workspace_id || !name || !hashtags || hashtags.length === 0) {
    return res.status(400).json({ error: "workspace_id, name, and hashtags are required" });
  }

  const { data, error } = await supabase
    .from("hashtag_sets")
    .insert({
      workspace_id,
      name,
      hashtags,
      description,
      created_by
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update hashtag set
router.patch("/hashtags/sets/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("hashtag_sets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete hashtag set
router.delete("/hashtags/sets/:id", async (req, res) => {
  const { error } = await supabase
    .from("hashtag_sets")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Get hashtag usage analytics
router.get("/hashtags/analytics", async (req, res) => {
  const { workspace } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  const { data, error } = await supabase
    .from("hashtag_usage")
    .select("hashtag, platform, used_at")
    .eq("workspace_id", workspace)
    .order("used_at", { ascending: false })
    .limit(1000);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Group by hashtag and count
  const analytics = data.reduce((acc: any, item) => {
    if (!acc[item.hashtag]) {
      acc[item.hashtag] = { hashtag: item.hashtag, count: 0, platforms: {} };
    }
    acc[item.hashtag].count++;
    acc[item.hashtag].platforms[item.platform] = (acc[item.hashtag].platforms[item.platform] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.values(analytics).sort((a: any, b: any) => b.count - a.count);

  res.json({ analytics: sorted });
});

export default router;

