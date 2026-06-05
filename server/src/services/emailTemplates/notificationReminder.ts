import type { EmailLocale } from './verifyEmail';

export interface ReminderRow {
  petName: string;
  typeLabel: string;
  label: string;
  dueDate: string;
  daysUntil: number;
}

interface Copy {
  heading: string;
  intro: string;
  cta: string;
  footer: string;
  subjectSuffix: (n: number) => string;
  statusText: (daysUntil: number) => string;
}

function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

const COPIES: Record<EmailLocale, Copy> = {
  sk: {
    heading: 'Pripomienka z Pawly',
    intro: 'Pár termínov tvojich zvierat sa blíži alebo už ušlo. Tu je rýchly prehľad:',
    cta: 'Otvoriť zdravotný pas',
    footer: 'Tieto pripomienky môžeš kedykoľvek vypnúť v aplikácii (Nastavenia → Notifikácie).',
    subjectSuffix: (n) => `${n} ${plural(n, 'termín', 'termíny', 'termínov')} čoskoro`,
    statusText: (d) => {
      if (d < 0) return `po termíne o ${-d} ${plural(-d, 'deň', 'dni', 'dní')}`;
      if (d === 0) return 'dnes';
      return `o ${d} ${plural(d, 'deň', 'dni', 'dní')}`;
    },
  },
  en: {
    heading: 'Reminder from Pawly',
    intro: "Some deadlines for your pets are coming up or have passed. Here's a quick overview:",
    cta: 'Open health passport',
    footer: 'You can disable these reminders any time in the app (Settings → Notifications).',
    subjectSuffix: (n) => `${n} upcoming reminder${n === 1 ? '' : 's'}`,
    statusText: (d) => {
      if (d < 0) return `${-d} day${-d === 1 ? '' : 's'} overdue`;
      if (d === 0) return 'today';
      return `in ${d} day${d === 1 ? '' : 's'}`;
    },
  },
};

export function reminderSubject(locale: EmailLocale, itemCount: number): string {
  return `Pawly: ${COPIES[locale].subjectSuffix(itemCount)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildReminderHtml(
  rows: ReminderRow[],
  locale: EmailLocale,
  appUrl: string
): string {
  const c = COPIES[locale];
  const tableRows = rows
    .slice()
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .map((r) => {
      const overdue = r.daysUntil < 0;
      const color = overdue ? '#b3261e' : r.daysUntil <= 7 ? '#9a6700' : '#1b5e20';
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(r.petName)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(r.typeLabel)}: <strong>${escapeHtml(r.label)}</strong></td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${color};font-weight:600;">${escapeHtml(c.statusText(r.daysUntil))}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">${escapeHtml(r.dueDate)}</td>
      </tr>`;
    })
    .join('');

  const cta = appUrl
    ? `<p style="margin:20px 0;"><a href="${escapeHtml(appUrl)}/zdravotny-pas" style="background:#0f4c5c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block;">${escapeHtml(c.cta)}</a></p>`
    : '';

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;">
    <h2 style="color:#0f4c5c;">${escapeHtml(c.heading)}</h2>
    <p>${escapeHtml(c.intro)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">${tableRows}</table>
    ${cta}
    <p style="color:#888;font-size:12px;margin-top:24px;">${escapeHtml(c.footer)}</p>
  </div>`;
}
