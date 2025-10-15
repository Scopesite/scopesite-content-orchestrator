import { Router } from "express";
import { cs } from "../lib/contentstudio.js";

const router = Router();

router.get("/workspaces", async (_req, res) => {
  try {
    const r = await cs.get("/workspaces");
    // Normalize response to { data: [...] }
    const raw = r.data;
    const data = raw?.data || raw?.workspaces || raw || [];
    res.json({ data: Array.isArray(data) ? data : [data] });
  } catch (e: any) {
    console.error("Workspaces fetch failed:", e.message);
    res.status(502).json({ error: e.response?.data || e.message });
  }
});

router.get("/accounts", async (req, res) => {
  const workspace = req.query.workspace as string;
  if (!workspace) return res.status(400).json({ error: "workspace query param required" });
  try {
    const r = await cs.get(`/workspaces/${workspace}/accounts`);
    // Normalize response to { data: [...] }
    const raw = r.data;
    const data = raw?.data || raw?.accounts || raw || [];
    res.json({ data: Array.isArray(data) ? data : [data] });
  } catch (e: any) {
    console.error(`Accounts fetch failed for workspace ${workspace}:`, e.message);
    res.status(502).json({ error: e.response?.data || e.message });
  }
});

export default router;
