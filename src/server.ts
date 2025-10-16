import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
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

// Paths
const adminPath = path.join(process.cwd(), "admin", "dist");

// Debug toggles
const DEBUG_ADMIN = process.env.DEBUG_ADMIN === "1";

function verifyAdminBuildOnStartup() {
  try {
    const indexHtmlPath = path.join(adminPath, "index.html");
    const existsIndex = fs.existsSync(indexHtmlPath);
    const assetsDir = path.join(adminPath, "assets");
    const existsAssets = fs.existsSync(assetsDir);
    let jsRefs: string[] = [];
    let cssRefs: string[] = [];
    if (existsIndex) {
      const html = fs.readFileSync(indexHtmlPath, "utf8");
      jsRefs = [...html.matchAll(/\/admin\/assets\/([A-Za-z0-9_-]+\.js)/g)].map(m => m[1]);
      cssRefs = [...html.matchAll(/\/admin\/assets\/([A-Za-z0-9_-]+\.css)/g)].map(m => m[1]);
    }
    console.log("[admin] adminPath:", adminPath);
    console.log("[admin] index.html:", existsIndex ? "present" : "missing");
    console.log("[admin] assets dir:", existsAssets ? "present" : "missing");
    console.log("[admin] js refs:", jsRefs.join(", "));
    if (existsAssets) {
      jsRefs.forEach(f => {
        const p = path.join(assetsDir, f);
        console.log("[admin] js exists:", f, fs.existsSync(p));
      });
    }
  } catch (e: any) {
    console.warn("[admin] startup verify failed:", e?.message || String(e));
  }
}

verifyAdminBuildOnStartup();

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

app.get("/", (_req, res) => {
  res.redirect("/admin");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "scopesite-content-orchestrator" });
});

// API routes
app.use(accountsRouter);
app.use(postsRouter);
app.use(webhooksRouter);
app.use(draftsRouter);
app.use(hashtagsRouter);
app.use(mediaRouter);
app.use(templatesRouter);
app.use(configRouter);

// Serve React admin static files (assets)
app.use("/admin", express.static(adminPath, {
  index: false,
  setHeaders: (res, filePath) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    // Cache assets aggressively, but never cache HTML
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

function sendAdminIndex(res: express.Response) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.sendFile(path.join(adminPath, "index.html"));
}

// Explicit index routes
app.get(["/admin", "/admin/", "/admin/index.html"], (_req, res) => {
  sendAdminIndex(res);
});

// SPA fallback for client-side routing - only for non-asset requests
app.get("/admin*", (req, res, next) => {
  if (req.path.includes('/assets/') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  sendAdminIndex(res);
});

// Optional: assets health endpoint for debugging
app.get("/admin/_assets-health", (_req, res) => {
  try {
    const indexHtml = fs.readFileSync(path.join(adminPath, "index.html"), "utf8");
    const js = Array.from(indexHtml.matchAll(/\/admin\/assets\/([A-Za-z0-9_-]+\.js)/g)).map((m: any) => m[1]);
    const css = Array.from(indexHtml.matchAll(/\/admin\/assets\/([A-Za-z0-9_-]+\.css)/g)).map((m: any) => m[1]);
    res.json({ ok: true, js, css });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Smoke endpoint to confirm process and settings
app.get("/__smoke", (_req, res) => {
  res.json({
    ok: true,
    pid: process.pid,
    node: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || "",
      DEBUG_ADMIN: process.env.DEBUG_ADMIN || "",
    }
  });
});

// Optional verbose request logging (disabled by default)
if (DEBUG_ADMIN) {
  app.use((req, _res, next) => {
    if (req.path.startsWith('/admin')) {
      console.log(`[admin] ${req.method} ${req.path}`);
    }
    next();
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Orchestrator up on ${port}`));
