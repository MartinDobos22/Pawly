import type { GuideArticle } from './types';

export const alergiaNaKrmivoPes: GuideArticle = {
  slug: 'alergia-na-krmivo-pes',
  species: 'dog',
  title: 'Ako rozpoznať potravinovú alergiu u psa',
  metaDescription:
    'Príznaky potravinovej alergie u psa, najčastejšie alergény a ako prebieha eliminačná diéta na potvrdenie diagnózy.',
  intro:
    'Potravinová alergia vzniká, keď imunitný systém psa začne reagovať na konkrétnu bielkovinu alebo zložku v strave. Na rozdiel od intolerancie ide o imunitnú reakciu — a tá sa typicky rozvinie až po dlhšom opakovanom kontakte s danou potravinou, nie pri prvom podaní.',
  steps: [
    {
      heading: '1. Sleduj typické príznaky',
      body: 'Najčastejšie ide o svrbenie kože, labiek alebo uší a opakované infekcie uší, často spolu s tráviacimi príznakmi (vracanie, hnačka). Menej zjavné prejavy sú zvýšená aktivita, chudnutie, únava alebo zmena správania.',
    },
    {
      heading: '2. Vytipuj časté alergény',
      body: 'Najčastejšie alergény u psov sú mliečne výrobky, hovädzie a kuracie mäso, vajcia, sója a pšeničný lepok — typicky zložky, ktoré pes jedol dlhodobo, nie nové potraviny.',
    },
    {
      heading: '3. Absolvuj eliminačnú diétu pod vedením veterinára',
      body: 'Ide o zlatý štandard diagnostiky: striktná hypoalergénna strava (bez doterajších surovín, bez pamlskov a aromatizovaných doplnkov) počas 8–12 týždňov. Tráviace príznaky sa často zlepšia skôr, kožné prejavy u mnohých psov vymiznú okolo 5. týždňa.',
    },
    {
      heading: '4. Potvrď diagnózu „potravinovou výzvou"',
      body: 'Po zlepšení sa pôvodná strava opatrne vráti do jedálnička. Ak sa príznaky vrátia do týždňa, diagnóza potravinovej alergie sa považuje za potvrdenú.',
    },
    {
      heading: '5. Drž sa upravenej stravy dlhodobo',
      body: 'Na potravinovú alergiu neexistuje liek — jediná účinná „liečba" je trvalé vyhýbanie sa danému alergénu v strave i pamlskoch.',
    },
  ],
  sources: [
    {
      label: 'VCA Animal Hospitals — Food Allergies in Dogs',
      url: 'https://vcahospitals.com/know-your-pet/food-allergies-in-dogs',
    },
  ],
  lastReviewed: '2026-06-19',
  relatedPaths: ['/rady/ako-rozpoznat-otravu-u-psa'],
};
