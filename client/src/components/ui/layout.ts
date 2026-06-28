// Jediný zdroj pravdy pre šírky stránok. Nepoužívaj hardcoded `maxWidth` v stránkach —
// použi <PageContainer width="…">, aby bola appka jednotná a zmena šírky bola na 1 mieste.
export const PAGE_WIDTHS = {
  page: 1024, // štandardná obsahová stránka (dashboard, zoznamy, detail)
  form: 680, // fokusovaný formulárový tok
  narrow: 520, // úzky stav (empty state, krátka karta)
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;
