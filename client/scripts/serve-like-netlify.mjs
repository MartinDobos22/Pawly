// Lokálny statický server ktorý napodobňuje Netlify: statické súbory majú
// prednosť (vrátane "pretty URL" /foo -> /foo/index.html), inak SPA fallback
// na index.html (status 200). Slúži na overenie prerenderu pred deployom.
//
// Použitie:  node scripts/serve-like-netlify.mjs [port]
//   (najprv spusti `npm run build`)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2]) || 8788;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

async function tryFile(path) {
  try {
    const s = await stat(path);
    if (s.isFile()) return path;
  } catch {
    /* nie je súbor */
  }
  return null;
}

async function resolvePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const base = resolve(distDir, '.' + clean);
  // 1) presný súbor  2) pretty URL adresára  3) <path>.html
  return (
    (await tryFile(base)) ||
    (await tryFile(resolve(base, 'index.html'))) ||
    (await tryFile(base + '.html')) ||
    null
  );
}

const server = createServer(async (req, res) => {
  let filePath = await resolvePath(req.url || '/');
  let status = 200;
  if (!filePath) {
    // SPA fallback (Netlify: /* -> /index.html, status 200)
    filePath = resolve(distDir, 'index.html');
    status = 200;
  }
  try {
    const body = await readFile(filePath);
    res.writeHead(status, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.listen(port, () => {
  console.log(`[serve-like-netlify] http://localhost:${port}  (dist: ${distDir})`);
});
