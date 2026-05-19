import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { PetProfile } from '../types';
import ClinicalHistory from '../components/vetCard/ClinicalHistory';
import ExportSectionsToolbar, {
  DEFAULT_EXPORT_SECTIONS,
  type ExportSectionsState,
} from '../components/vetCard/ExportSectionsToolbar';
import VetCardHeader from '../components/vetCard/VetCardHeader';
import VetCardStatusOverview from '../components/vetCard/VetCardStatusOverview';
import HealthProfileCard from '../components/vetCard/HealthProfileCard';
import ActiveMedicationsCard from '../components/vetCard/ActiveMedicationsCard';
import PreventiveCareCard, { type PreventiveItem } from '../components/vetCard/PreventiveCareCard';
import RecentVisitsCard from '../components/vetCard/RecentVisitsCard';
import { vetStatusFor } from '../components/vetCard/vetCardStatusUtils';
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
  if (!date) return { cls: 'badge-unknown', label: 'Nezadané' };
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

  const dogProfiles = useMemo(() => profiles.filter((p) => p.animalType === 'dog'), [profiles]);
  const [selectedDogId, setSelectedDogId] = useState<string>(dogProfiles[0]?.id ?? '');

  const dog = dogProfiles.find((p) => p.id === selectedDogId) ?? dogProfiles[0];
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
          : cls === 'badge-unknown'
            ? 'var(--ink-3)'
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

  const rabiesStatus = vetStatusFor(data.rabies?.validUntil);
  const combinedStatus = vetStatusFor(data.combined?.validUntil);
  const dewormingStatus = vetStatusFor(data.lastDeworming?.nextDueDate, 7);
  const ectoStatus = vetStatusFor(data.lastEcto?.nextDueDate, 7);

  const preventiveItems: PreventiveItem[] = [];
  if (data.rabies)
    preventiveItems.push({
      name: 'Besnota (Rabies)',
      dateGiven: data.rabies.dateApplied,
      validUntil: data.rabies.validUntil,
      batch: data.rabies.batchNumber,
      status: rabiesStatus.status,
      statusLabel: rabiesStatus.detail,
    });
  if (data.combined)
    preventiveItems.push({
      name: 'Kombinovaná vakcína',
      dateGiven: data.combined.dateApplied,
      validUntil: data.combined.validUntil,
      batch: data.combined.batchNumber,
      status: combinedStatus.status,
      statusLabel: combinedStatus.detail,
    });
  if (data.lastDeworming)
    preventiveItems.push({
      name: `Odčervenie: ${data.lastDeworming.productName}`,
      dateGiven: data.lastDeworming.dateGiven,
      validUntil: data.lastDeworming.nextDueDate,
      status: dewormingStatus.status,
      statusLabel: dewormingStatus.detail,
    });
  if (data.lastEcto)
    preventiveItems.push({
      name: `Antiparazitikum: ${data.lastEcto.productName}`,
      dateGiven: data.lastEcto.dateGiven,
      validUntil: data.lastEcto.nextDueDate,
      status: ectoStatus.status,
      statusLabel: ectoStatus.detail,
    });

  return (
    <Stack spacing={1.5}>
      <VetCardHeader
        dog={dog}
        dogProfiles={dogProfiles}
        selectedDogId={selectedDogId}
        onSelectDog={setSelectedDogId}
      />

      <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={1.5}
        >
          <ExportSectionsToolbar value={exportSections} onChange={setExportSections} />
          <Button
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            disabled={!Object.values(exportSections).some(Boolean)}
          >
            Export PDF
          </Button>
        </Stack>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 1.5,
        }}
      >
        <Stack spacing={1.5}>
          <VetCardStatusOverview
            rabies={rabiesStatus}
            combined={combinedStatus}
            deworming={dewormingStatus}
            ecto={ectoStatus}
          />
          <PreventiveCareCard items={preventiveItems} />
          <RecentVisitsCard visits={data.significantVisits} />
          <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
            <ClinicalHistory timeline={data.timeline} />
          </Card>
        </Stack>
        <Stack spacing={1.5}>
          <HealthProfileCard dog={dog} />
          <ActiveMedicationsCard medications={data.activeMeds} />
        </Stack>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', display: 'block', py: 2 }}
      >
        GranuleCheck · Karta vygenerovaná {new Date().toLocaleDateString('sk-SK')}
      </Typography>
    </Stack>
  );
}
