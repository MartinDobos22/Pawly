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
  @page { size: A4; margin: 14mm; }

  * { box-sizing: border-box; }

  :root {
    --ink: #1a1a1a;
    --ink-2: #4a4a4a;
    --ink-3: #7a7a7a;
    --rule: #d0d0d0;
    --rule-soft: #ececec;
    --bg-row: #fafafa;
    --accent: #15402a;
    --valid: #15803d;
    --warning: #b45309;
    --expired: #b91c1c;
  }

  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--ink);
    background: #fff;
    margin: 0;
    padding: 0;
    font-size: 12px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .doc {
    max-width: 720px;
    margin: 0 auto;
  }

  /* ── HEADER ─────────────────────────────── */
  .doc-head {
    border-bottom: 2px solid var(--ink);
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .head-strip {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
    margin-bottom: 14px;
  }

  .head-strip .label {
    color: var(--accent);
  }

  .dog-name {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .dog-meta {
    font-size: 12px;
    color: var(--ink-2);
    margin-bottom: 8px;
  }

  .head-badges {
    font-size: 11px;
    color: var(--ink-2);
  }

  .head-badges .b-sep { color: var(--rule); margin: 0 6px; }
  .head-badges .b-allergies { color: var(--expired); font-weight: 600; }
  .head-badges .b-chronic { color: var(--accent); font-weight: 600; }
  .head-badges .b-meds { color: var(--warning); font-weight: 600; }

  /* ── BLOCK ─────────────────────────────── */
  .block {
    margin-bottom: 18px;
    page-break-inside: avoid;
  }

  .block-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--rule);
  }

  .sub-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
    margin: 8px 0 4px;
  }

  .sub-label.warn { color: var(--expired); }

  .tags {
    font-size: 12px;
    color: var(--ink);
    line-height: 1.7;
  }

  .tag {
    display: inline-block;
    border: 1px solid var(--rule);
    padding: 1px 8px;
    border-radius: 3px;
    margin: 0 4px 4px 0;
    font-size: 11px;
    color: var(--ink);
  }

  .tag.tag-red { border-color: var(--expired); color: var(--expired); }
  .tag.tag-amber { border-color: var(--warning); color: var(--warning); }
  .tag.tag-blue { border-color: var(--accent); color: var(--accent); }
  .tag.tag-slate { border-color: var(--rule); color: var(--ink-2); }

  .notes {
    font-size: 12px;
    color: var(--ink-2);
    line-height: 1.55;
  }

  /* ── DATA TABLE ─────────────────────────── */
  .data {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }

  .data thead th {
    text-align: left;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-3);
    border-bottom: 1px solid var(--rule);
    padding: 6px 8px;
  }

  .data tbody tr { page-break-inside: avoid; }

  .data tbody td {
    padding: 6px 8px;
    border-bottom: 1px solid var(--rule-soft);
    color: var(--ink);
    vertical-align: top;
  }

  .data tbody tr:nth-child(even) td { background: var(--bg-row); }
  .data tbody tr:last-child td { border-bottom: none; }

  .data td.muted { color: var(--ink-3); }
  .data td.bold { font-weight: 600; }
  .data td.nowrap { white-space: nowrap; }

  .empty {
    font-size: 11px;
    color: var(--ink-3);
    font-style: italic;
    padding: 4px 0;
  }

  /* ── VISIT BLOCKS ────────────────────────── */
  .visit {
    border: 1px solid var(--rule);
    border-left: 3px solid var(--accent);
    padding: 10px 12px;
    margin-bottom: 10px;
    page-break-inside: avoid;
    background: #fff;
  }

  .visit-head {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-3);
    margin-bottom: 4px;
  }

  .visit-date { font-weight: 700; color: var(--ink); }
  .visit-clinic { font-weight: 500; }

  .visit-reason {
    font-size: 12px;
    color: var(--ink);
    font-weight: 600;
    margin-bottom: 8px;
  }

  .visit-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
    margin: 8px 0 2px;
  }

  .visit-md {
    font-size: 12px;
    color: var(--ink-2);
    line-height: 1.55;
  }

  /* ── MARKDOWN inside visits ───────────────── */
  .visit-md p.md-p {
    margin: 0 0 6px;
    font-size: 12px;
    color: var(--ink-2);
  }

  .visit-md .md-h {
    font-size: 12px;
    font-weight: 700;
    color: var(--ink);
    margin: 8px 0 4px;
  }

  .visit-md ul.md-ul, .visit-md ol.md-ol {
    margin: 4px 0;
    padding-left: 18px;
  }

  .visit-md ul.md-ul li, .visit-md ol.md-ol li {
    font-size: 12px;
    color: var(--ink-2);
    line-height: 1.5;
    margin-bottom: 2px;
  }

  .visit-md table.md-table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 11px;
    border: 1px solid var(--rule);
  }

  .visit-md table.md-table th {
    background: var(--bg-row);
    color: var(--ink);
    font-weight: 600;
    padding: 5px 8px;
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    border-bottom: 1px solid var(--rule);
  }

  .visit-md table.md-table td {
    padding: 5px 8px;
    color: var(--ink-2);
    border-bottom: 1px solid var(--rule-soft);
  }

  .visit-md table.md-table tr:last-child td { border-bottom: none; }
  .visit-md strong { color: var(--ink); font-weight: 600; }

  /* ── FOOTER ─────────────────────────────── */
  .doc-foot {
    margin-top: 24px;
    padding-top: 8px;
    border-top: 1px solid var(--rule);
    font-size: 10px;
    color: var(--ink-3);
    text-align: right;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
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

    const statusColorVar = (cls: string) =>
      cls === 'badge-valid'
        ? 'var(--valid)'
        : cls === 'badge-warning'
          ? 'var(--warning)'
          : 'var(--expired)';

    const vaccineRow = (
      type: string,
      name: string,
      batch: string | undefined,
      applied: string | undefined,
      until: string | undefined,
      s: { cls: string; label: string }
    ) =>
      `<tr>
        <td class="muted nowrap">${type}</td>
        <td>
          <div class="bold">${name}</div>
          ${batch ? `<div class="muted" style="font-size:10px">šarža ${batch}</div>` : ''}
        </td>
        <td class="muted nowrap">${applied ? formatDateShort(applied) : '–'}</td>
        <td class="muted nowrap">${until ? formatDateShort(until) : '–'}</td>
        <td class="nowrap bold" style="color:${statusColorVar(s.cls)}">${s.label}</td>
      </tr>`;

    const vaccineRows = [
      data.rabies
        ? vaccineRow(
            'Besnota',
            'Rabies',
            data.rabies.batchNumber,
            data.rabies.dateApplied,
            data.rabies.validUntil,
            besnota
          )
        : '',
      data.combined
        ? vaccineRow(
            'Kombinovaná',
            'Kombinovaná vakcína',
            data.combined.batchNumber,
            data.combined.dateApplied,
            data.combined.validUntil,
            kombinov
          )
        : '',
      ...(data.otherVax ?? []).map((v) =>
        vaccineRow(
          'Vakcína',
          v.name,
          v.batchNumber,
          v.dateApplied,
          v.validUntil,
          statusBadge(v.validUntil)
        )
      ),
      data.lastDeworming
        ? vaccineRow(
            'Odčervenie',
            data.lastDeworming.productName,
            undefined,
            data.lastDeworming.dateGiven,
            data.lastDeworming.nextDueDate,
            dew
          )
        : '',
      data.lastEcto
        ? vaccineRow(
            'Antiparazitikum',
            data.lastEcto.productName,
            undefined,
            data.lastEcto.dateGiven,
            data.lastEcto.nextDueDate,
            ecto
          )
        : '',
    ]
      .filter(Boolean)
      .join('');

    const medRows = data.activeMeds
      .map(
        (m) => `<tr>
          <td class="bold">${m.name}</td>
          <td class="muted nowrap">${m.dose || '–'}</td>
          <td class="muted nowrap">${m.frequency || '–'}</td>
          <td class="muted">${m.reason || '–'}</td>
        </tr>`
      )
      .join('');

    const visitCards = data.significantVisits
      .map(
        (v) => `
        <div class="visit">
          <div class="visit-head">
            <span class="visit-date">${formatDate(v.date)}</span>
            <span class="visit-clinic">${v.clinicName ?? 'Bez kliniky'}${v.aiExamType ? ` · ${v.aiExamType}` : ''}</span>
          </div>
          <div class="visit-reason">${v.reason ?? ''}</div>
          ${v.diagnosis ? `<div class="visit-section-label">Diagnóza</div><div class="visit-md">${mdToHtml(v.diagnosis)}</div>` : ''}
          ${v.findings ? `<div class="visit-section-label">Nález</div><div class="visit-md">${mdToHtml(v.findings)}</div>` : ''}
          ${v.recommendations ? `<div class="visit-section-label">Odporúčania</div><div class="visit-md">${mdToHtml(v.recommendations)}</div>` : ''}
        </div>`
      )
      .join('');

    const timelineItems = data.timeline
      .map(
        (item) => `<tr>
          <td class="muted nowrap" style="width:90px">${formatDateShort(item.date)}</td>
          <td class="bold nowrap" style="width:130px">${TIMELINE_TYPE_META[item.type].label}</td>
          <td>
            ${item.title}
            ${item.subtitle ? `<div class="muted" style="font-size:10px">${item.subtitle}</div>` : ''}
          </td>
        </tr>`
      )
      .join('');

    const sections = exportSections;
    const allergyCount = dog.allergies.length;
    const chronicCount = dog.chronicConditions?.length ?? dog.healthConditions.length;
    const heroBadges = sections.identity
      ? [
          allergyCount
            ? `<span class="b-allergies">${allergyCount} ${allergyCount === 1 ? 'alergia' : allergyCount < 5 ? 'alergie' : 'alergií'}</span>`
            : '',
          chronicCount
            ? `<span class="b-chronic">${chronicCount} ${chronicCount === 1 ? 'chronická diagnóza' : chronicCount < 5 ? 'chronické diagnózy' : 'chronických diagnóz'}</span>`
            : '',
          data.activeMeds.length
            ? `<span class="b-meds">${data.activeMeds.length} ${data.activeMeds.length === 1 ? 'aktívny liek' : data.activeMeds.length < 5 ? 'aktívne lieky' : 'aktívnych liekov'}</span>`
            : '',
        ]
          .filter(Boolean)
          .join('<span class="b-sep">·</span>')
      : '';

    const metaParts = [
      dog.breed,
      age != null ? `${age} r.` : '',
      dog.weightKg != null ? `${dog.weightKg} kg` : '',
      dog.sex && dog.sex !== 'UNKNOWN' ? (dog.sex === 'MALE' ? 'Samec' : 'Samica') : '',
      dog.microchipNumber ? `Čip: ${dog.microchipNumber}` : '',
      dog.passportNumber ? `Pas: ${dog.passportNumber}` : '',
    ].filter(Boolean);

    const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Klinická karta – ${dog.name}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
<div class="doc">

  <header class="doc-head">
    <div class="head-strip">
      <span class="label">Klinická karta zvieraťa</span>
      <span>${new Date().toLocaleDateString('sk-SK')}</span>
    </div>
    <h1 class="dog-name">${dog.name}</h1>
    ${
      sections.identity
        ? `
    <div class="dog-meta">${metaParts.join(' · ') || '–'}</div>
    ${heroBadges ? `<div class="head-badges">${heroBadges}</div>` : ''}`
        : ''
    }
  </header>

  ${
    sections.conditions
      ? `
  <section class="block">
    <h2 class="block-title">Zdravotný profil</h2>
    ${
      dog.chronicConditions?.length || dog.healthConditions.length
        ? `
    <div class="sub-label">Chronické diagnózy</div>
    <div class="tags">${tagHtml(dog.chronicConditions?.map((c) => c.title) ?? dog.healthConditions, 'tag-blue')}</div>`
        : ''
    }
    ${
      dog.allergies.length
        ? `
    <div class="sub-label warn">Alergie</div>
    <div class="tags">${tagHtml(dog.allergies, 'tag-red')}</div>`
        : ''
    }
    ${
      dog.intolerances.length
        ? `
    <div class="sub-label">Intolerancie</div>
    <div class="tags">${tagHtml(dog.intolerances, 'tag-amber')}</div>`
        : ''
    }
    ${
      dog.procedures?.length
        ? `
    <div class="sub-label">Výkony / operácie</div>
    <div class="tags">${tagHtml(
      dog.procedures.map((p) => `${p.title}${p.date ? ` (${p.date})` : ''}`),
      'tag-slate'
    )}</div>`
        : ''
    }
    ${
      dog.notes
        ? `
    <div class="sub-label">Poznámky majiteľa</div>
    <div class="notes">${dog.notes}</div>`
        : ''
    }
    ${
      !(
        dog.chronicConditions?.length ||
        dog.healthConditions.length ||
        dog.allergies.length ||
        dog.intolerances.length ||
        dog.procedures?.length ||
        dog.notes
      )
        ? '<div class="empty">Žiadne klinické záznamy v profile</div>'
        : ''
    }
  </section>`
      : ''
  }

  ${
    sections.medications
      ? `
  <section class="block">
    <h2 class="block-title">Aktívne lieky a doplnky</h2>
    ${
      data.activeMeds.length
        ? `
    <table class="data">
      <thead>
        <tr>
          <th>Názov</th>
          <th>Dávkovanie</th>
          <th>Frekvencia</th>
          <th>Dôvod</th>
        </tr>
      </thead>
      <tbody>${medRows}</tbody>
    </table>`
        : '<div class="empty">Bez aktívnych liekov</div>'
    }
  </section>`
      : ''
  }

  ${
    sections.prevention
      ? `
  <section class="block">
    <h2 class="block-title">Preventívna starostlivosť</h2>
    ${
      vaccineRows
        ? `
    <table class="data">
      <thead>
        <tr>
          <th>Typ</th>
          <th>Názov</th>
          <th>Podané</th>
          <th>Platné do</th>
          <th>Stav</th>
        </tr>
      </thead>
      <tbody>${vaccineRows}</tbody>
    </table>`
        : '<div class="empty">Žiadne záznamy</div>'
    }
  </section>`
      : ''
  }

  ${
    sections.visits && data.significantVisits.length
      ? `
  <section class="block">
    <h2 class="block-title">Posledné klinické záznamy</h2>
    ${visitCards}
  </section>`
      : ''
  }

  ${
    sections.history && data.timeline.length
      ? `
  <section class="block">
    <h2 class="block-title">Klinická história (${data.timeline.length})</h2>
    <table class="data">
      <thead>
        <tr>
          <th>Dátum</th>
          <th>Typ</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>${timelineItems}</tbody>
    </table>
  </section>`
      : ''
  }

  <footer class="doc-foot">
    GranuleCheck · Karta vygenerovaná ${new Date().toLocaleDateString('sk-SK')}
  </footer>

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
