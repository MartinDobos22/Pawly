import type {
  DietEntry,
  DewormingRecord,
  EctoparasiteRecord,
  MedicationRecord,
  TimelineEvent,
  TreatmentRecord,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/petHealth';

export type TimelineItem = TimelineEvent & { isAi?: boolean };

export interface TimelineRecordSets {
  petId: string;
  vaccines: VaccinationRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  treatments: TreatmentRecord[];
  visits: VetVisitRecord[];
  activeMeds: MedicationRecord[];
  diet: DietEntry[];
}

type TranslateFn = (key: string, opts?: Record<string, unknown>) => string;
type FormatDateFn = (value?: string) => string;

// Single source of truth for the clinical timeline. Both the on-screen view and the
// generated PDF call this with their own translate/format functions (UI language vs
// export language), so the shape can never drift between the two.
export function buildClinicalTimeline(
  sets: TimelineRecordSets,
  t: TranslateFn,
  fmtDateShort: FormatDateFn
): TimelineItem[] {
  const { petId } = sets;

  return [
    ...sets.vaccines.map((x) => ({
      id: `vac-${x.id}`,
      petId,
      type: 'VACCINATION' as const,
      title: t('timeline.titleVaccination', { name: x.name }),
      subtitle: x.validUntil
        ? t('timeline.subtitleValidUntil', { date: fmtDateShort(x.validUntil) })
        : undefined,
      date: x.dateApplied,
    })),
    ...sets.dewormings.map((x) => ({
      id: `dew-${x.id}`,
      petId,
      type: 'DEWORMING' as const,
      title: t('timeline.titleDeworming', { product: x.productName }),
      subtitle: x.nextDueDate
        ? t('timeline.subtitleNextDue', { date: fmtDateShort(x.nextDueDate) })
        : undefined,
      date: x.dateGiven,
    })),
    ...sets.ectos.map((x) => ({
      id: `ect-${x.id}`,
      petId,
      type: 'ECTOPARASITE' as const,
      title: t('timeline.titleEcto', { product: x.productName }),
      subtitle: x.nextDueDate
        ? t('timeline.subtitleNextDue', { date: fmtDateShort(x.nextDueDate) })
        : undefined,
      date: x.dateGiven,
    })),
    ...sets.treatments.map((x) => ({
      id: `trt-${x.id}`,
      petId,
      type: 'TREATMENT' as const,
      title: t('timeline.titleTreatment', { name: x.name }),
      subtitle: x.nextDueDate
        ? t('timeline.subtitleNextDue', { date: fmtDateShort(x.nextDueDate) })
        : undefined,
      date: x.dateGiven,
    })),
    ...sets.visits.map((x) => ({
      id: `vis-${x.id}`,
      petId,
      type: 'VET_VISIT' as const,
      title: t('timeline.titleVisit', { clinic: x.clinicName }),
      subtitle: x.reason,
      date: x.date,
      isAi: Boolean(x.aiExtractedText),
    })),
    ...sets.activeMeds.map((x) => ({
      id: `med-${x.id}`,
      petId,
      type: 'MEDICATION' as const,
      title: t('timeline.titleMedication', { name: x.name }),
      subtitle: `${x.dose} · ${x.frequency}`,
      date: x.startDate,
    })),
    ...sets.diet.map((x) => ({
      id: `diet-${x.id}`,
      petId,
      type: 'DIET' as const,
      title: t('timeline.titleDiet', { food: x.foodName }),
      subtitle: x.suitabilityStatus
        ? t(`vetPage.dietSuitability${x.suitabilityStatus}`, { defaultValue: x.suitabilityStatus })
        : undefined,
      date: x.startedAt,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
}
