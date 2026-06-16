import type { TimelineEvent } from '../../types/petHealth';
import {
  Biotech as BiotechIcon,
  EventNote as EventNoteIcon,
  MedicalServices as MedicalServicesIcon,
  Medication as MedicationIcon,
  PestControl as PestControlIcon,
  ReceiptLong as ReceiptLongIcon,
  Restaurant as RestaurantIcon,
  Vaccines as VaccinesIcon,
} from '@mui/icons-material';
import { createElement } from 'react';

export type TimelineTypeColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'secondary'
  | 'info'
  | 'diet';

export const TIMELINE_TYPE_META: Record<TimelineEvent['type'], { color: TimelineTypeColor }> = {
  VACCINATION: { color: 'success' },
  DEWORMING: { color: 'secondary' },
  ECTOPARASITE: { color: 'info' },
  VET_VISIT: { color: 'primary' },
  MEDICATION: { color: 'info' },
  DIET: { color: 'diet' },
  EXPENSE: { color: 'secondary' },
  NOTE: { color: 'info' },
};

export const TIMELINE_FILTER_VALUES: Array<'ALL' | TimelineEvent['type']> = [
  'ALL',
  'VACCINATION',
  'DEWORMING',
  'ECTOPARASITE',
  'VET_VISIT',
  'MEDICATION',
  'DIET',
  'EXPENSE',
  'NOTE',
];

export const TIMELINE_ICON_MAP: Record<TimelineEvent['type'], React.ReactElement> = {
  VACCINATION: createElement(VaccinesIcon, { fontSize: 'small' }),
  DEWORMING: createElement(BiotechIcon, { fontSize: 'small' }),
  ECTOPARASITE: createElement(PestControlIcon, { fontSize: 'small' }),
  VET_VISIT: createElement(MedicalServicesIcon, { fontSize: 'small' }),
  MEDICATION: createElement(MedicationIcon, { fontSize: 'small' }),
  DIET: createElement(RestaurantIcon, { fontSize: 'small' }),
  EXPENSE: createElement(ReceiptLongIcon, { fontSize: 'small' }),
  NOTE: createElement(EventNoteIcon, { fontSize: 'small' }),
};

export const EXPORTABLE_TIMELINE_TYPES: TimelineEvent['type'][] = [
  'VACCINATION',
  'DEWORMING',
  'ECTOPARASITE',
  'VET_VISIT',
  'MEDICATION',
  'DIET',
  'EXPENSE',
  'NOTE',
];

export type VisitSubOption = { key: string; alias?: string };
export type VisitCategoryOption = { key: string; main: string; sub: VisitSubOption[] };

export const VISIT_CATEGORY_OPTIONS: VisitCategoryOption[] = [
  {
    key: 'laboratory',
    main: 'Laboratórne vyšetrenia',
    sub: [
      { key: 'blood_tests', alias: 'krvne_testy' },
      { key: 'urine', alias: 'vysetrenie_mocu' },
      { key: 'stool', alias: 'vysetrenie_stolice' },
      { key: 'microbiology', alias: 'mikrobiologia' },
      { key: 'cytology', alias: 'cytologia' },
      { key: 'biopsy', alias: 'biopsia_histologia' },
    ],
  },
  {
    key: 'allergy',
    main: 'Alergie a koža',
    sub: [
      { key: 'skin_scrapings', alias: 'kozne_scrapings' },
      { key: 'skin_swabs', alias: 'kozne_stery' },
      { key: 'allergy_blood', alias: 'alergologicke_krvne_testy' },
      { key: 'intradermal', alias: 'intradermalne_alergotesty' },
    ],
  },
  {
    key: 'imaging',
    main: 'Zobrazovacie metódy',
    sub: [
      { key: 'xray', alias: 'rtg' },
      { key: 'ultrasound', alias: 'ultrazvuk' },
      { key: 'ct', alias: 'ct' },
      { key: 'mri', alias: 'mri' },
      { key: 'endoscopy', alias: 'endoskopia' },
    ],
  },
  {
    key: 'cardiology',
    main: 'Srdce a cievy',
    sub: [
      { key: 'ekg', alias: 'ekg' },
      { key: 'blood_pressure', alias: 'krvny_tlak' },
      { key: 'echocardiography', alias: 'echo' },
      { key: 'chest_xray', alias: 'rtg_hrudnika' },
    ],
  },
  {
    key: 'ophthalmology',
    main: 'Očné vyšetrenia',
    sub: [
      { key: 'eye_exam', alias: 'vysetrenie_oka' },
      { key: 'eye_pressure', alias: 'vnutoocny_tlak' },
      { key: 'tear_test', alias: 'test_slzivosti' },
      { key: 'cornea_test', alias: 'farbiace_testy_rohovky' },
    ],
  },
  {
    key: 'neurology',
    main: 'Neurologické vyšetrenia',
    sub: [
      { key: 'neuro_exam', alias: 'klinicke_neuro' },
      { key: 'advanced_imaging', alias: 'pokrocile_zobrazovanie' },
    ],
  },
  {
    key: 'infectious',
    main: 'Infekčné ochorenia',
    sub: [
      { key: 'rapid_tests', alias: 'rychlotesty' },
      { key: 'serology', alias: 'serologicke_panely' },
    ],
  },
  {
    key: 'genetic',
    main: 'Genetické testy',
    sub: [
      { key: 'genetic_diseases', alias: 'dedicne_ochorenia' },
      { key: 'breed_tests', alias: 'plemenne_testy' },
    ],
  },
  {
    key: 'passport',
    main: 'Veterinárny pas',
    sub: [{ key: 'passport_record', alias: 'veterinarny_pas' }],
  },
];

export const EXAM_SUBCATEGORY_TO_ALIAS: Record<string, string> = Object.fromEntries(
  VISIT_CATEGORY_OPTIONS.flatMap((cat) =>
    cat.sub.filter((s) => s.alias).map((s) => [s.key, s.alias!])
  )
);

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
export const KNOWN_DEWORMING_KEYWORDS = [
  'drontal',
  'milbemax',
  'milprazon',
  'caniverm',
  'deworm',
  'odcerv',
];
export const KNOWN_ECTOPARASITE_KEYWORDS = [
  'simparica',
  'bravecto',
  'advantix',
  'nexgard',
  'ecto',
  'parazit',
  'klie',
  'blch',
];
export const KNOWN_RABIES_KEYWORDS = ['rabies', 'besnot', 'nobivac rabies'];
