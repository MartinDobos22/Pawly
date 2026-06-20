import { getSupabase } from '../config/supabase';
import { getUserPetIds } from './petOwnership';
import { computeUpcoming } from './notificationsService';

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
  const [dietRes, weightRes, episodeRes, upcoming] = await Promise.all([
    supabase
      .from('diet_entries')
      .select('pet_id, ended_at, suitability_status')
      .in('pet_id', petIds),
    supabase.from('weight_logs').select('pet_id').in('pet_id', petIds),
    supabase.from('health_episodes').select('pet_id, outcome').in('pet_id', petIds),
    computeUpcoming(appUserId),
  ]);
  if (dietRes.error) throw dietRes.error;
  if (weightRes.error) throw weightRes.error;
  if (episodeRes.error) throw episodeRes.error;

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

  const hasCurrentDiet = new Set<string>();
  const currentDietSuitability = new Map<string, string | undefined>();
  for (const r of dietRes.data as Row[]) {
    if (!isCurrent(r.ended_at)) continue;
    const petId = String(r.pet_id);
    hasCurrentDiet.add(petId);
    currentDietSuitability.set(
      petId,
      r.suitability_status ? String(r.suitability_status) : undefined
    );
  }

  const REMINDER_ACTION: CareStatusAction = {
    label: 'Skontroluj pripomienky',
    route: '/zdravotny-pas',
  };

  return petIds.map((petId) => {
    const signals: Signal[] = [];
    const reminders = upcomingByPet.get(petId);

    if (reminders?.overdue) {
      signals.push({ level: 'red', reason: 'Niektorá pripomienka je po termíne.', action: REMINDER_ACTION });
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
        action: { label: 'Skontroluj krmivo', route: '/zdravotny-pas' },
      });
    }

    if (reminders?.dueSoon) {
      signals.push({ level: 'orange', reason: 'Blíži sa pripomienka.', action: REMINDER_ACTION });
    }
    if (hasCurrentDiet.has(petId) && suitability === 'RISKY') {
      signals.push({
        level: 'orange',
        reason: 'Aktuálne krmivo má upozornenie.',
        action: { label: 'Skontroluj krmivo', route: '/zdravotny-pas' },
      });
    }
    if (!hasCurrentDiet.has(petId)) {
      signals.push({
        level: 'orange',
        reason: 'Nemáš nastavené aktuálne krmivo.',
        action: { label: 'Nastav aktuálne krmivo', route: '/zdravotny-pas' },
      });
    }
    if (!weightByPet.has(petId)) {
      signals.push({
        level: 'orange',
        reason: 'Chýba záznam o váhe.',
        action: { label: 'Doplň váhu', route: '/zdravotny-pas' },
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
