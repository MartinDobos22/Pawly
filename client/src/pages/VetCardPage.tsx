import { Box, Button, Stack, Typography } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { PetProfile } from '../types';
import AiFormattedText from '../components/AiFormattedText';
import ClinicalHistory from '../components/vetCard/ClinicalHistory';
import ExportSectionsToolbar, {
  DEFAULT_EXPORT_SECTIONS,
  type ExportSectionsState,
} from '../components/vetCard/ExportSectionsToolbar';
import { TIMELINE_TYPE_META } from '../components/healthPassport/constants';
import type {
  DewormingRecord,
  DietEntry,
  EctoparasiteRecord,
  MedicationRecord,
  TimelineEvent,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/dogHealth';

const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (value?: string) => {
  if (!value) return '–';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });
};
const formatDateShort = (value?: string) => {
  if (!value) return '–';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; }

  :root {
    --green-900: #14532d;
    --green-700: #15803d;
    --green-500: #22c55e;
    --green-100: #dcfce7;
    --green-50: #f0fdf4;
    --slate-900: #0f172a;
    --slate-700: #334155;
    --slate-500: #64748b;
    --slate-300: #cbd5e1;
    --slate-100: #f1f5f9;
    --slate-50: #f8fafc;
    --amber-500: #f59e0b;
    --amber-100: #fef3c7;
    --red-600: #dc2626;
    --red-100: #fee2e2;
    --blue-600: #2563eb;
    --blue-100: #dbeafe;
    --white: #ffffff;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.10);
    --radius: 14px;
    --radius-sm: 8px;
  }

  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background: var(--slate-50);
    color: var(--slate-900);
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    line-height: 1.6;
  }

  .page-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  /* ── HEADER ─────────────────────────────────────── */
  .header {
    background: linear-gradient(135deg, var(--green-900) 0%, #1a4731 60%, #0f3422 100%);
    border-radius: var(--radius);
    padding: 36px 40px;
    margin-bottom: 24px;
    display: flex;
    align-items: flex-start;
    gap: 28px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .header::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }

  .header::after {
    content: '';
    position: absolute;
    bottom: -60px; left: 30%;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }

  .avatar {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 2.5px solid rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    flex-shrink: 0;
  }

  .header-info { flex: 1; }
  .dog-name {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    font-weight: 400;
    line-height: 1;
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }

  .dog-meta {
    font-size: 15px;
    color: rgba(255,255,255,0.75);
    font-weight: 400;
    margin: 0 0 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
  }

  .dog-meta span { display: flex; align-items: center; gap: 5px; }

  .header-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .badge-valid   { background: var(--green-100); color: var(--green-700); }
  .badge-warning { background: var(--amber-100); color: #92400e; }
  .badge-expired { background: var(--red-100);   color: var(--red-600); }
  .badge-neutral { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); }

  .generated-at {
    margin-top: 16px;
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* ── SECTION CARD ────────────────────────────────── */
  .section {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    margin-bottom: 16px;
    border: 1px solid rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 24px 16px;
    border-bottom: 1px solid var(--slate-100);
  }

  .section-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    flex-shrink: 0;
  }

  .icon-green  { background: var(--green-100); }
  .icon-blue   { background: var(--blue-100); }
  .icon-amber  { background: var(--amber-100); }
  .icon-red    { background: var(--red-100); }
  .icon-slate  { background: var(--slate-100); }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin: 0;
  }

  .section-body { padding: 20px 24px; }

  /* ── GRID ROW ────────────────────────────────────── */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .info-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin-bottom: 3px;
  }

  .info-field .value {
    font-size: 15px;
    font-weight: 500;
    color: var(--slate-900);
  }

  /* ── TAG CHIPS ───────────────────────────────────── */
  .tag-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  .tag-red    { background: var(--red-100);   color: var(--red-600); }
  .tag-amber  { background: var(--amber-100); color: #92400e; }
  .tag-blue   { background: var(--blue-100);  color: var(--blue-600); }
  .tag-slate  { background: var(--slate-100); color: var(--slate-700); }
  .tag-green  { background: var(--green-100); color: var(--green-700); }

  /* ── VACCINE ROW ─────────────────────────────────── */
  .vaccine-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--slate-100);
  }
  .vaccine-row:last-child { border-bottom: none; }

  .vaccine-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--slate-900);
  }

  .vaccine-dates {
    font-size: 12px;
    color: var(--slate-500);
    margin-top: 2px;
  }

  /* ── MEDICATION ROW ──────────────────────────────── */
  .med-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid var(--slate-100);
  }
  .med-row:last-child { border-bottom: none; }

  .med-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--green-500);
    margin-top: 5px;
    flex-shrink: 0;
  }

  .med-name { font-size: 14px; font-weight: 600; color: var(--slate-900); }
  .med-detail { font-size: 12px; color: var(--slate-500); margin-top: 2px; }

  /* ── VISIT CARD ──────────────────────────────────── */
  .visit-card {
    background: var(--slate-50);
    border: 1px solid var(--slate-200, #e2e8f0);
    border-radius: var(--radius-sm);
    padding: 16px;
    margin-bottom: 12px;
  }
  .visit-card:last-child { margin-bottom: 0; }

  .visit-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .visit-date {
    font-size: 12px;
    font-weight: 700;
    color: var(--green-700);
    background: var(--green-100);
    padding: 3px 10px;
    border-radius: 999px;
  }

  .visit-clinic {
    font-size: 12px;
    color: var(--slate-500);
    background: var(--slate-100);
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 500;
  }

  .visit-reason {
    font-size: 13px;
    font-weight: 600;
    color: var(--slate-700);
    margin-bottom: 8px;
  }

  .visit-section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--slate-500);
    margin: 8px 0 3px;
  }

  .visit-text {
    font-size: 13px;
    color: var(--slate-700);
    line-height: 1.55;
  }

  /* ── TIMELINE ────────────────────────────────────── */
  .timeline-item {
    display: flex;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid var(--slate-100);
    align-items: flex-start;
  }
  .timeline-item:last-child { border-bottom: none; }

  .tl-date {
    font-size: 11px;
    color: var(--slate-500);
    font-weight: 600;
    white-space: nowrap;
    min-width: 80px;
    padding-top: 2px;
  }

  .tl-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }

  .tl-content { flex: 1; }
  .tl-title { font-size: 13px; font-weight: 600; color: var(--slate-900); }
  .tl-sub   { font-size: 12px; color: var(--slate-500); margin-top: 1px; }

  /* ── FOOTER ──────────────────────────────────────── */
  .footer {
    text-align: center;
    padding: 20px;
    color: var(--slate-400, #94a3b8);
    font-size: 12px;
    letter-spacing: 0.03em;
  }

  /* ── PRINT ───────────────────────────────────────── */
  @media print {
    body { background: white; }
    .page-wrap { max-width: 100%; padding: 16px; }
    .section { box-shadow: none; break-inside: avoid; }
    .visit-card { break-inside: avoid; }
    .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .tag   { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .md-table { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  @page { margin: 12mm; size: A4; }

  /* ── MARKDOWN RENDERED CONTENT ─── */
  .visit-md { color: var(--slate-700); }

  .visit-md .md-p {
    margin: 0 0 8px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--slate-700);
  }
  .visit-md .md-p:last-child { margin-bottom: 0; }

  .visit-md .md-h {
    font-size: 13px;
    font-weight: 700;
    color: var(--slate-900);
    margin: 10px 0 4px;
  }

  .visit-md .md-ul,
  .visit-md .md-ol {
    margin: 4px 0 8px;
    padding-left: 0;
    list-style: none;
  }

  .visit-md .md-ul li {
    font-size: 13px;
    color: var(--slate-700);
    line-height: 1.55;
    padding: 2px 0 2px 18px;
    position: relative;
  }
  .visit-md .md-ul li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 10px;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--green-700);
  }

  .visit-md .md-ol {
    counter-reset: md-ol;
  }
  .visit-md .md-ol li {
    font-size: 13px;
    color: var(--slate-700);
    line-height: 1.55;
    padding: 2px 0 2px 28px;
    position: relative;
    counter-increment: md-ol;
  }
  .visit-md .md-ol li::before {
    content: counter(md-ol);
    position: absolute;
    left: 0;
    top: 3px;
    width: 19px; height: 19px;
    border-radius: 50%;
    background: var(--green-100);
    color: var(--green-700);
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .visit-md .md-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--slate-300);
  }
  .visit-md .md-table th {
    background: var(--slate-100);
    color: var(--slate-900);
    font-weight: 700;
    padding: 7px 10px;
    text-align: left;
    border-bottom: 1px solid var(--slate-300);
    font-size: 11px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .visit-md .md-table td {
    padding: 7px 10px;
    color: var(--slate-700);
    border-bottom: 1px solid var(--slate-100);
    vertical-align: top;
  }
  .visit-md .md-table tr:last-child td { border-bottom: none; }
  .visit-md .md-table tr:nth-child(even) td { background: var(--slate-50); }
`;

function statusBadge(date: string | undefined, soonDays = 30): { cls: string; label: string } {
  if (!date) return { cls: 'badge-expired', label: 'Neznáme' };
  const now = new Date();
  const t = new Date(date);
  const diff = Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { cls: 'badge-expired', label: `Expirované` };
  if (diff <= soonDays) return { cls: 'badge-warning', label: `Vyprší ${formatDateShort(date)}` };
  return { cls: 'badge-valid', label: `Platné do ${formatDateShort(date)}` };
}

export default function VetCardPage() {
  const [profiles] = useLocalStorage<PetProfile[]>('granule-check-pet-profiles', []);
  const [vaccinations] = useLocalStorage<VaccinationRecord[]>('dog-health-vaccinations', []);
  const [dewormings] = useLocalStorage<DewormingRecord[]>('dog-health-dewormings', []);
  const [ectos] = useLocalStorage<EctoparasiteRecord[]>('dog-health-ectos', []);
  const [visits] = useLocalStorage<VetVisitRecord[]>('dog-health-visits', []);
  const [medications] = useLocalStorage<MedicationRecord[]>('dog-health-medications', []);
  const [dietEntries] = useLocalStorage<DietEntry[]>('dog-health-diet-entries', []);

  const [exportSections, setExportSections] =
    useState<ExportSectionsState>(DEFAULT_EXPORT_SECTIONS);

  const dog = profiles.find((p) => p.animalType === 'dog');
  const dogId = dog?.id;

  const data = useMemo(() => {
    if (!dogId) return null;

    const dogVaccines = vaccinations.filter((x) => x.dogId === dogId);
    const dogDeworm = dewormings.filter((x) => x.dogId === dogId);
    const dogEctos = ectos.filter((x) => x.dogId === dogId);
    const dogVisits = visits.filter((x) => x.dogId === dogId);
    const activeMeds = medications.filter(
      (x) => x.dogId === dogId && (x.longTerm || !x.endDate || x.endDate >= today())
    );
    const dogDiet = dietEntries.filter((x) => x.dogId === dogId);

    const rabies = dogVaccines
      .filter((x) => x.type === 'RABIES')
      .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0];
    const combined = dogVaccines
      .filter((x) => x.type === 'COMBINED')
      .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied))[0];
    const otherVax = dogVaccines
      .filter((x) => x.type === 'OTHER')
      .sort((a, b) => b.dateApplied.localeCompare(a.dateApplied));

    const lastDeworming = [...dogDeworm].sort((a, b) => b.dateGiven.localeCompare(a.dateGiven))[0];
    const lastEcto = [...dogEctos].sort((a, b) => b.dateGiven.localeCompare(a.dateGiven))[0];
    const latestDiet = [...dogDiet].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

    const significantVisits = dogVisits
      .filter((x) => x.diagnosis || x.findings || x.recommendations || x.aiExtractedText)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    const timeline: TimelineEvent[] = [
      ...dogVaccines.map((x) => ({
        id: `vac-${x.id}`,
        dogId,
        type: 'VACCINATION' as const,
        title: `Očkovanie: ${x.name}`,
        subtitle: `Platné do ${formatDateShort(x.validUntil)}`,
        date: x.dateApplied,
      })),
      ...dogDeworm.map((x) => ({
        id: `dew-${x.id}`,
        dogId,
        type: 'DEWORMING' as const,
        title: `Odčervenie: ${x.productName}`,
        subtitle: `Ďalší termín ${formatDateShort(x.nextDueDate)}`,
        date: x.dateGiven,
      })),
      ...dogEctos.map((x) => ({
        id: `ect-${x.id}`,
        dogId,
        type: 'ECTOPARASITE' as const,
        title: `Antiparazitikum: ${x.productName}`,
        subtitle: `Ďalší termín ${formatDateShort(x.nextDueDate)}`,
        date: x.dateGiven,
      })),
      ...dogVisits.map((x) => ({
        id: `vis-${x.id}`,
        dogId,
        type: 'VET_VISIT' as const,
        title: `Veterinár: ${x.clinicName}`,
        subtitle: x.reason,
        date: x.date,
      })),
      ...activeMeds.map((x) => ({
        id: `med-${x.id}`,
        dogId,
        type: 'MEDICATION' as const,
        title: `Liek: ${x.name}`,
        subtitle: `${x.dose} · ${x.frequency}`,
        date: x.startDate,
      })),
      ...dogDiet.map((x) => ({
        id: `diet-${x.id}`,
        dogId,
        type: 'DIET' as const,
        title: `Diéta: ${x.foodName}`,
        subtitle: x.suitabilityStatus,
        date: x.startedAt,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return {
      rabies,
      combined,
      otherVax,
      lastDeworming,
      lastEcto,
      latestDiet,
      activeMeds,
      significantVisits,
      timeline,
    };
  }, [dogId, vaccinations, dewormings, ectos, visits, medications, dietEntries]);

  const handlePrint = () => {
    if (!dog || !data) return;

    // ── Markdown → HTML for PDF ──────────────────────────────
    const mdToHtml = (raw: string): string => {
      if (!raw) return '';
      const normalized = raw.replace(/\\n/g, '\n');
      const lines = normalized.split('\n');

      const esc = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const inlineBold = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      const isTableRow = (l: string) => l.trim().startsWith('|') && l.trim().endsWith('|');
      const isSepRow = (l: string) => isTableRow(l) && /^\|[\s|:-]+\|$/.test(l.trim());
      const parseCells = (l: string) =>
        l
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());

      const out: string[] = [];
      let i = 0;

      while (i < lines.length) {
        const raw2 = lines[i];
        const t = raw2.trim();

        if (!t) {
          out.push('');
          i++;
          continue;
        }

        // Heading
        const hm = t.match(/^(#{1,6})\s+(.+)$/);
        if (hm) {
          const lvl = Math.min(hm[1].length + 2, 6);
          out.push(`<h${lvl} class="md-h">${inlineBold(hm[2])}</h${lvl}>`);
          i++;
          continue;
        }

        // Markdown table
        if (isTableRow(t)) {
          const tableLines: string[] = [];
          while (i < lines.length && isTableRow(lines[i].trim())) {
            tableLines.push(lines[i]);
            i++;
          }
          const dataRows = tableLines.filter((l) => !isSepRow(l));
          if (dataRows.length >= 1) {
            const [hdr, ...body] = dataRows;
            const cells = parseCells(hdr);
            out.push('<table class="md-table"><thead><tr>');
            cells.forEach((c) => out.push(`<th>${inlineBold(c)}</th>`));
            out.push('</tr></thead><tbody>');
            body.forEach((row) => {
              out.push('<tr>');
              parseCells(row).forEach((c) => out.push(`<td>${inlineBold(c)}</td>`));
              out.push('</tr>');
            });
            out.push('</tbody></table>');
          }
          continue;
        }

        // Unordered list
        if (t.match(/^[-*•]\s+/)) {
          out.push('<ul class="md-ul">');
          while (i < lines.length) {
            const lt = lines[i].trim();
            const lm = lt.match(/^[-*•]\s+(.+)$/);
            if (lm) {
              out.push(`<li>${inlineBold(lm[1])}</li>`);
              i++;
            } else if (!lt) {
              i++;
              break;
            } else break;
          }
          out.push('</ul>');
          continue;
        }

        // Ordered list — extract ONLY the text after "1. "
        if (t.match(/^\d+[.)]\s+/)) {
          out.push('<ol class="md-ol">');
          while (i < lines.length) {
            const lt = lines[i].trim();
            const lm = lt.match(/^\d+[.)]\s+(.+)$/);
            if (lm) {
              out.push(`<li>${inlineBold(lm[1])}</li>`);
              i++;
            } else if (!lt) {
              i++;
              break;
            } else break;
          }
          out.push('</ol>');
          continue;
        }

        // Paragraph
        const para: string[] = [];
        while (i < lines.length) {
          const lt = lines[i].trim();
          if (!lt) break;
          if (
            lt.match(/^#{1,6}\s/) ||
            isTableRow(lt) ||
            lt.match(/^[-*•]\s/) ||
            lt.match(/^\d+[.)]\s/)
          )
            break;
          para.push(lines[i]);
          i++;
        }
        if (para.length) out.push(`<p class="md-p">${inlineBold(para.join(' '))}</p>`);
      }

      return out.join('\n');
    };

    const age = dog.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(dog.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        )
      : dog.ageYears;

    const besnota = statusBadge(data.rabies?.validUntil);
    const kombinov = statusBadge(data.combined?.validUntil);
    const dew = statusBadge(data.lastDeworming?.nextDueDate, 7);
    const ecto = statusBadge(data.lastEcto?.nextDueDate, 7);

    const tagHtml = (items: string[], cls: string) =>
      items.map((x) => `<span class="tag ${cls}">${x}</span>`).join('');

    const vaccineRows = [
      data.rabies
        ? `<div class="vaccine-row"><div><div class="vaccine-name">Besnota (Rabies)</div><div class="vaccine-dates">Podaná ${formatDate(data.rabies.dateApplied)} · šarža ${data.rabies.batchNumber ?? '–'}</div></div><span class="badge ${besnota.cls}">${besnota.label}</span></div>`
        : '',
      data.combined
        ? `<div class="vaccine-row"><div><div class="vaccine-name">Kombinovaná vakcína</div><div class="vaccine-dates">Podaná ${formatDate(data.combined.dateApplied)} · šarža ${data.combined.batchNumber ?? '–'}</div></div><span class="badge ${kombinov.cls}">${kombinov.label}</span></div>`
        : '',
      ...(data.otherVax ?? []).map((v) => {
        const s = statusBadge(v.validUntil);
        return `<div class="vaccine-row"><div><div class="vaccine-name">${v.name}</div><div class="vaccine-dates">Podaná ${formatDate(v.dateApplied)}</div></div><span class="badge ${s.cls}">${s.label}</span></div>`;
      }),
      data.lastDeworming
        ? `<div class="vaccine-row"><div><div class="vaccine-name">Odčervenie: ${data.lastDeworming.productName}</div><div class="vaccine-dates">Podané ${formatDate(data.lastDeworming.dateGiven)}</div></div><span class="badge ${dew.cls}">${dew.label}</span></div>`
        : '',
      data.lastEcto
        ? `<div class="vaccine-row"><div><div class="vaccine-name">Antiparazitikum: ${data.lastEcto.productName}</div><div class="vaccine-dates">Podané ${formatDate(data.lastEcto.dateGiven)}</div></div><span class="badge ${ecto.cls}">${ecto.label}</span></div>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    const medRows = data.activeMeds.length
      ? data.activeMeds
          .map(
            (m) => `
        <div class="med-row">
          <div class="med-dot"></div>
          <div>
            <div class="med-name">${m.name}</div>
            <div class="med-detail">${m.dose} · ${m.frequency}${m.reason ? ` · Dôvod: ${m.reason}` : ''}</div>
          </div>
        </div>`
          )
          .join('')
      : '<div style="color:#64748b;font-size:14px;padding:4px 0;">Bez aktívnych liekov</div>';

    const visitCards = data.significantVisits.length
      ? data.significantVisits
          .map(
            (v) => `
        <div class="visit-card">
          <div class="visit-header">
            <span class="visit-date">${formatDate(v.date)}</span>
            <span class="visit-clinic">${v.clinicName ?? 'Bez kliniky'}${v.aiExamType ? ` · ${v.aiExamType}` : ''}</span>
          </div>
          <div class="visit-reason">${v.reason ?? ''}</div>
          ${v.diagnosis ? `<div class="visit-section-label">Diagnóza</div><div class="visit-md">${mdToHtml(v.diagnosis)}</div>` : ''}
          ${v.findings ? `<div class="visit-section-label">Nález</div><div class="visit-md">${mdToHtml(v.findings)}</div>` : ''}
          ${v.recommendations ? `<div class="visit-section-label">Odporúčania</div><div class="visit-md">${mdToHtml(v.recommendations)}</div>` : ''}
        </div>`
          )
          .join('')
      : '<div style="color:#64748b;font-size:14px;">Bez záznamov</div>';

    const timelineItems = data.timeline
      .map(
        (item) =>
          `<div class="timeline-item">
        <div class="tl-date">${formatDateShort(item.date)}</div>
        <div class="tl-dot" style="background:${TIMELINE_TYPE_META[item.type].hex}"></div>
        <div class="tl-content">
          <div class="tl-title">${item.title}</div>
          ${item.subtitle ? `<div class="tl-sub">${item.subtitle}</div>` : ''}
        </div>
      </div>`
      )
      .join('');

    const sections = exportSections;
    const allergyCount = dog.allergies.length;
    const chronicCount = dog.chronicConditions?.length ?? dog.healthConditions.length;
    const heroBadges = sections.identity
      ? [
          allergyCount
            ? `<span class="badge badge-neutral">⚠ ${allergyCount} ${allergyCount === 1 ? 'alergia' : 'alergií'}</span>`
            : '',
          chronicCount
            ? `<span class="badge badge-neutral">🩺 ${chronicCount} chronických diagnóz</span>`
            : '',
          data.activeMeds.length
            ? `<span class="badge badge-neutral">💊 ${data.activeMeds.length} aktívnych liekov</span>`
            : '',
        ]
          .filter(Boolean)
          .join('')
      : '';

    const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Karta pre veterinára – ${dog.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${PRINT_STYLES}</style>
</head>
<body>
<div class="page-wrap">

  <!-- HEADER -->
  <div class="header">
    <div class="avatar">🐾</div>
    <div class="header-info">
      <h1 class="dog-name">${dog.name}</h1>
      <div class="dog-meta">
        ${dog.breed ? `<span>🐕 ${dog.breed}</span>` : ''}
        ${age != null ? `<span>🎂 ${age} rokov</span>` : ''}
        ${dog.weightKg != null ? `<span>⚖️ ${dog.weightKg} kg</span>` : ''}
        ${dog.sex && dog.sex !== 'UNKNOWN' ? `<span>${dog.sex === 'MALE' ? '♂' : '♀'} ${dog.sex === 'MALE' ? 'Samec' : 'Samica'}</span>` : ''}
        ${dog.microchipNumber ? `<span>📟 Čip: ${dog.microchipNumber}</span>` : ''}
        ${dog.passportNumber ? `<span>📘 Pas: ${dog.passportNumber}</span>` : ''}
      </div>
      ${heroBadges ? `<div class="header-badges">${heroBadges}</div>` : ''}
      <div class="generated-at">Vygenerované: ${new Date().toLocaleString('sk-SK')} · GranuleCheck</div>
    </div>
  </div>

  ${
    sections.conditions
      ? `
  <!-- IDENTITA + DIAGNÓZY -->
  <div class="section">
    <div class="section-head">
      <div class="section-icon icon-blue">🪪</div>
      <h2 class="section-title">Zdravotný profil</h2>
    </div>
    <div class="section-body">
      ${
        dog.chronicConditions?.length || dog.healthConditions.length
          ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Chronické diagnózy</div>
          <div class="tag-wrap">
            ${tagHtml(dog.chronicConditions?.map((c) => c.title) ?? dog.healthConditions, 'tag-blue')}
          </div>
        </div>`
          : ''
      }

      ${
        dog.allergies.length
          ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">⚠️ Alergie</div>
          <div class="tag-wrap">${tagHtml(dog.allergies, 'tag-red')}</div>
        </div>`
          : ''
      }

      ${
        dog.intolerances.length
          ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Intolerancie</div>
          <div class="tag-wrap">${tagHtml(dog.intolerances, 'tag-amber')}</div>
        </div>`
          : ''
      }

      ${
        dog.procedures?.length
          ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Výkony / operácie</div>
          <div class="tag-wrap">${tagHtml(
            dog.procedures.map((p) => `${p.title}${p.date ? ` (${p.date})` : ''}`),
            'tag-slate'
          )}</div>
        </div>`
          : ''
      }

      ${
        dog.notes
          ? `
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">Poznámky majiteľa</div>
          <div style="font-size:13px;color:#334155;line-height:1.55;">${dog.notes}</div>
        </div>`
          : ''
      }
    </div>
  </div>`
      : ''
  }

  ${
    sections.medications
      ? `
  <!-- LIEKY -->
  <div class="section">
    <div class="section-head">
      <div class="section-icon icon-green">💊</div>
      <h2 class="section-title">Aktívne lieky a doplnky</h2>
    </div>
    <div class="section-body">${medRows}</div>
  </div>`
      : ''
  }

  ${
    sections.prevention
      ? `
  <!-- PREVENTÍVNA STAROSTLIVOSŤ -->
  <div class="section">
    <div class="section-head">
      <div class="section-icon icon-green">💉</div>
      <h2 class="section-title">Preventívna starostlivosť</h2>
    </div>
    <div class="section-body">
      ${vaccineRows || '<div style="color:#64748b;font-size:14px;">Žiadne záznamy</div>'}
    </div>
  </div>`
      : ''
  }

  ${
    sections.visits && data.significantVisits.length
      ? `
  <!-- NÁVŠTEVY VETERINÁRA -->
  <div class="section">
    <div class="section-head">
      <div class="section-icon icon-blue">🏥</div>
      <h2 class="section-title">Posledné klinické záznamy</h2>
    </div>
    <div class="section-body">${visitCards}</div>
  </div>`
      : ''
  }

  ${
    sections.history && data.timeline.length
      ? `
  <!-- TIMELINE -->
  <div class="section">
    <div class="section-head">
      <div class="section-icon icon-slate">📅</div>
      <h2 class="section-title">Klinická história (${data.timeline.length})</h2>
    </div>
    <div class="section-body">${timelineItems}</div>
  </div>`
      : ''
  }

  <div class="footer">
    GranuleCheck · Karta vygenerovaná pre potreby veterinára · ${new Date().toLocaleDateString('sk-SK')}
  </div>

</div>
</body>
</html>`;

    // ── Hidden iframe print — no popup blocker, no blob download ──
    // The iframe is injected into the current page, fonts load inside it,
    // then we call print() on its contentWindow. After the dialog closes
    // the iframe is removed automatically.
    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Wait for fonts and layout to complete, then print
    const iframeWin = iframe.contentWindow!;
    iframeWin.addEventListener('load', () => {
      setTimeout(() => {
        iframeWin.focus();
        iframeWin.print();
        // Clean up the iframe after the print dialog is dismissed
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 2000);
      }, 700);
    });
  };

  if (!dog || !data) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Žiadny profil psa
        </Typography>
        <Typography color="text.secondary">
          Najprv vytvorte profil psa a pridajte zdravotné záznamy.
        </Typography>
      </Box>
    );
  }

  const age = dog.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(dog.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : dog.ageYears;

  const besnota = statusBadge(data.rabies?.validUntil);
  const kombinov = statusBadge(data.combined?.validUntil);
  const dew = statusBadge(data.lastDeworming?.nextDueDate, 7);
  const ecto = statusBadge(data.lastEcto?.nextDueDate, 7);

  // rgba-based — work in both light and dark mode
  const sxBadge = (cls: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    px: 1.25,
    py: 0.5,
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    ...(cls === 'badge-valid'
      ? { bgcolor: 'rgba(34,197,94,0.12)', color: 'success.main' }
      : cls === 'badge-warning'
        ? { bgcolor: 'rgba(245,158,11,0.14)', color: 'warning.main' }
        : cls === 'badge-expired'
          ? { bgcolor: 'rgba(220,38,38,0.12)', color: 'error.main' }
          : { bgcolor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.9)' }),
  });

  return (
    <Box>
      {/* ── ACTION BAR ── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Karta pre veterinára
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Klinický prehľad pre veterinárnu prax
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
          disabled={!Object.values(exportSections).some(Boolean)}
        >
          Export PDF
        </Button>
      </Stack>

      <Box sx={{ mb: 2.5 }}>
        <ExportSectionsToolbar value={exportSections} onChange={setExportSections} />
      </Box>

      {/* ── HERO HEADER ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #14532d 0%, #1a4731 60%, #0f3422 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 2,
          color: 'white',
          display: 'flex',
          gap: 3,
          alignItems: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            flexShrink: 0,
          }}
        >
          🐾
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, lineHeight: 1, mb: 0.5 }}
          >
            {dog.name}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            {[
              dog.breed,
              age != null && `${age} r.`,
              dog.weightKg && `${dog.weightKg} kg`,
              dog.microchipNumber && `Čip: ${dog.microchipNumber}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {dog.allergies.length > 0 && (
              <Box
                sx={{
                  ...sxBadge('badge-neutral'),
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                ⚠ {dog.allergies.length} {dog.allergies.length === 1 ? 'alergia' : 'alergií'}
              </Box>
            )}
            {(dog.chronicConditions?.length ?? dog.healthConditions.length) > 0 && (
              <Box
                sx={{
                  ...sxBadge('badge-neutral'),
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                🩺 {dog.chronicConditions?.length ?? dog.healthConditions.length} chronických
                diagnóz
              </Box>
            )}
            {data.activeMeds.length > 0 && (
              <Box
                sx={{
                  ...sxBadge('badge-neutral'),
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                💊 {data.activeMeds.length} aktívnych liekov
              </Box>
            )}
          </Stack>
        </Box>
      </Box>

      {/* ── PREVENTÍVNA STAROSTLIVOSŤ QUICK STATUS ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        {[
          { label: 'Besnota', s: besnota, date: data.rabies?.validUntil },
          { label: 'Kombinovaná', s: kombinov, date: data.combined?.validUntil },
          { label: 'Odčervenie', s: dew, date: data.lastDeworming?.nextDueDate },
          { label: 'Antiparazitikum', s: ecto, date: data.lastEcto?.nextDueDate },
        ].map(({ label, s }) => (
          <Box
            key={label}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              p: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              {label}
            </Typography>
            <Box sx={{ ...sxBadge(s.cls), fontSize: 11 }}>{s.label}</Box>
          </Box>
        ))}
      </Box>

      {/* ── ZDRAVOTNÝ PROFIL ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          mb: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: 'rgba(37,99,235,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🪪
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Zdravotný profil
          </Typography>
        </Stack>

        {dog.chronicConditions?.length || dog.healthConditions.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Chronické diagnózy
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {(dog.chronicConditions?.map((c) => c.title) ?? dog.healthConditions).map((t) => (
                <Box
                  key={t}
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(37,99,235,0.1)',
                    color: 'primary.main',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {t}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        {dog.allergies.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              ⚠️ Alergie
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {dog.allergies.map((a) => (
                <Box
                  key={a}
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(220,38,38,0.1)',
                    color: 'error.main',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {a}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        {dog.intolerances.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.75,
              }}
            >
              Intolerancie
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {dog.intolerances.map((a) => (
                <Box
                  key={a}
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'rgba(245,158,11,0.12)',
                    color: 'warning.main',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {a}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        {dog.notes && (
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
                mb: 0.5,
              }}
            >
              Poznámky
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dog.notes}
            </Typography>
          </Box>
        )}

        {!dog.chronicConditions?.length &&
          !dog.healthConditions.length &&
          !dog.allergies.length &&
          !dog.notes && (
            <Typography variant="body2" color="text.secondary">
              Žiadne špeciálne zdravotné záznamy.
            </Typography>
          )}
      </Box>

      {/* ── AKTÍVNE LIEKY ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          mb: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: 'rgba(34,197,94,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            💊
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Aktívne lieky a doplnky
          </Typography>
        </Stack>
        {data.activeMeds.length ? (
          data.activeMeds.map((m, i) => (
            <Box
              key={m.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
                py: 1.25,
                borderBottom: i < data.activeMeds.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  mt: '6px',
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{m.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.dose} · {m.frequency}
                  {m.reason ? ` · ${m.reason}` : ''}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Bez aktívnych liekov
          </Typography>
        )}
      </Box>

      {/* ── PREVENTÍVA ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          mb: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: 'rgba(34,197,94,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            💉
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Preventívna starostlivosť
          </Typography>
        </Stack>
        {[
          data.rabies && {
            name: 'Besnota (Rabies)',
            date: data.rabies.dateApplied,
            valid: data.rabies.validUntil,
            batch: data.rabies.batchNumber,
            s: besnota,
          },
          data.combined && {
            name: 'Kombinovaná vakcína',
            date: data.combined.dateApplied,
            valid: data.combined.validUntil,
            batch: data.combined.batchNumber,
            s: kombinov,
          },
          data.lastDeworming && {
            name: `Odčervenie: ${data.lastDeworming.productName}`,
            date: data.lastDeworming.dateGiven,
            valid: data.lastDeworming.nextDueDate,
            batch: undefined,
            s: dew,
          },
          data.lastEcto && {
            name: `Antiparazitikum: ${data.lastEcto.productName}`,
            date: data.lastEcto.dateGiven,
            valid: data.lastEcto.nextDueDate,
            batch: undefined,
            s: ecto,
          },
        ]
          .filter(Boolean)
          .map(
            (item, i, arr) =>
              item && (
                <Box
                  key={item.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    borderBottom: i < arr.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Podané {formatDateShort(item.date)}
                      {item.batch ? ` · šarža ${item.batch}` : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ ...sxBadge(item.s.cls) }}>{item.s.label}</Box>
                </Box>
              )
          )}
        {!data.rabies && !data.combined && !data.lastDeworming && !data.lastEcto && (
          <Typography variant="body2" color="text.secondary">
            Žiadne záznamy o očkovaniach
          </Typography>
        )}
      </Box>

      {/* ── KLINICKÉ ZÁZNAMY ── */}
      {data.significantVisits.length > 0 && (
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 3,
            mb: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: 'rgba(37,99,235,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              🏥
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              Posledné klinické záznamy
            </Typography>
          </Stack>
          <Stack gap={1.5}>
            {data.significantVisits.map((v) => (
              <Box
                key={v.id}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 2.5,
                  p: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '999px',
                      bgcolor: 'rgba(34,197,94,0.14)',
                      color: 'success.main',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(v.date)}
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '999px',
                      bgcolor: 'action.selected',
                      color: 'text.primary',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    {v.clinicName}
                  </Box>
                  {v.aiExamType && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '999px',
                        bgcolor: 'rgba(37,99,235,0.1)',
                        color: 'primary.main',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {v.aiExamType}
                    </Box>
                  )}
                </Stack>
                <Typography sx={{ fontWeight: 600, fontSize: 13, mb: 1.5, color: 'text.primary' }}>
                  {v.reason}
                </Typography>
                {v.diagnosis && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: 0.75,
                      }}
                    >
                      Diagnóza
                    </Typography>
                    <AiFormattedText text={v.diagnosis} />
                  </Box>
                )}
                {v.findings && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: 0.75,
                      }}
                    >
                      Nález
                    </Typography>
                    <AiFormattedText text={v.findings} />
                  </Box>
                )}
                {v.recommendations && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        mb: 0.75,
                      }}
                    >
                      Odporúčania
                    </Typography>
                    <AiFormattedText text={v.recommendations} />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* ── KLINICKÁ HISTÓRIA ── */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: 3,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <ClinicalHistory timeline={data.timeline} />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
        GranuleCheck · Karta vygenerovaná {new Date().toLocaleDateString('sk-SK')}
      </Typography>
    </Box>
  );
}
