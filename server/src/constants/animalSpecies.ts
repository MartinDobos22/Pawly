export const ANIMAL_SPECIES = [
  'dog',
  'cat',
  'rabbit',
  'guinea_pig',
  'hamster',
  'rat',
  'mouse',
  'gerbil',
  'ferret',
  'chinchilla',
  'hedgehog',
  'parrot',
  'budgerigar',
  'cockatiel',
  'canary',
  'finch',
  'chicken',
  'duck',
  'pigeon',
  'turtle',
  'tortoise',
  'snake',
  'lizard',
  'gecko',
  'bearded_dragon',
  'chameleon',
  'frog',
  'axolotl',
  'fish',
  'horse',
  'pony',
  'goat',
  'sheep',
  'pig',
  'other',
] as const;

export type AnimalType = (typeof ANIMAL_SPECIES)[number];

export function isAnimalType(value: unknown): value is AnimalType {
  return typeof value === 'string' && (ANIMAL_SPECIES as readonly string[]).includes(value);
}

const SPECIES_LABEL_SK: Record<AnimalType, string> = {
  dog: 'Pes',
  cat: 'Mačka',
  rabbit: 'Králik',
  guinea_pig: 'Morča',
  hamster: 'Škrečok',
  rat: 'Potkan',
  mouse: 'Myš',
  gerbil: 'Pieskomil',
  ferret: 'Fretka',
  chinchilla: 'Činčila',
  hedgehog: 'Ježko',
  parrot: 'Papagáj',
  budgerigar: 'Andulka',
  cockatiel: 'Korela',
  canary: 'Kanárik',
  finch: 'Pinka',
  chicken: 'Sliepka',
  duck: 'Kačica',
  pigeon: 'Holub',
  turtle: 'Korytnačka vodná',
  tortoise: 'Korytnačka suchozemská',
  snake: 'Had',
  lizard: 'Jašterica',
  gecko: 'Gekon',
  bearded_dragon: 'Agama bradatá',
  chameleon: 'Chameleón',
  frog: 'Žaba',
  axolotl: 'Axolotl',
  fish: 'Ryba',
  horse: 'Kôň',
  pony: 'Poník',
  goat: 'Koza',
  sheep: 'Ovca',
  pig: 'Prasa',
  other: 'Iné zviera',
};

export function speciesLabelSk(value: AnimalType): string {
  return SPECIES_LABEL_SK[value] ?? 'Iné zviera';
}

export function resolveSpeciesLabelSk(profile: {
  animalType: AnimalType;
  customSpecies?: string;
}): string {
  if (profile.animalType === 'other' && profile.customSpecies?.trim()) {
    return profile.customSpecies.trim();
  }
  return speciesLabelSk(profile.animalType);
}
