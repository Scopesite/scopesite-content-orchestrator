// Simple post-build verification for admin assets
const fs = require('fs');
const path = require('path');

const adminDist = path.join(process.cwd(), 'admin', 'dist');
const assetsDir = path.join(adminDist, 'assets');

function fail(msg) {
  console.error(`[verify-admin-build] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(adminDist)) fail('admin/dist does not exist. Did admin build run?');
if (!fs.existsSync(assetsDir)) fail('admin/dist/assets does not exist. Vite build likely failed.');

const indexHtml = path.join(adminDist, 'index.html');
if (!fs.existsSync(indexHtml)) fail('admin/dist/index.html missing.');

const html = fs.readFileSync(indexHtml, 'utf8');
const jsRefs = [...html.matchAll(/\/admin\/assets\/([A-Za-z0-9_-]+\.js)/g)].map(m => m[1]);
if (jsRefs.length === 0) fail('No JS asset references found in admin/dist/index.html');

for (const file of jsRefs) {
  const p = path.join(assetsDir, file);
  if (!fs.existsSync(p)) fail(`Referenced JS asset missing in assets dir: ${file}`);
}

console.log('[verify-admin-build] OK: admin assets present and referenced.');

