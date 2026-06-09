import { getSupabase } from '../config/supabase';
import { getUserPetIds } from './petOwnership';
import { isEmailEnabled, sendEmail } from '../config/email';
import { daysUntil, dueStatus, type DueStatus } from '../utils/dueDates';
import { logger } from '../utils/logger';
import type { EmailLocale } from './emailTemplates/verifyEmail';
import {
  buildReminderHtml,
  reminderSubject,
  type ReminderRow,
} from './emailTemplates/notificationReminder';

function parseLocale(value: unknown): EmailLocale {
  return value === 'en' ? 'en' : 'sk';
}

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
const PREVIEW_OVERDUE_DAYS = 30;

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

/**
 * Pre rovnakú dvojicu (pet_id, groupKeyCol) zachová iba záznam s najneskorším
 * `dateCol` — novší termín nahrádza starší (vyriešený) záznam.
 */
function dedupeBySupersede(rows: Row[], dateCol: string, groupKeyCol: string): Row[] {
  const best = new Map<string, Row>();
  for (const row of rows) {
    const dueDate = row[dateCol];
    if (typeof dueDate !== 'string' || !dueDate) continue;
    const key = `${String(row.pet_id)}|${String(row[groupKeyCol] ?? '')}`;
    const prev = best.get(key);
    if (!prev || String(prev[dateCol]) < dueDate) best.set(key, row);
  }
  return [...best.values()];
}

/** Najbližšie/po termíne položky pre používateľa (náhľad v nastaveniach). */
export async function computeUpcoming(appUserId: string, petId?: string): Promise<UpcomingItem[]> {
  const prefs = await getPreferences(appUserId);
  const ownedPetIds = await getUserPetIds(appUserId);
  if (ownedPetIds.length === 0) return [];
  let petIds = ownedPetIds;
  if (petId) {
    if (!ownedPetIds.includes(petId)) return [];
    petIds = [petId];
  }

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
    const deduped = dedupeBySupersede(data as Row[], source.dateCol, source.labelCol);
    for (const row of deduped) {
      const dueDate = row[source.dateCol] as string;
      const d = daysUntil(dueDate);
      if (d === null || d > PREVIEW_HORIZON_DAYS || d < -PREVIEW_OVERDUE_DAYS) continue;
      if (source.type === 'MEDICATION' && d < 0) continue;
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

function toReminderRows(items: SweepCandidate[]): ReminderRow[] {
  return items.map((c) => ({
    petName: c.item.petName,
    typeLabel: c.item.typeLabel,
    label: c.item.label,
    dueDate: c.item.dueDate,
    daysUntil: c.item.daysUntil,
  }));
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

  const { data: userRows, error: userErr } = await supabase
    .from('users')
    .select('id, email, locale');
  if (userErr) throw userErr;
  const emails = new Map<string, string>();
  const locales = new Map<string, EmailLocale>();
  for (const r of userRows as Row[]) {
    if (typeof r.email === 'string' && r.email) emails.set(String(r.id), r.email);
    locales.set(String(r.id), parseLocale(r.locale));
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
    const deduped = dedupeBySupersede(data as Row[], source.dateCol, source.labelCol);
    for (const row of deduped) {
      const info = petInfo.get(String(row.pet_id));
      if (!info) continue;
      const email = emails.get(info.userId);
      if (!email) continue;
      const prefs = prefsByUser.get(info.userId) ?? DEFAULT_PREFERENCES;
      if (!prefs.emailEnabled || !isTypeEnabled(prefs, source)) continue;
      const dueDate = row[source.dateCol] as string;
      const d = daysUntil(dueDate);
      if (d === null) continue;
      if (source.type === 'MEDICATION' && d < 0) continue;
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

    // Dedup pre email view: ak má user viac records s tým istým (petName, type,
    // label, dueDate) — typicky duplicitné záznamy v DB — ukáž len jeden riadok.
    // Všetky duplikáty však zalogujeme nižšie aby sa nezahrnuli pri ďalšom sweep-e
    // ako "nové" candidates.
    const seenDisplayKeys = new Set<string>();
    const displayList: SweepCandidate[] = [];
    for (const c of list) {
      const displayKey = `${c.item.petName}|${c.item.type}|${c.item.label}|${c.item.dueDate}`;
      if (seenDisplayKeys.has(displayKey)) continue;
      seenDisplayKeys.add(displayKey);
      displayList.push(c);
    }

    const locale = locales.get(list[0].userId) ?? 'sk';
    const subject = reminderSubject(locale, displayList.length);
    const appUrl = process.env.APP_URL ?? '';
    try {
      await sendEmail(
        email,
        subject,
        buildReminderHtml(toReminderRows(displayList), locale, appUrl)
      );
      usersNotified += 1;
      itemsIncluded += displayList.length;
      if (emailEnabled) {
        // Logujeme VŠETKY candidates (vrátane duplikátov skrytých v zobrazení)
        // aby sa žiadny duplikát nezahrnul znova pri ďalšom sweep-e.
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
