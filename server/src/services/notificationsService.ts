import { getSupabase } from '../config/supabase';
import { getUserPetIds } from './petOwnership';
import { isEmailEnabled, sendEmail } from '../config/email';
import { daysUntil, dueStatus, type DueStatus } from '../utils/dueDates';
import { logger } from '../utils/logger';

type Row = Record<string, unknown>;

export type NotificationRecordType =
  | 'VACCINATION'
  | 'DEWORMING'
  | 'ECTOPARASITE'
  | 'VET_CHECK'
  | 'MEDICATION';

export interface NotificationPreferences {
  emailEnabled: boolean;
  leadDays: number[];
  notifyVaccinations: boolean;
  notifyDewormings: boolean;
  notifyEctoparasites: boolean;
  notifyVetChecks: boolean;
  notifyMedications: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailEnabled: true,
  leadDays: [30, 7, 1],
  notifyVaccinations: true,
  notifyDewormings: true,
  notifyEctoparasites: true,
  notifyVetChecks: true,
  notifyMedications: true,
};

export interface UpcomingItem {
  recordId: string;
  type: NotificationRecordType;
  typeLabel: string;
  petName: string;
  label: string;
  dueDate: string;
  daysUntil: number;
  status: DueStatus;
}

interface SourceConfig {
  type: NotificationRecordType;
  table: string;
  dateCol: string;
  labelCol: string;
  typeLabel: string;
  prefKey: keyof Pick<
    NotificationPreferences,
    | 'notifyVaccinations'
    | 'notifyDewormings'
    | 'notifyEctoparasites'
    | 'notifyVetChecks'
    | 'notifyMedications'
  >;
}

const SOURCES: SourceConfig[] = [
  {
    type: 'VACCINATION',
    table: 'vaccinations',
    dateCol: 'valid_until',
    labelCol: 'name',
    typeLabel: 'Očkovanie',
    prefKey: 'notifyVaccinations',
  },
  {
    type: 'DEWORMING',
    table: 'dewormings',
    dateCol: 'next_due_date',
    labelCol: 'product_name',
    typeLabel: 'Odčervenie',
    prefKey: 'notifyDewormings',
  },
  {
    type: 'ECTOPARASITE',
    table: 'ectoparasites',
    dateCol: 'next_due_date',
    labelCol: 'product_name',
    typeLabel: 'Ektoparazity',
    prefKey: 'notifyEctoparasites',
  },
  {
    type: 'VET_CHECK',
    table: 'vet_visits',
    dateCol: 'next_check_date',
    labelCol: 'reason',
    typeLabel: 'Kontrola u veterinára',
    prefKey: 'notifyVetChecks',
  },
  {
    type: 'MEDICATION',
    table: 'medications',
    dateCol: 'end_date',
    labelCol: 'name',
    typeLabel: 'Liek',
    prefKey: 'notifyMedications',
  },
];

const PREVIEW_HORIZON_DAYS = 60;

function rowToPreferences(row: Row): NotificationPreferences {
  const leadDays = Array.isArray(row.lead_days)
    ? (row.lead_days as unknown[]).map(Number).filter((n) => Number.isFinite(n) && n > 0)
    : DEFAULT_PREFERENCES.leadDays;
  return {
    emailEnabled: row.email_enabled !== false,
    leadDays: leadDays.length > 0 ? leadDays : DEFAULT_PREFERENCES.leadDays,
    notifyVaccinations: row.notify_vaccinations !== false,
    notifyDewormings: row.notify_dewormings !== false,
    notifyEctoparasites: row.notify_ectoparasites !== false,
    notifyVetChecks: row.notify_vet_checks !== false,
    notifyMedications: row.notify_medications !== false,
  };
}

export async function getPreferences(appUserId: string): Promise<NotificationPreferences> {
  const { data, error } = await getSupabase()
    .from('notification_preferences')
    .select('*')
    .eq('user_id', appUserId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPreferences(data as Row) : { ...DEFAULT_PREFERENCES };
}

export async function upsertPreferences(
  appUserId: string,
  patch: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getPreferences(appUserId);
  const next: NotificationPreferences = { ...current, ...patch };
  const sanitizedLeadDays = Array.from(
    new Set(next.leadDays.map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 365))
  ).sort((a, b) => b - a);

  const { data, error } = await getSupabase()
    .from('notification_preferences')
    .upsert(
      {
        user_id: appUserId,
        email_enabled: next.emailEnabled,
        lead_days: sanitizedLeadDays.length > 0 ? sanitizedLeadDays : DEFAULT_PREFERENCES.leadDays,
        notify_vaccinations: next.notifyVaccinations,
        notify_dewormings: next.notifyDewormings,
        notify_ectoparasites: next.notifyEctoparasites,
        notify_vet_checks: next.notifyVetChecks,
        notify_medications: next.notifyMedications,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();
  if (error) throw error;
  return rowToPreferences(data as Row);
}

function isTypeEnabled(prefs: NotificationPreferences, source: SourceConfig): boolean {
  return prefs[source.prefKey];
}

/** Najbližšie/po termíne položky pre používateľa (náhľad v nastaveniach). */
export async function computeUpcoming(appUserId: string): Promise<UpcomingItem[]> {
  const prefs = await getPreferences(appUserId);
  const petIds = await getUserPetIds(appUserId);
  if (petIds.length === 0) return [];

  const supabase = getSupabase();
  const { data: petRows, error: petErr } = await supabase
    .from('pets')
    .select('id, name')
    .eq('user_id', appUserId);
  if (petErr) throw petErr;
  const petNames = new Map<string, string>(
    (petRows as Row[]).map((r) => [String(r.id), String(r.name ?? 'Zviera')])
  );

  const items: UpcomingItem[] = [];
  for (const source of SOURCES) {
    if (!isTypeEnabled(prefs, source)) continue;
    const { data, error } = await supabase.from(source.table).select('*').in('pet_id', petIds);
    if (error) throw error;
    for (const row of data as Row[]) {
      const dueDate = row[source.dateCol];
      if (typeof dueDate !== 'string' || !dueDate) continue;
      const d = daysUntil(dueDate);
      if (d === null || d > PREVIEW_HORIZON_DAYS) continue;
      items.push({
        recordId: String(row.id),
        type: source.type,
        typeLabel: source.typeLabel,
        petName: petNames.get(String(row.pet_id)) ?? 'Zviera',
        label: String(row[source.labelCol] ?? source.typeLabel),
        dueDate,
        daysUntil: d,
        status: dueStatus(d),
      });
    }
  }

  return items.sort((a, b) => a.daysUntil - b.daysUntil);
}

interface SweepCandidate {
  userId: string;
  email: string;
  offsetDays: number;
  item: UpcomingItem;
}

export interface SweepSummary {
  dryRun: boolean;
  usersNotified: number;
  itemsIncluded: number;
}

/** Dôvod odoslania pre daný počet dní do termínu (alebo null ak sa dnes nepripomína). */
function matchedOffset(prefs: NotificationPreferences, d: number): number | null {
  if (d === 0 || d === -1) return d; // v deň termínu a prvý deň po termíne
  if (d > 0 && prefs.leadDays.includes(d)) return d;
  return null;
}

/** Slovenské skloňovanie podľa počtu (1 / 2-4 / 5+). */
function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

function statusText(d: number): string {
  if (d < 0) return `po termíne o ${-d} ${plural(-d, 'deň', 'dni', 'dní')}`;
  if (d === 0) return 'dnes';
  return `o ${d} ${plural(d, 'deň', 'dni', 'dní')}`;
}

function buildEmailHtml(items: SweepCandidate[]): string {
  const appUrl = process.env.APP_URL ?? '';
  const rows = items
    .slice()
    .sort((a, b) => a.item.daysUntil - b.item.daysUntil)
    .map((c) => {
      const overdue = c.item.daysUntil < 0;
      const color = overdue ? '#b3261e' : c.item.daysUntil <= 7 ? '#9a6700' : '#1b5e20';
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(c.item.petName)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(c.item.typeLabel)}: <strong>${escapeHtml(c.item.label)}</strong></td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:${color};font-weight:600;">${escapeHtml(statusText(c.item.daysUntil))}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;">${escapeHtml(c.item.dueDate)}</td>
      </tr>`;
    })
    .join('');

  const cta = appUrl
    ? `<p style="margin:20px 0;"><a href="${appUrl}/zdravotny-pas" style="background:#0f4c5c;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block;">Otvoriť zdravotný pas</a></p>`
    : '';

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;">
    <h2 style="color:#0f4c5c;">Pripomienka z Pawlyu</h2>
    <p>Pár termínov tvojich zvierat sa blíži alebo už ušlo. Tu je rýchly prehľad:</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;">${rows}</table>
    ${cta}
    <p style="color:#888;font-size:12px;margin-top:24px;">Tieto pripomienky môžeš kedykoľvek vypnúť v aplikácii (Nastavenia → Notifikácie).</p>
  </div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Prejde všetkých používateľov, pošle e-mail s pripomienkami a zaloguje odoslané. */
export async function runSweep(): Promise<SweepSummary> {
  const supabase = getSupabase();

  const { data: petRows, error: petErr } = await supabase.from('pets').select('id, user_id, name');
  if (petErr) throw petErr;
  const petInfo = new Map<string, { userId: string; petName: string }>(
    (petRows as Row[]).map((r) => [
      String(r.id),
      { userId: String(r.user_id), petName: String(r.name ?? 'Zviera') },
    ])
  );
  const allPetIds = [...petInfo.keys()];
  if (allPetIds.length === 0)
    return { dryRun: !isEmailEnabled(), usersNotified: 0, itemsIncluded: 0 };

  const { data: userRows, error: userErr } = await supabase.from('users').select('id, email');
  if (userErr) throw userErr;
  const emails = new Map<string, string>();
  for (const r of userRows as Row[]) {
    if (typeof r.email === 'string' && r.email) emails.set(String(r.id), r.email);
  }

  const { data: prefRows, error: prefErr } = await supabase
    .from('notification_preferences')
    .select('*');
  if (prefErr) throw prefErr;
  const prefsByUser = new Map<string, NotificationPreferences>();
  for (const r of prefRows as Row[]) {
    prefsByUser.set(String(r.user_id), rowToPreferences(r));
  }

  const candidates: SweepCandidate[] = [];
  for (const source of SOURCES) {
    const { data, error } = await supabase.from(source.table).select('*').in('pet_id', allPetIds);
    if (error) throw error;
    for (const row of data as Row[]) {
      const info = petInfo.get(String(row.pet_id));
      if (!info) continue;
      const email = emails.get(info.userId);
      if (!email) continue;
      const prefs = prefsByUser.get(info.userId) ?? DEFAULT_PREFERENCES;
      if (!prefs.emailEnabled || !isTypeEnabled(prefs, source)) continue;
      const dueDate = row[source.dateCol];
      if (typeof dueDate !== 'string' || !dueDate) continue;
      const d = daysUntil(dueDate);
      if (d === null) continue;
      const offset = matchedOffset(prefs, d);
      if (offset === null) continue;
      candidates.push({
        userId: info.userId,
        email,
        offsetDays: offset,
        item: {
          recordId: String(row.id),
          type: source.type,
          typeLabel: source.typeLabel,
          petName: info.petName,
          label: String(row[source.labelCol] ?? source.typeLabel),
          dueDate,
          daysUntil: d,
          status: dueStatus(d),
        },
      });
    }
  }

  if (candidates.length === 0) {
    return { dryRun: !isEmailEnabled(), usersNotified: 0, itemsIncluded: 0 };
  }

  // Vyradiť už odoslané (record + termín + offset).
  const recordIds = [...new Set(candidates.map((c) => c.item.recordId))];
  const { data: logRows, error: logErr } = await supabase
    .from('notification_log')
    .select('record_type, record_id, due_date, offset_days, channel')
    .in('record_id', recordIds);
  if (logErr) throw logErr;
  const sentKeys = new Set(
    (logRows as Row[]).map(
      (r) => `${r.record_type}|${r.record_id}|${r.due_date}|${r.offset_days}|${r.channel}`
    )
  );
  const keyOf = (c: SweepCandidate) =>
    `${c.item.type}|${c.item.recordId}|${c.item.dueDate}|${c.offsetDays}|email`;
  const pending = candidates.filter((c) => !sentKeys.has(keyOf(c)));
  if (pending.length === 0) {
    return { dryRun: !isEmailEnabled(), usersNotified: 0, itemsIncluded: 0 };
  }

  const byUser = new Map<string, SweepCandidate[]>();
  for (const c of pending) {
    const list = byUser.get(c.userId) ?? [];
    list.push(c);
    byUser.set(c.userId, list);
  }

  const emailEnabled = isEmailEnabled();
  let usersNotified = 0;
  let itemsIncluded = 0;

  for (const [, list] of byUser) {
    const email = list[0].email;
    const subject = `Pawly: ${list.length} ${plural(list.length, 'termín', 'termíny', 'termínov')} čoskoro`;
    try {
      await sendEmail(email, subject, buildEmailHtml(list));
      usersNotified += 1;
      itemsIncluded += list.length;
      if (emailEnabled) {
        const { error: insErr } = await supabase.from('notification_log').upsert(
          list.map((c) => ({
            user_id: c.userId,
            record_type: c.item.type,
            record_id: c.item.recordId,
            due_date: c.item.dueDate,
            offset_days: c.offsetDays,
            channel: 'email',
          })),
          {
            onConflict: 'record_type,record_id,due_date,offset_days,channel',
            ignoreDuplicates: true,
          }
        );
        if (insErr) throw insErr;
      }
    } catch (err) {
      logger.error('Odoslanie notifikácie zlyhalo', {
        userId: list[0].userId,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info('Notifikačný sweep dokončený', {
    dryRun: !emailEnabled,
    usersNotified,
    itemsIncluded,
  });
  return { dryRun: !emailEnabled, usersNotified, itemsIncluded };
}
