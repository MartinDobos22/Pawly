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

const PATH = '/analyza-krmiva-pre-psa';

const FAQS: FaqItem[] = [
  {
    q: 'Ako zistím, či je krmivo pre môjho psa vhodné?',
    a: 'Skontroluj zloženie — podiel mäsa, zdroj bielkovín, prítomnosť obilnín a konzervantov — a porovnaj ho s alergiami a zdravotným stavom psa. Pawly ti zloženie rozanalyzuje a upozorní na rizikové zložky voči profilu tvojho psa.',
  },
  {
    q: 'Čo znamenajú alergény v krmive?',
    a: 'Alergén je zložka, na ktorú môže pes reagovať (napr. kuracie mäso, hovädzie, obilniny). Pawly porovná zloženie s alergiami uloženými v profile a označí možný konflikt. Nejde o diagnózu — pri podozrení na alergiu sa poraď s veterinárom.',
  },
  {
    q: 'Musím prepisovať celé zloženie ručne?',
    a: 'Nie. Môžeš odfotiť obal alebo nahrať PDF a Pawly text načíta automaticky (OCR). Potom stačí spustiť analýzu.',
  },
  {
    q: 'Je analýza krmiva zadarmo?',
    a: 'Áno, základná analýza krmiva v Pawly je zadarmo.',
  },
];

export const seo = {
  title: 'Analýza krmiva pre psa — zloženie a alergény | Pawly',
  description:
    'Zisti, či je krmivo pre tvojho psa vhodné. Pawly rozanalyzuje zloženie granúl, upozorní na alergény a porovná ich s profilom tvojho psa. Zadarmo.',
  path: PATH,
  jsonLd: landingJsonLd({
    faqs: FAQS,
    breadcrumbs: [
      { name: 'Pawly', path: '/' },
      { name: 'Analýza krmiva pre psa', path: PATH },
    ],
  }),
};

export default function FoodAnalysisLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Analýza krmiva pre psa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Skontroluj zloženie granúl, odhaľ alergény a zisti, či krmivo sedí tvojmu psovi — za pár
        sekúnd.
      </Typography>

      <LandingSection title="Prečo sa oplatí kontrolovať zloženie krmiva">
        <Typography variant="body1" color="text.secondary">
          Kvalita krmiva priamo ovplyvňuje trávenie, srsť aj energiu psa. Na obale sa však ťažko
          orientuje — poradie zložiek, zdroj bielkovín a skryté obilniny či konzervanty veľa
          napovedia o tom, či je krmivo pre tvojho psa vhodné.
        </Typography>
      </LandingSection>

      <LandingSection title="Aké zložky si všímať">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Podiel a zdroj mäsa (konkrétny druh vs. „mäsové múčky").</li>
          <li>Obilniny a ich množstvo (časté pri citlivom trávení).</li>
          <li>Konzervanty, farbivá a dochucovadlá.</li>
          <li>Vhodnosť pre vek, veľkosť a aktivitu psa.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Alergény a intolerancie">
        <Typography variant="body1" color="text.secondary">
          Ak má pes známe alergie alebo intolerancie, ulož ich do{' '}
          <Link component={RouterLink} to="/digitalny-zdravotny-pas-pre-psa">
            digitálneho zdravotného pasu
          </Link>
          . Pawly potom pri každej analýze porovná zloženie s profilom a upozorní na možný konflikt.
        </Typography>
      </LandingSection>

      <LandingSection title="Ako Pawly analyzuje krmivo">
        <Typography variant="body1" color="text.secondary">
          Vlož zloženie textom alebo odfoť obal — Pawly text načíta a vyhodnotí skóre, prednosti,
          riziká a upozornenia voči profilu psa. Výsledok si môžeš uložiť a nastaviť dané krmivo ako
          aktuálne, aby Pawly sledoval reakcie psa v čase.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Zisti za pár sekúnd, či je krmivo pre tvojho psa vhodné"
        buttonLabel="Analyzovať krmivo"
        to="/register"
        intent="food"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/digitalny-zdravotny-pas-pre-psa">
            Digitálny zdravotný pas pre psa
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
