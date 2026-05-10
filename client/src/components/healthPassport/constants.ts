import type { TimelineEvent } from '../../types/dogHealth';
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

export const TIMELINE_TYPE_META: Record<
  TimelineEvent['type'],
  { label: string; color: 'primary' | 'success' | 'warning' | 'error' | 'secondary' | 'info'; hex: string }
> = {
  VACCINATION: { label: 'Očkovanie', color: 'success', hex: '#22c55e' },
  DEWORMING: { label: 'Odčervenie', color: 'secondary', hex: '#a855f7' },
  ECTOPARASITE: { label: 'Ektoparazity', color: 'warning', hex: '#f59e0b' },
  VET_VISIT: { label: 'Veterinár', color: 'primary', hex: '#3b82f6' },
  MEDICATION: { label: 'Liečba', color: 'info', hex: '#06b6d4' },
  DIET: { label: 'Diéta', color: 'success', hex: '#10b981' },
  EXPENSE: { label: 'Výdavok', color: 'error', hex: '#f43f5e' },
  NOTE: { label: 'Poznámka', color: 'info', hex: '#64748b' },
};

export const TIMELINE_FILTER_OPTIONS: Array<{ value: 'ALL' | TimelineEvent['type']; label: string }> = [
  { value: 'ALL', label: 'Všetko' },
  { value: 'VACCINATION', label: 'Očkovanie' },
  { value: 'DEWORMING', label: 'Odčervenie' },
  { value: 'ECTOPARASITE', label: 'Ektoparazity' },
  { value: 'VET_VISIT', label: 'Veterinár' },
  { value: 'MEDICATION', label: 'Lieky' },
  { value: 'DIET', label: 'Diéta' },
  { value: 'EXPENSE', label: 'Výdavky' },
  { value: 'NOTE', label: 'Poznámky' },
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
  'VACCINATION', 'DEWORMING', 'ECTOPARASITE', 'VET_VISIT', 'MEDICATION', 'DIET', 'EXPENSE', 'NOTE',
];

export const VISIT_CATEGORY_OPTIONS = [
  {
    main: 'Laboratórne vyšetrenia',
    sub: ['Krvné testy', 'Vyšetrenie moču', 'Vyšetrenie stolice', 'Mikrobiológia (kultivácie)', 'Cytológia', 'Biopsia / histológia'],
  },
  {
    main: 'Alergie a koža',
    sub: ['Kožné scrapings', 'Kožné stery / pásikové testy', 'Alergologické krvné testy', 'Intradermálne alergotesty'],
  },
  {
    main: 'Zobrazovacie metódy',
    sub: ['Röntgen (RTG)', 'Ultrazvuk (USG)', 'CT', 'MRI', 'Endoskopia'],
  },
  {
    main: 'Srdce a cievy',
    sub: ['EKG', 'Meranie krvného tlaku', 'Echokardiografia', 'Röntgen hrudníka'],
  },
  {
    main: 'Očné vyšetrenia',
    sub: ['Vyšetrenie oka', 'Meranie vnútroočného tlaku', 'Test slzivosti', 'Farbiace testy rohovky'],
  },
  {
    main: 'Neurologické vyšetrenia',
    sub: ['Klinické neuro vyšetrenie', 'Pokročilé zobrazovanie (MRI/CT)'],
  },
  {
    main: 'Infekčné ochorenia',
    sub: ['Rýchlotesty (napr. parvo, FeLV/FIV, srdcový červ)', 'Sérologické panely'],
  },
  {
    main: 'Genetické testy',
    sub: ['Dedičné ochorenia', 'Plemenné testy'],
  },
  {
    main: 'Veterinárny pas',
    sub: ['Záznam z veterinárneho pasu'],
  },
] as const;

export const EXAM_SUBCATEGORY_TO_ALIAS: Record<string, string> = {
  'Krvné testy': 'krvne_testy',
  'Vyšetrenie moču': 'vysetrenie_mocu',
  'Vyšetrenie stolice': 'vysetrenie_stolice',
  'Mikrobiológia (kultivácie)': 'mikrobiologia',
  'Cytológia': 'cytologia',
  'Biopsia / histológia': 'biopsia_histologia',
  'Kožné scrapings': 'kozne_scrapings',
  'Kožné stery / pásikové testy': 'kozne_stery',
  'Alergologické krvné testy': 'alergologicke_krvne_testy',
  'Intradermálne alergotesty': 'intradermalne_alergotesty',
  'Röntgen (RTG)': 'rtg',
  'Ultrazvuk (USG)': 'ultrazvuk',
  'CT': 'ct',
  'MRI': 'mri',
  'Endoskopia': 'endoskopia',
  'EKG': 'ekg',
  'Meranie krvného tlaku': 'krvny_tlak',
  'Echokardiografia': 'echo',
  'Röntgen hrudníka': 'rtg_hrudnika',
  'Vyšetrenie oka': 'vysetrenie_oka',
  'Meranie vnútroočného tlaku': 'vnutoocny_tlak',
  'Test slzivosti': 'test_slzivosti',
  'Farbiace testy rohovky': 'farbiace_testy_rohovky',
  'Klinické neuro vyšetrenie': 'klinicke_neuro',
  'Pokročilé zobrazovanie (MRI/CT)': 'pokrocile_zobrazovanie',
  'Rýchlotesty (napr. parvo, FeLV/FIV, srdcový červ)': 'rychlotesty',
  'Sérologické panely': 'serologicke_panely',
  'Dedičné ochorenia': 'dedicne_ochorenia',
  'Plemenné testy': 'plemenne_testy',
  'Záznam z veterinárneho pasu': 'veterinarny_pas',
};

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const KNOWN_DEWORMING_KEYWORDS = ['drontal', 'milbemax', 'milprazon', 'caniverm', 'deworm', 'odcerv'];
export const KNOWN_ECTOPARASITE_KEYWORDS = ['simparica', 'bravecto', 'advantix', 'nexgard', 'ecto', 'parazit', 'klie', 'blch'];
export const KNOWN_RABIES_KEYWORDS = ['rabies', 'besnot', 'nobivac rabies'];
