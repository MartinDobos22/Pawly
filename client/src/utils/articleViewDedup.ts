const KEY = 'granule-check-article-events';

type SeenMap = Record<string, string>; // `${slug}:${eventType}` → 'YYYY-MM-DD'

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Vráti `true` ak sa daný event pre daný článok dnes ešte neposlal (a rovno si
 * ho poznačí). `false` ak už dnes odišiel — volajúci ho preskočí.
 *
 * Slúži na „unikátny čitateľ za deň": refresh, opätovné otvorenie aj React
 * StrictMode dvojité mountnutie počítajú view/scroll/CTA len raz. Deduplikácia
 * je per-prehliadač (localStorage), takže na presnosť naprieč zariadeniami
 * nespolieha — len odstraňuje najčastejšie nafúknutie.
 */
export function shouldSendOncePerDay(slug: string, eventType: string): boolean {
  try {
    const stamp = today();
    const raw = localStorage.getItem(KEY);
    const seen: SeenMap = raw ? (JSON.parse(raw) as SeenMap) : {};
    const mapKey = `${slug}:${eventType}`;
    if (seen[mapKey] === stamp) return false;

    // Ponechaj len dnešné záznamy (bounded veľkosť), plus tento nový.
    const pruned: SeenMap = { [mapKey]: stamp };
    for (const [k, v] of Object.entries(seen)) {
      if (v === stamp) pruned[k] = v;
    }
    localStorage.setItem(KEY, JSON.stringify(pruned));
    return true;
  } catch {
    // localStorage nedostupné (privátny režim, zablokované) → radšej pošli,
    // nech tracking funguje, aj keď bez deduplikácie.
    return true;
  }
}
