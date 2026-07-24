import { httpError } from '../utils/httpError';
import { logger } from '../utils/logger';

// Netlify build hook = rebuild verejného webu (prerender článkov z DB cez
// scripts/syncArticles.mjs). URL je secret — nikdy ju neloguj.

export function isPublishConfigured(): boolean {
  return Boolean(process.env.NETLIFY_BUILD_HOOK_URL?.trim());
}

// Spustí Netlify build hook. Vyhodí httpError ak nie je nakonfigurované (503)
// alebo hook zlyhá (502). Použi keď je build hlavná akcia (explicitné „Publikovať").
export async function triggerNetlifyBuild(): Promise<void> {
  const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL?.trim();
  if (!hookUrl) {
    throw httpError(503, 'Publikovanie nie je nakonfigurované.', 'PUBLISH_NOT_CONFIGURED');
  }
  let ok = false;
  let status = 0;
  try {
    const hookRes = await fetch(hookUrl, { method: 'POST', signal: AbortSignal.timeout(15000) });
    ok = hookRes.ok;
    status = hookRes.status;
  } catch {
    throw httpError(502, 'Spustenie buildu zlyhalo.', 'PUBLISH_FAILED');
  }
  if (!ok) {
    logger.error('Netlify build hook vrátil chybu', { status });
    throw httpError(502, 'Spustenie buildu zlyhalo.', 'PUBLISH_FAILED');
  }
}

// Non-throwing variant: keď je build vedľajší efekt inej akcie (auto-redeploy po
// zmene statusu na published, cron scheduled publish). Zlyhanie nesmie zhodiť
// hlavnú operáciu — zaloguje sa a vráti false. Ak nie je nakonfigurované, ticho
// preskočí (redeploy je opt-in cez env).
export async function triggerNetlifyBuildSafe(context?: Record<string, unknown>): Promise<boolean> {
  if (!isPublishConfigured()) return false;
  try {
    await triggerNetlifyBuild();
    logger.info('Netlify redeploy spustený', context);
    return true;
  } catch (err) {
    logger.error('Automatický Netlify redeploy zlyhal', {
      ...context,
      code: (err as { code?: string }).code,
    });
    return false;
  }
}
