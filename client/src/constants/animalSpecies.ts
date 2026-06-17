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

export const SPECIES_PAGE_SIZE = 5;

export function isAnimalType(value: unknown): value is AnimalType {
  return typeof value === 'string' && (ANIMAL_SPECIES as readonly string[]).includes(value);
}
