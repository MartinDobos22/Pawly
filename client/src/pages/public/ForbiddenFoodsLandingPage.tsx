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

const PATH = '/co-nesmie-pes-jest';

const FAQS: FaqItem[] = [
  {
    q: 'Prečo je čokoláda pre psa nebezpečná?',
    a: 'Čokoláda obsahuje teobromín, ktorý psy metabolizujú pomaly. Môže spôsobiť zvracanie, búšenie srdca, kŕče až ohrozenie života — tým horšie, čím je čokoláda horkejšia.',
  },
  {
    q: 'Smie pes hrozno alebo hrozienka?',
    a: 'Nie. Hrozno a hrozienka môžu u psov spôsobiť akútne zlyhanie obličiek, a to už pri malom množstve. Vyhni sa im úplne.',
  },
  {
    q: 'Čo robiť, keď pes zje niečo zakázané?',
    a: 'Bezodkladne kontaktuj veterinára alebo pohotovosť a uveď, čo a koľko pes zjedol. Nečakaj na príznaky — pri niektorých látkach rozhoduje čas.',
  },
  {
    q: 'Ako mám prehľad o tom, čo pes znáša?',
    a: 'V profile psa si vedieš viesť alergie a intolerancie a pri analýze krmiva ťa Pawly upozorní na rizikové zložky.',
  },
];

export const seo = {
  title: 'Čo nesmie pes jesť — zoznam toxických potravín | Pawly',
  description:
    'Zoznam potravín nebezpečných pre psa: čokoláda, hrozno, cibuľa, cesnak, xylitol a ďalšie. Čo robiť pri otrave a ako predísť rizikovým zložkám v krmive.',
  path: PATH,
  jsonLd: landingJsonLd({
    faqs: FAQS,
    breadcrumbs: [
      { name: 'Pawly', path: '/' },
      { name: 'Čo nesmie pes jesť', path: PATH },
    ],
  }),
};

export default function ForbiddenFoodsLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Čo nesmie pes jesť
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Niektoré bežné potraviny sú pre psa toxické. Vedieť, ktoré, môže zachrániť život.
      </Typography>

      <LandingSection title="Najnebezpečnejšie potraviny">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Čokoláda a kakao (teobromín).</li>
          <li>Hrozno a hrozienka (riziko zlyhania obličiek).</li>
          <li>Cibuľa, cesnak, pór (poškodzujú červené krvinky).</li>
          <li>Xylitol — sladidlo v žuvačkách a sladkostiach (prudký pokles cukru).</li>
          <li>Alkohol, kofeín, makadamové orechy, surové cesto.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Čo robiť pri podozrení na otravu">
        <Typography variant="body1" color="text.secondary">
          Ak pes zjedol niečo z týchto potravín, bezodkladne kontaktuj veterinára alebo veterinárnu
          pohotovosť a povedz, čo a koľko zjedol. Pri viacerých látkach rozhoduje rýchlosť — nečakaj
          na príznaky.
        </Typography>
      </LandingSection>

      <LandingSection title="Ako predísť rizikovým zložkám">
        <Typography variant="body1" color="text.secondary">
          Okrem ľudských potravín si dávaj pozor aj na zloženie krmiva a maškŕt. Pri{' '}
          <Link component={RouterLink} to="/analyza-krmiva-pre-psa">
            analýze krmiva
          </Link>{' '}
          ťa Pawly upozorní na rizikové a nevhodné zložky voči profilu tvojho psa.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Skontroluj, čo má tvoj pes v miske"
        buttonLabel="Analyzovať krmivo"
        to="/register"
        intent="food"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/alergia-na-krmivo-u-psa">
            Alergia na krmivo u psa
          </Link>
          {' · '}
          <Link component={RouterLink} to="/analyza-krmiva-pre-psa">
            Analýza krmiva pre psa
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
