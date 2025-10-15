import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// Get all templates for a workspace
router.get("/templates", async (req, res) => {
  const { workspace, category } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  let query = supabase
    .from("post_templates")
    .select("*")
    .eq("workspace_id", workspace)
    .order("usage_count", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ templates: data });
});

// Get single template
router.get("/templates/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("post_templates")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Template not found" });
  }

  res.json(data);
});

// Create template
router.post("/templates", async (req, res) => {
  const {
    workspace_id,
    name,
    description,
    category,
    title_template,
    body_template,
    default_channels,
    default_tags,
    default_first_comment,
    created_by
  } = req.body;

  if (!workspace_id || !name || !body_template) {
    return res.status(400).json({ error: "workspace_id, name, and body_template are required" });
  }

  const { data, error } = await supabase
    .from("post_templates")
    .insert({
      workspace_id,
      name,
      description,
      category,
      title_template,
      body_template,
      default_channels: default_channels ?? [],
      default_tags: default_tags ?? [],
      default_first_comment: default_first_comment ?? {},
      created_by
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update template
router.patch("/templates/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("post_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete template
router.delete("/templates/:id", async (req, res) => {
  const { error } = await supabase
    .from("post_templates")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Increment usage count
router.post("/templates/:id/use", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase.rpc("increment_template_usage", { template_id: id });

  if (error) {
    // Fallback: fetch, increment, update
    const { data: template } = await supabase
      .from("post_templates")
      .select("usage_count")
      .eq("id", id)
      .single();

    if (template) {
      const { error: updateError } = await supabase
        .from("post_templates")
        .update({
          usage_count: (template.usage_count || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }
    }
  }

  res.json({ ok: true });
});

export default router;

