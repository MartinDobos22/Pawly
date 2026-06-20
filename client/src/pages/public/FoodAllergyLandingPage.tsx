import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography, useTheme } from '@mui/material';
import Seo from '../../components/Seo';
import PublicPageLayout from '../../components/public/PublicPageLayout';
import LandingSection from '../../components/public/LandingSection';
import LandingFaq from '../../components/public/LandingFaq';
import LandingCta from '../../components/public/LandingCta';
import { landingJsonLd, type FaqItem } from '../../utils/seoSchema';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const PATH = '/alergia-na-krmivo-u-psa';

const FAQS: FaqItem[] = [
  {
    q: 'Ako spoznám alergiu na krmivo u psa?',
    a: 'Časté prejavy sú svrbenie kože, začervenanie, opakované zápaly uší, tráviace ťažkosti alebo nadmerné olizovanie labiek. Podobné príznaky však majú aj iné príčiny — diagnózu potvrdí veterinár.',
  },
  {
    q: 'Ktoré zložky bývajú najčastejšími alergénmi?',
    a: 'Najčastejšie sú to bielkovinové zdroje ako hovädzie, kuracie či mliečne výrobky, niekedy aj obilniny. U každého psa to však môže byť iné.',
  },
  {
    q: 'Čo je eliminačná diéta?',
    a: 'Je to postup, pri ktorom pes dostáva krmivo s obmedzeným počtom zložiek (alebo novým zdrojom bielkovín) a postupne sa zisťuje, čo mu robí problém. Vždy ju veď pod dohľadom veterinára.',
  },
  {
    q: 'Ako mi Pawly pomôže pri alergii?',
    a: 'Uložíš známe alergény do profilu psa a Pawly pri analýze krmiva upozorní na ich prítomnosť. Cez týždenné check-iny vieš sledovať aj reakcie po zmene krmiva.',
  },
];

export default function FoodAllergyLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo
        title="Alergia na krmivo u psa — príznaky a riešenie | Pawly"
        description="Príznaky alergie a intolerancie na krmivo u psa, najčastejšie alergény a eliminačná diéta. Pawly upozorní na alergény v krmive a pomôže sledovať reakcie."
        path={PATH}
        jsonLd={landingJsonLd({
          faqs: FAQS,
          breadcrumbs: [
            { name: 'Pawly', path: '/' },
            { name: 'Alergia na krmivo u psa', path: PATH },
          ],
        })}
      />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Alergia na krmivo u psa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Rozpoznaj príznaky, pochop najčastejšie alergény a vyber krmivo, ktoré psovi sedí.
      </Typography>

      <LandingSection title="Príznaky alergie a intolerancie">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Svrbenie, začervenanie kože, nadmerné olizovanie labiek.</li>
          <li>Opakované zápaly uší.</li>
          <li>Tráviace ťažkosti — hnačka, zvracanie, plynatosť.</li>
          <li>Matná srsť alebo nadmerné vypadávanie.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Najčastejšie alergény">
        <Typography variant="body1" color="text.secondary">
          Najčastejšie ide o konkrétny zdroj bielkovín (hovädzie, kuracie, mliečne výrobky), niekedy
          o obilniny. Kľúčové je vedieť, čo presne pes neznáša — a to potom dôsledne sledovať v
          zložení krmiva.
        </Typography>
      </LandingSection>

      <LandingSection title="Ako pomôže analýza krmiva">
        <Typography variant="body1" color="text.secondary">
          Ulož alergény do profilu psa a pri každej{' '}
          <Link component={RouterLink} to="/analyza-krmiva-pre-psa">
            analýze krmiva
          </Link>{' '}
          ťa Pawly upozorní na ich prítomnosť. Po zmene krmiva vieš cez týždenné check-iny sledovať,
          či sa príznaky zlepšili.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Zisti, či krmivo neobsahuje alergény tvojho psa"
        buttonLabel="Analyzovať krmivo"
        to="/register"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/analyza-krmiva-pre-psa">
            Analýza krmiva pre psa
          </Link>
          {' · '}
          <Link component={RouterLink} to="/co-nesmie-pes-jest">
            Čo nesmie pes jesť
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
