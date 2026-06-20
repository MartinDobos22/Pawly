import { getSupabase } from '../config/supabase';
import { getUserPetIds } from './petOwnership';
import { computeUpcoming } from './notificationsService';
import { daysUntil } from '../utils/dueDates';

export type CareStatusLevel = 'green' | 'orange' | 'red';

export interface CareStatusAction {
  label: string;
  route: string;
}

export interface PetCareStatus {
  petId: string;
  status: CareStatusLevel;
  reasons: string[];
  recommendedAction?: CareStatusAction;
}

type Row = Record<string, unknown>;

interface Signal {
  level: 'red' | 'orange';
  reason: string;
  action: CareStatusAction;
}

// Pripomienka v rozsahu (0 .. DUE_SOON_DAYS) dní → oranžová; po termíne (< 0) → červená.
const DUE_SOON_DAYS = 14;

// Bez check-inu dlhšie ako CHECKIN_STALE_DAYS → oranžová (pripomeň návyk).
const CHECKIN_STALE_DAYS = 10;
// Posledný check-in so závažnými príznakmi (attention) v posledných N dňoch → červená.
const CHECKIN_ATTENTION_DAYS = 14;

function isCurrent(endedAt: unknown): boolean {
  return endedAt == null || String(endedAt).trim() === '';
}

function levelFromSignals(signals: Signal[]): CareStatusLevel {
  if (signals.some((s) => s.level === 'red')) return 'red';
  if (signals.length > 0) return 'orange';
  return 'green';
}

export async function computeCareStatus(appUserId: string): Promise<PetCareStatus[]> {
  const petIds = await getUserPetIds(appUserId);
  if (petIds.length === 0) return [];

  const supabase = getSupabase();
  const [dietRes, weightRes, episodeRes, checkInRes, upcoming] = await Promise.all([
    supabase
      .from('diet_entries')
      .select('pet_id, ended_at, suitability_status, food_type, started_at, created_at')
      .in('pet_id', petIds),
    supabase.from('weight_logs').select('pet_id').in('pet_id', petIds),
    supabase.from('health_episodes').select('pet_id, outcome').in('pet_id', petIds),
    supabase.from('check_ins').select('pet_id, date, severity, created_at').in('pet_id', petIds),
    computeUpcoming(appUserId),
  ]);
  if (dietRes.error) throw dietRes.error;
  if (weightRes.error) throw weightRes.error;
  if (episodeRes.error) throw episodeRes.error;
  if (checkInRes.error) throw checkInRes.error;

  const upcomingByPet = new Map<string, { overdue: boolean; dueSoon: boolean }>();
  for (const u of upcoming) {
    const cur = upcomingByPet.get(u.petId) ?? { overdue: false, dueSoon: false };
    if (u.daysUntil < 0) cur.overdue = true;
    else if (u.daysUntil <= DUE_SOON_DAYS) cur.dueSoon = true;
    upcomingByPet.set(u.petId, cur);
  }

  const weightByPet = new Set((weightRes.data as Row[]).map((r) => String(r.pet_id)));

  const openEpisodeByPet = new Set(
    (episodeRes.data as Row[])
      .filter((r) => r.outcome === 'ongoing' || r.outcome === 'recurring')
      .map((r) => String(r.pet_id))
  );

  // Posledný check-in na zviera (tiebreak cez created_at, aby pri rovnakom dni
  // vyhral skutočne najnovší záznam).
  const latestCheckIn = new Map<string, { date: string; createdAt: string; severity: string }>();
  for (const r of checkInRes.data as Row[]) {
    const date = typeof r.date === 'string' ? r.date : '';
    if (!date) continue;
    const petId = String(r.pet_id);
    const createdAt = String(r.created_at ?? '');
    const prev = latestCheckIn.get(petId);
    const isNewer = !prev || date > prev.date || (date === prev.date && createdAt > prev.createdAt);
    if (isNewer) {
      latestCheckIn.set(petId, { date, createdAt, severity: String(r.severity ?? 'none') });
    }
  }

  // „Aktuálne krmivo" = otvorený hlavný (main) diétny záznam; pri viacerých vyhrá
  // najnovší (started_at, created_at). Pamlsky/doplnky sa do care statusu nerátajú.
  const currentMain = new Map<
    string,
    { startedAt: string; createdAt: string; suitability?: string }
  >();
  for (const r of dietRes.data as Row[]) {
    if (!isCurrent(r.ended_at)) continue;
    if (String(r.food_type ?? 'main') !== 'main') continue;
    const petId = String(r.pet_id);
    const startedAt = String(r.started_at ?? '');
    const createdAt = String(r.created_at ?? '');
    const prev = currentMain.get(petId);
    const isNewer =
      !prev ||
      startedAt > prev.startedAt ||
      (startedAt === prev.startedAt && createdAt > prev.createdAt);
    if (isNewer) {
      currentMain.set(petId, {
        startedAt,
        createdAt,
        suitability: r.suitability_status ? String(r.suitability_status) : undefined,
      });
    }
  }
  const hasCurrentDiet = new Set(currentMain.keys());
  const currentDietSuitability = new Map(
    [...currentMain.entries()].map(([petId, v]) => [petId, v.suitability])
  );

  const REMINDER_ACTION: CareStatusAction = {
    label: 'Skontroluj pripomienky',
    route: '/zdravotny-pas',
  };

  const CHECKIN_ACTION: CareStatusAction = {
    label: 'Vyplň týždenný check-in',
    route: '/check-in',
  };

  return petIds.map((petId) => {
    const signals: Signal[] = [];
    const reminders = upcomingByPet.get(petId);
    const checkIn = latestCheckIn.get(petId);
    const checkInAgeDays = checkIn ? -(daysUntil(checkIn.date) ?? 0) : null;

    if (
      checkIn &&
      checkIn.severity === 'attention' &&
      checkInAgeDays !== null &&
      checkInAgeDays <= CHECKIN_ATTENTION_DAYS
    ) {
      signals.push({
        level: 'red',
        reason: 'Posledný check-in zaznamenal príznaky, ktoré môžu vyžadovať pozornosť.',
        action: { label: 'Pozri check-in', route: '/check-in' },
      });
    }

    if (reminders?.overdue) {
      signals.push({
        level: 'red',
        reason: 'Niektorá pripomienka je po termíne.',
        action: REMINDER_ACTION,
      });
    }
    if (openEpisodeByPet.has(petId)) {
      signals.push({
        level: 'red',
        reason: 'Máš otvorenú zdravotnú epizódu.',
        action: { label: 'Pozri denník', route: '/dennik' },
      });
    }
    const suitability = currentDietSuitability.get(petId);
    if (hasCurrentDiet.has(petId) && suitability === 'UNSUITABLE') {
      signals.push({
        level: 'red',
        reason: 'Aktuálne krmivo je označené ako nevhodné.',
        action: { label: 'Skontroluj krmivo', route: '/krmivo' },
      });
    }

    if (reminders?.dueSoon) {
      signals.push({ level: 'orange', reason: 'Blíži sa pripomienka.', action: REMINDER_ACTION });
    }
    if (hasCurrentDiet.has(petId) && suitability === 'RISKY') {
      signals.push({
        level: 'orange',
        reason: 'Aktuálne krmivo má upozornenie.',
        action: { label: 'Skontroluj krmivo', route: '/krmivo' },
      });
    }
    if (!hasCurrentDiet.has(petId)) {
      signals.push({
        level: 'orange',
        reason: 'Nemáš nastavené aktuálne krmivo.',
        action: { label: 'Nastav aktuálne krmivo', route: '/krmivo' },
      });
    }
    if (!weightByPet.has(petId)) {
      signals.push({
        level: 'orange',
        reason: 'Chýba záznam o váhe.',
        action: { label: 'Doplň váhu', route: '/zdravotny-pas' },
      });
    }
    if (!checkIn) {
      signals.push({
        level: 'orange',
        reason: 'Zatiaľ žiadny týždenný check-in.',
        action: CHECKIN_ACTION,
      });
    } else if (checkInAgeDays !== null && checkInAgeDays > CHECKIN_STALE_DAYS) {
      signals.push({
        level: 'orange',
        reason: 'Týždenný check-in nebol vyplnený už nejaký čas.',
        action: CHECKIN_ACTION,
      });
    }

    const status = levelFromSignals(signals);
    if (status === 'green') {
      return { petId, status, reasons: ['Všetko je aktuálne.'] };
    }

    const ordered = [
      ...signals.filter((s) => s.level === 'red'),
      ...signals.filter((s) => s.level === 'orange'),
    ];
    return {
      petId,
      status,
      reasons: ordered.map((s) => s.reason),
      recommendedAction: ordered[0]?.action,
    };
  });
}
