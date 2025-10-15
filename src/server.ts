import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import accountsRouter from "./routes/accounts.js";
import postsRouter from "./routes/posts.js";
import webhooksRouter from "./routes/webhooks.js";
import draftsRouter from "./routes/drafts.js";
import hashtagsRouter from "./routes/hashtags.js";
import mediaRouter from "./routes/media.js";
import templatesRouter from "./routes/templates.js";
import configRouter from "./routes/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CORS = process.env.CORS_ORIGIN?.split(",").map(s => s.trim()) ?? true;

const app = express();
app.use(cors({ origin: CORS }));
app.use(express.json({ limit: "5mb" }));

// Serve static admin UI from /public
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath, {
  extensions: ["html"],
  maxAge: "1h",
  setHeaders: (res) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
  }
}));

app.get("/api", (_req, res) => {
  res.json({
    service: "ScopeSite Content Orchestrator",
    version: "0.2.0",
    status: "operational",
    endpoints: {
      health: "GET /health",
      workspaces: "GET /workspaces",
      accounts: "GET /accounts?workspace={id}",
      posts: {
        bulk: "POST /posts/bulk",
        list: "GET /posts?workspace={id}",
        get: "GET /posts/:id"
      },
      drafts: {
        list: "GET /drafts?workspace={id}",
        create: "POST /drafts",
        get: "GET /drafts/:id",
        update: "PATCH /drafts/:id",
        delete: "DELETE /drafts/:id",
        approve: "POST /drafts/:id/approve",
        reject: "POST /drafts/:id/reject"
      },
      hashtags: {
        sets: "GET /hashtags/sets?workspace={id}",
        create: "POST /hashtags/sets",
        analytics: "GET /hashtags/analytics?workspace={id}"
      },
      media: {
        list: "GET /media?workspace={id}",
        create: "POST /media",
        folders: "GET /media/folders?workspace={id}"
      },
      templates: {
        list: "GET /templates?workspace={id}",
        create: "POST /templates",
        use: "POST /templates/:id/use"
      },
      config: {
        windows: "GET /windows?workspace={id}",
        mappings: "GET /mappings?workspace={id}",
        calendar: "GET /calendar?workspace={id}&start_date={date}&end_date={date}"
      },
      webhook: "POST /webhooks/contentstudio"
    },
    docs: "https://github.com/Scopesite/scopesite-content-orchestrator"
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "scopesite-content-orchestrator" });
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});

app.use(accountsRouter);
app.use(postsRouter);
app.use(webhooksRouter);
app.use(draftsRouter);
app.use(hashtagsRouter);
app.use(mediaRouter);
app.use(templatesRouter);
app.use(configRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Orchestrator up on ${port}`));
