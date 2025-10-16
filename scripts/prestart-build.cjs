// Ensure admin build exists at runtime (Railway safety net)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const adminDist = path.join(process.cwd(), 'admin', 'dist');
const assetsDir = path.join(adminDist, 'assets');

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

const needsBuild = !exists(adminDist) || !exists(assetsDir) || fs.readdirSync(assetsDir).filter(f => f.endsWith('.js')).length === 0;

if (needsBuild) {
  console.log('[prestart] admin build missing; building now...');
  const r = spawnSync('npm', ['run', 'build:admin'], { stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error('[prestart] admin build failed');
    process.exit(r.status || 1);
  }
}

// Ensure server is built
const serverDist = path.join(process.cwd(), 'dist', 'server.js');
if (!exists(serverDist)) {
  console.log('[prestart] server build missing; building now...');
  const r2 = spawnSync('npm', ['run', 'build:server'], { stdio: 'inherit', shell: true });
  if (r2.status !== 0) {
    console.error('[prestart] server build failed');
    process.exit(r2.status || 1);
  }
}

console.log('[prestart] OK');

