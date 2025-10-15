import { Router } from "express";
import { cs } from "../lib/contentstudio.js";

const router = Router();

router.get("/workspaces", async (_req, res) => {
  try {
    const r = await cs.get("/workspaces");
    res.json(r.data);
  } catch (e: any) {
    res.status(502).json({ error: e.response?.data || e.message });
  }
});

router.get("/accounts", async (req, res) => {
  const workspace = req.query.workspace as string;
  if (!workspace) return res.status(400).json({ error: "workspace is required" });
  try {
    const r = await cs.get(`/workspaces/${workspace}/accounts`);
    res.json(r.data);
  } catch (e: any) {
    res.status(502).json({ error: e.response?.data || e.message });
  }
});

export default router;
