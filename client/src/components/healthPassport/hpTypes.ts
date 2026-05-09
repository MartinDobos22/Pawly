import type { EctoparasiteRecord, DietEntry, VaccinationRecord } from '../../types/dogHealth';

export type AiDetectedRecordType = 'VACCINATION' | 'DEWORMING' | 'ECTOPARASITE' | 'MEDICATION' | 'NOTE' | 'SKIP';

export interface AiDetectedDraftRecord {
  id: string;
  sourceConfidence: 'high' | 'medium' | 'low';
  sourceDisease?: string;
  targetType: AiDetectedRecordType;
  productName: string;
  date: string;
  validUntil: string;
  batchNumber: string;
  intervalDays: number;
}

export type WizardAdditionalRecordType = '' | 'VACCINATION' | 'DEWORMING' | 'ECTOPARASITE' | 'MEDICATION';

export interface WizardState {
  date: string;
  clinicName: string;
  reason: string;
  findings: string;
  diagnosis: string;
  recommendations: string;
  nextCheckDate: string;
  addVaccination: boolean;
  vaccineName: string;
  vaccineType: VaccinationRecord['type'];
  vaccineValidUntil: string;
  addDeworming: boolean;
  dewormProduct: string;
  dewormValidUntil: string;
  dewormInterval: number;
  addEcto: boolean;
  ectoProduct: string;
  ectoForm: EctoparasiteRecord['form'];
  ectoValidUntil: string;
  ectoInterval: number;
  addMedication: boolean;
  medName: string;
  medReason: string;
  medDose: string;
  medFrequency: string;
  medEndDate: string;
  addDiet: boolean;
  foodName: string;
  reactionNotes: string;
  suitabilityStatus: NonNullable<DietEntry['suitabilityStatus']>;
  attachmentLabel: string;
  attachmentUrl: string;
  totalExpense: string;
  extraMedicationExpense: string;
  extraFoodExpense: string;
}
