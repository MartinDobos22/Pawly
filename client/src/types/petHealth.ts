export type PetSex = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type VaccineType = 'RABIES' | 'COMBINED' | 'OTHER';
export type ValidityStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN';
export type EctoForm = 'TABLET' | 'SPOT_ON' | 'COLLAR';
export type ExpenseCategory = 'VET_VISIT' | 'MEDICATION' | 'FOOD' | 'OTHER';
export type TimelineType =
  | 'VACCINATION'
  | 'DEWORMING'
  | 'ECTOPARASITE'
  | 'VET_VISIT'
  | 'MEDICATION'
  | 'DIET'
  | 'EXPENSE'
  | 'NOTE';

export interface AttachmentRef {
  objectPath: string;
  mimeType: string;
  size: number;
  caption?: string;
  createdAt: string;
}

export interface ChronicCondition {
  id: string;
  title: string;
  description?: string;
}

export interface ProcedureRecord {
  id: string;
  title: string;
  date: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  type: VaccineType;
  name: string;
  dateApplied: string;
  validUntil: string;
  batchNumber?: string;
  attachments?: AttachmentRef[];
}

export interface DewormingRecord {
  id: string;
  petId: string;
  productName: string;
  dateGiven: string;
  intervalDays: number;
  nextDueDate: string;
  attachments?: AttachmentRef[];
}

export interface EctoparasiteRecord {
  id: string;
  petId: string;
  productName: string;
  form: EctoForm;
  dateGiven: string;
  intervalDays?: number;
  durationDays?: number;
  nextDueDate: string;
  attachments?: AttachmentRef[];
}

export interface VetVisitRecord {
  id: string;
  petId: string;
  date: string;
  clinicName: string;
  vetName?: string;
  reason: string;
  findings?: string;
  diagnosis?: string;
  recommendations?: string;
  dietChange?: string;
  nextCheckDate?: string;
  aiExtractedText?: string;
  aiExamType?: string;
  medicationIds: string[];
  attachments?: AttachmentRef[];
}

export interface MedicationRecord {
  id: string;
  petId: string;
  name: string;
  reason: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  longTerm?: boolean;
  fromVetVisitId?: string;
}

export interface MedicationDoseLog {
  id: string;
  petId: string;
  medicationId: string;
  date: string;
  taken: boolean;
}

export interface DietEntry {
  id: string;
  petId: string;
  foodId?: string;
  foodName: string;
  startedAt: string;
  endedAt?: string;
  reactionNotes?: string;
  suitabilityStatus?: 'SUITABLE' | 'RISKY' | 'UNSUITABLE';
  suitabilityReasons?: string[];
}

export interface ExpenseRecord {
  id: string;
  petId: string;
  date: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  relatedVetVisitId?: string;
  relatedDietEntryId?: string;
  note?: string;
}

export interface TimelineEvent {
  id: string;
  petId: string;
  type: TimelineType;
  title: string;
  subtitle?: string;
  date: string;
  dueDate?: string;
  status?: ValidityStatus;
}

export interface WeightLog {
  id: string;
  petId: string;
  date: string;
  kg: number;
}
