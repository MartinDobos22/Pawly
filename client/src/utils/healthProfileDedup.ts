export function dedupList(items: readonly string[] | undefined): string[] {
  if (!items?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function subtractList(
  primary: readonly string[] | undefined,
  secondary: readonly string[] | undefined
): string[] {
  if (!secondary?.length) return [];
  const block = new Set((primary ?? []).map((x) => x.trim().toLowerCase()).filter(Boolean));
  return dedupList(secondary).filter((item) => !block.has(item.toLowerCase()));
}
