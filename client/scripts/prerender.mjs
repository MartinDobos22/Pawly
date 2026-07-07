import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(__dirname, '..');
const distDir = resolve(clientRoot, 'dist');
const ssrOutDir = resolve(clientRoot, '.ssg-dist');
const SITE_URL = 'https://pawly.sk';

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Netlify servíruje adresárový index (dist/<path>/index.html) na URL s koncovou
// lomkou a bez nej 301-uje. Canonical/og:url preto musia sedieť s 200-URL, inak
// Google fetchuje redirect. Root ('/') ostáva bez zmeny.
function withTrailingSlash(path) {
  if (path === '/' || path.endsWith('/')) return path;
  return `${path}/`;
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`Prerender: pattern nenájdený v index.html → ${regex}`);
  }
  return html.replace(regex, replacement);
}

function buildHtml(template, seo, bodyHtml) {
  const canonical = `${SITE_URL}${withTrailingSlash(seo.path)}`;
  let html = template;

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(seo.title)}</title>`);
  html = replaceTag(
    html,
    /<meta[^>]*name="description"[^>]*>/,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`
  );
  html = replaceTag(
    html,
    /<link[^>]*rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`
  );
  html = replaceTag(
    html,
    /<meta[^>]*property="og:url"[^>]*>/,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`
  );
  html = replaceTag(
    html,
    /<meta[^>]*property="og:title"[^>]*>/,
    `<meta property="og:title" content="${escapeAttr(seo.title)}" />`
  );
  html = replaceTag(
    html,
    /<meta[^>]*property="og:description"[^>]*>/,
    `<meta property="og:description" content="${escapeAttr(seo.description)}" />`
  );
  html = replaceTag(
    html,
    /<meta[^>]*name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`
  );
  html = replaceTag(
    html,
    /<meta[^>]*name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`
  );

  if (seo.jsonLd) {
    const json = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c');
    const script = `<script type="application/ld+json">${json}</script>`;
    html = html.replace('</head>', `    ${script}\n  </head>`);
  }

  if (!html.includes('<div id="root"></div>')) {
    throw new Error('Prerender: <div id="root"></div> nenájdený v index.html');
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

  return html;
}

async function main() {
  console.log('[prerender] build SSR bundlu verejných stránok…');
  await build({
    root: clientRoot,
    // configFile: false → nepreberáme vite.config.ts (jeho manualChunks koliduje
    // s SSR external). React plugin pridávame ručne kvôli transformu .tsx.
    configFile: false,
    plugins: [react()],
    logLevel: 'warn',
    // Zbundluj závislosti do výstupu — MUI má directory-importy ktoré Node ESM
    // neunesie ako externé moduly. Throwaway build, veľkosť nevadí.
    ssr: { noExternal: true },
    build: {
      ssr: true,
      target: 'esnext',
      outDir: ssrOutDir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        input: resolve(clientRoot, 'src/ssg/prerenderEntry.tsx'),
        output: { format: 'es', entryFileNames: 'prerenderEntry.mjs' },
      },
    },
  });

  const entryUrl = pathToFileURL(resolve(ssrOutDir, 'prerenderEntry.mjs')).href;
  const { renderPage, publicRoutes } = await import(entryUrl);

  const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

  for (const route of publicRoutes) {
    const { seo } = route;
    const bodyHtml = renderPage(seo.path, route.element);
    const pageHtml = buildHtml(template, seo, bodyHtml);

    const outDir = resolve(distDir, seo.path.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), pageHtml, 'utf-8');
    console.log(`[prerender] ✓ ${seo.path} → dist${seo.path}/index.html`);
  }

  rmSync(ssrOutDir, { recursive: true, force: true });
  console.log(`[prerender] hotovo — ${publicRoutes.length} stránok.`);
}

main().catch((err) => {
  console.error('[prerender] zlyhalo:', err);
  process.exit(1);
});
