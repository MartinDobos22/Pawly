export type EpisodeCategory =
  | 'digestive'
  | 'skin'
  | 'musculoskeletal'
  | 'respiratory'
  | 'behavioral'
  | 'other';

export type EpisodeOutcome = 'resolved' | 'ongoing' | 'recurring' | 'unspecified';
export type EpisodeSeverity = 'mild' | 'moderate' | 'severe';

export interface EpisodeAttachment {
  objectPath: string;
  mimeType: string;
  size: number;
  caption?: string;
  createdAt: string;
}

export interface EpisodeStatusUpdate {
  date: string;
  note: string;
  outcome?: EpisodeOutcome;
  createdAt: string;
}

export interface HealthEpisodeRecord {
  id: string;
  petId: string;
  createdAt: string;
  updatedAt: string;

  symptomTitle: string;
  symptomDescription: string;
  category: EpisodeCategory;
  startedAt: string;
  endedAt?: string;
  location?: string;
  triggers?: string[];

  diagnosis?: string;
  vetVisitId?: string;
  medicationIds: string[];
  treatmentNotes?: string;

  whatWorked: string[];
  whatDidntWork: string[];
  outcome: EpisodeOutcome;
  severity: EpisodeSeverity;

  lessonsLearned?: string;
  attachments?: EpisodeAttachment[];
  statusUpdates?: EpisodeStatusUpdate[];
}

export interface SimilarEpisodeSummary {
  similarEpisodeIds: string[];
  summary: string;
  recommendation: string;
}

export const EPISODE_CATEGORIES: EpisodeCategory[] = [
  'digestive',
  'skin',
  'musculoskeletal',
  'respiratory',
  'behavioral',
  'other',
];

export const EPISODE_OUTCOMES: EpisodeOutcome[] = [
  'unspecified',
  'resolved',
  'ongoing',
  'recurring',
];
export const EPISODE_SEVERITIES: EpisodeSeverity[] = ['mild', 'moderate', 'severe'];

export const EPISODE_CATEGORY_LABEL: Record<EpisodeCategory, string> = {
  digestive: 'Tráviace',
  skin: 'Kožné',
  musculoskeletal: 'Pohybové',
  respiratory: 'Dýchacie',
  behavioral: 'Správanie',
  other: 'Iné',
};

export const EPISODE_OUTCOME_LABEL: Record<EpisodeOutcome, string> = {
  unspecified: 'Neurčené',
  resolved: 'Vyriešené',
  ongoing: 'Pretrváva',
  recurring: 'Opakujúce sa',
};

export const EPISODE_SEVERITY_LABEL: Record<EpisodeSeverity, string> = {
  mild: 'Mierna',
  moderate: 'Stredná',
  severe: 'Závažná',
};
