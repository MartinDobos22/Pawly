import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FOOD_SAFETY_ARTICLES, buildFoodSafetyPath } from '../src/content/foodSafety/index.ts';
import { GUIDE_ARTICLES, buildGuidePath } from '../src/content/guides/index.ts';

const SITE_URL = 'https://pawly.sk';

const STATIC_URLS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/login', changefreq: 'monthly', priority: '0.3' },
  { path: '/register', changefreq: 'monthly', priority: '0.5' },
  { path: '/ochrana-sukromia', changefreq: 'yearly', priority: '0.3' },
  { path: '/moze-pes-jest', changefreq: 'weekly', priority: '0.7' },
  { path: '/moze-macka-jest', changefreq: 'weekly', priority: '0.7' },
  { path: '/rady-pre-majitelov', changefreq: 'weekly', priority: '0.7' },
];

function buildUrlEntry({ path: loc, changefreq, priority, lastmod }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

const entries = [
  ...STATIC_URLS.map(buildUrlEntry),
  ...FOOD_SAFETY_ARTICLES.map((article) =>
    buildUrlEntry({
      path: buildFoodSafetyPath(article),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: article.lastReviewed,
    }),
  ),
  ...GUIDE_ARTICLES.map((guide) =>
    buildUrlEntry({
      path: buildGuidePath(guide),
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: guide.lastReviewed,
    }),
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

const outputPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public/sitemap.xml',
);
writeFileSync(outputPath, xml, 'utf-8');

console.log(`generate-sitemap: wrote ${entries.length} URLs to public/sitemap.xml`);
