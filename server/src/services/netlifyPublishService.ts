import { httpError } from '../utils/httpError';
import { logger } from '../utils/logger';

// Netlify build hook = rebuild verejného webu (prerender článkov z DB cez
// scripts/syncArticles.mjs). URL je secret — nikdy ju neloguj.

const DEFAULT_THROTTLE_MINUTES = 5;

function throttleMs(): number {
  const raw = Number(process.env.NETLIFY_BUILD_MIN_INTERVAL_MINUTES);
  const minutes = Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_THROTTLE_MINUTES;
  return minutes * 60_000;
}

// Throttle stav je in-memory (per-proces). Na free-tier single-instance hostingu
// stačí; pri reštarte sa vynuluje (najhorší prípad = jeden build navyše).
let lastBuildStartedAt = 0;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

export function isPublishConfigured(): boolean {
  return Boolean(process.env.NETLIFY_BUILD_HOOK_URL?.trim());
}

// Nízkoúrovňové POST na hook. Vyhodí httpError ak nie je nakonfigurované (503)
// alebo hook zlyhá (502).
async function postBuildHook(): Promise<void> {
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

async function runBuild(context?: Record<string, unknown>): Promise<void> {
  lastBuildStartedAt = Date.now();
  try {
    await postBuildHook();
    logger.info('Netlify redeploy spustený', context);
  } catch (err) {
    logger.error('Automatický Netlify redeploy zlyhal', {
      ...context,
      code: (err as { code?: string }).code,
    });
  }
}

// Explicitné, okamžité spustenie buildu (batch tlačidlo „Publikovať na web").
// Vyhodí httpError — volajúci chybu ukáže adminovi. Zruší prípadný naplánovaný
// throttled build, keďže tento build pokryje aktuálny stav DB.
export async function triggerNetlifyBuild(): Promise<void> {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  lastBuildStartedAt = Date.now();
  await postBuildHook();
}

export type RedeployOutcome = 'triggered' | 'scheduled' | 'skipped';

// Build ako vedľajší efekt inej akcie (publish článku, cron scheduled publish).
// Throttluje: prvé volanie po okne spustí build hneď (leading), ďalšie v rámci
// okna sa zlejú do jedného trailing buildu — tak sa zachytí aj posledná zmena
// bez toho, aby séria publikovaní minula desiatky build minút. Nikdy nevyhodí:
// keď nie je nakonfigurované, ticho preskočí.
export function requestNetlifyRedeploy(context?: Record<string, unknown>): RedeployOutcome {
  if (!isPublishConfigured()) return 'skipped';

  const window = throttleMs();
  const elapsed = Date.now() - lastBuildStartedAt;

  if (elapsed >= window && !pendingTimer) {
    void runBuild(context);
    return 'triggered';
  }

  if (!pendingTimer) {
    const wait = Math.max(window - elapsed, 0);
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      void runBuild({ ...context, coalesced: true });
    }, wait);
    pendingTimer.unref?.();
  }
  return 'scheduled';
}
