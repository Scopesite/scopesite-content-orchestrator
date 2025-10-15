import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// ========================================
// POSTING WINDOWS
// ========================================

// Get posting windows for a workspace
router.get("/windows", async (req, res) => {
  const { workspace } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  const { data, error } = await supabase
    .from("posting_windows")
    .select("*")
    .eq("workspace_id", workspace)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ windows: data });
});

// Create posting window
router.post("/windows", async (req, res) => {
  const {
    workspace_id,
    channel,
    days_of_week,
    start_time,
    end_time,
    timezone,
    name
  } = req.body;

  if (!workspace_id || !days_of_week || !start_time || !end_time) {
    return res.status(400).json({
      error: "workspace_id, days_of_week, start_time, and end_time are required"
    });
  }

  const { data, error } = await supabase
    .from("posting_windows")
    .insert({
      workspace_id,
      channel,
      days_of_week,
      start_time,
      end_time,
      timezone: timezone ?? "Europe/London",
      name,
      active: true
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update posting window
router.patch("/windows/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("posting_windows")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete posting window
router.delete("/windows/:id", async (req, res) => {
  const { error } = await supabase
    .from("posting_windows")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// ========================================
// ACCOUNT MAPPINGS
// ========================================

// Get account mappings for a workspace
router.get("/mappings", async (req, res) => {
  const { workspace } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  const { data, error } = await supabase
    .from("account_mappings")
    .select("*")
    .eq("workspace_id", workspace)
    .eq("active", true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Convert to old format for backwards compatibility
  const mapping: Record<string, string | string[]> = {};
  data.forEach((m: any) => {
    mapping[m.channel_slug] = m.account_ids.length === 1 ? m.account_ids[0] : m.account_ids;
  });

  res.json({ mappings: data, legacy_format: mapping });
});

// Save account mapping
router.post("/mappings", async (req, res) => {
  const { workspace_id, channel_slug, account_ids } = req.body;

  if (!workspace_id || !channel_slug || !account_ids || account_ids.length === 0) {
    return res.status(400).json({
      error: "workspace_id, channel_slug, and account_ids are required"
    });
  }

  const { data, error } = await supabase
    .from("account_mappings")
    .upsert({
      workspace_id,
      channel_slug,
      account_ids,
      active: true
    }, { onConflict: "workspace_id,channel_slug" })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Bulk save mappings
router.post("/mappings/bulk", async (req, res) => {
  const { workspace_id, mappings } = req.body;

  if (!workspace_id || !mappings) {
    return res.status(400).json({ error: "workspace_id and mappings are required" });
  }

  const records = Object.entries(mappings).map(([channel_slug, account_ids]) => ({
    workspace_id,
    channel_slug,
    account_ids: Array.isArray(account_ids) ? account_ids : [account_ids as string],
    active: true
  }));

  const { data, error } = await supabase
    .from("account_mappings")
    .upsert(records, { onConflict: "workspace_id,channel_slug" })
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ mappings: data });
});

// Delete account mapping
router.delete("/mappings/:id", async (req, res) => {
  const { error } = await supabase
    .from("account_mappings")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

// ========================================
// CALENDAR EVENTS
// ========================================

// Get calendar events for a date range
router.get("/calendar", async (req, res) => {
  const { workspace, start_date, end_date } = req.query;
  
  if (!workspace) {
    return res.status(400).json({ error: "workspace query param required" });
  }

  let query = supabase
    .from("calendar_events")
    .select("*")
    .eq("workspace_id", workspace)
    .order("event_date", { ascending: true });

  if (start_date) {
    query = query.gte("event_date", start_date);
  }

  if (end_date) {
    query = query.lte("event_date", end_date);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ events: data });
});

// Create calendar event
router.post("/calendar", async (req, res) => {
  const {
    workspace_id,
    title,
    description,
    event_date,
    event_type,
    color,
    related_posts
  } = req.body;

  if (!workspace_id || !title || !event_date) {
    return res.status(400).json({
      error: "workspace_id, title, and event_date are required"
    });
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id,
      title,
      description,
      event_date,
      event_type: event_type ?? "custom",
      color: color ?? "#3B82F6",
      related_posts: related_posts ?? []
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
});

// Update calendar event
router.patch("/calendar/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from("calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Delete calendar event
router.delete("/calendar/:id", async (req, res) => {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

export default router;

