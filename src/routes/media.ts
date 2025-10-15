import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// Get all media for a workspace
router.get("/media", async (req, res) => {
  const { workspace, folder, tags } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  let query = supabase
    .from("media_library")
    .select("*")
    .eq("workspace_id", workspace)
    .order("created_at", { ascending: false });

  if (folder) {
    query = query.eq("folder", folder);
  }

  if (tags && typeof tags === "string") {
    const tagArray = tags.split(",");
    query = query.contains("tags", tagArray);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ media: data });
});

// Get single media item
router.get("/media/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("media_library")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Media not found" });
  }

  res.json(data);
});

// Add media
router.post("/media", async (req, res) => {
  const {
    workspace_id,
    url,
    filename,
    alt_text,
    file_type,
    file_size,
    width,
    height,
    tags,
    folder,
    created_by
  } = req.body;

  if (!workspace_id || !url) {
    return res.status(400).json({ error: "workspace_id and url are required" });
  }

  const { data, error } = await supabase
    .from("media_library")
    .insert({
      workspace_id,
      url,
      filename,
      alt_text,
      file_type,
      file_size,
      width,
      height,
      tags: tags ?? [],
      folder,
      created_by
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update media
router.patch("/media/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("media_library")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete media
router.delete("/media/:id", async (req, res) => {
  const { error } = await supabase
    .from("media_library")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// Get folders for a workspace
router.get("/media/folders", async (req, res) => {
  const { workspace } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  const { data, error } = await supabase
    .from("media_library")
    .select("folder")
    .eq("workspace_id", workspace)
    .not("folder", "is", null);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const uniqueFolders = [...new Set(data.map(d => d.folder))].filter(Boolean);

  res.json({ folders: uniqueFolders });
});

export default router;

