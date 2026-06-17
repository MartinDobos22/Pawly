-- Rozšírenie katalógu druhov zvierat (animal_type) z 'dog'/'cat'/'other'
-- na širší zoznam najbežnejších domácich zvierat.
-- Zdroj pravdy pre zoznam: client/src/constants/animalSpecies.ts a
-- server/src/constants/animalSpecies.ts. Pri pridaní druhu uprav túto migráciu aj obe konštanty.

alter table pets drop constraint if exists pets_animal_type_check;

alter table pets
  add constraint pets_animal_type_check
  check (
    animal_type in (
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
      'other'
    )
  );
