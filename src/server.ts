import express from "express";
import cors from "cors";
import accountsRouter from "./routes/accounts.js";
import postsRouter from "./routes/posts.js";
import webhooksRouter from "./routes/webhooks.js";

const CORS = process.env.CORS_ORIGIN?.split(",").map(s => s.trim()) ?? true;

const app = express();
app.use(cors({ origin: CORS }));
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "ScopeSite Content Orchestrator",
    version: "0.1.0",
    status: "operational",
    endpoints: {
      health: "GET /health",
      workspaces: "GET /workspaces",
      accounts: "GET /accounts?workspace={id}",
      bulkSchedule: "POST /posts/bulk",
      getPosts: "GET /posts?workspace={id}",
      webhook: "POST /webhooks/contentstudio"
    },
    docs: "https://github.com/Scopesite/scopesite-content-orchestrator"
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "scopesite-content-orchestrator" });
});

app.use(accountsRouter);
app.use(postsRouter);
app.use(webhooksRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Orchestrator up on ${port}`));
