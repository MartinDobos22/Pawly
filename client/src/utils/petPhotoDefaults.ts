import type { AnimalType } from '../types';

// Pleasant free-stock defaults (Unsplash, free to use/hotlink) shown in the hero
// when the user hasn't uploaded their own photo. If they fail to load (offline,
// blocked), the UI falls back to the local self-contained SVG illustrations below.
export const DEFAULT_PET_PHOTO_URL: Record<AnimalType, string> = {
  dog: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=1200&q=80',
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=80',
  other:
    'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&w=1200&q=80',
};

export const DEFAULT_PET_PHOTO_SVG: Record<AnimalType, string> = {
  dog: '/pets/dog.svg',
  cat: '/pets/cat.svg',
  other: '/pets/other.svg',
};

export const petPhotoSvg = (animalType: AnimalType): string =>
  DEFAULT_PET_PHOTO_SVG[animalType] ?? DEFAULT_PET_PHOTO_SVG.other;

export const petPhotoStock = (animalType: AnimalType): string =>
  DEFAULT_PET_PHOTO_URL[animalType] ?? DEFAULT_PET_PHOTO_URL.other;
