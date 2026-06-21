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

const PATH = '/odcervenie-psa';

const FAQS: FaqItem[] = [
  {
    q: 'Ako často odčervovať psa?',
    a: 'Bežne sa dospelý pes odčervuje približne každé 3 mesiace, šteňatá častejšie. Frekvencia závisí od veku, prostredia a životného štýlu psa — presné odporúčanie ti dá veterinár.',
  },
  {
    q: 'Aké sú príznaky parazitov u psa?',
    a: 'Možné príznaky sú hnačka, zvracanie, chudnutie, matná srsť, „sánkovanie" po zadku alebo viditeľné články v truse. Pri podozrení sa poraď s veterinárom — nejde o diagnózu.',
  },
  {
    q: 'Aký je rozdiel medzi odčervením a ochranou proti kliešťom?',
    a: 'Odčervenie cieli na vnútorné parazity (črevné červy). Ochrana proti kliešťom a blchám rieši vonkajšie parazity. Obe sú dôležité a evidujú sa samostatne.',
  },
  {
    q: 'Ako si zapamätám termíny odčervenia?',
    a: 'Záznamy o odčervení a ošetreniach proti parazitom si vedieš v zdravotnom pase Pawly, ktorý ti pripomenie ďalší termín.',
  },
];

export const seo = {
  title: 'Odčervenie psa — ako často a prečo | Pawly',
  description:
    'Ako často odčervovať psa, aké sú príznaky parazitov a ako nezmeškať termín. Pawly eviduje odčervenia aj ochranu proti kliešťom a pripomenie ďalší termín.',
  path: PATH,
  jsonLd: landingJsonLd({
    faqs: FAQS,
    breadcrumbs: [
      { name: 'Pawly', path: '/' },
      { name: 'Odčervenie psa', path: PATH },
    ],
  }),
};

export default function DewormingLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Odčervenie psa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Pravidelné odčervenie chráni psa aj domácnosť — maj termíny pod kontrolou.
      </Typography>

      <LandingSection title="Prečo odčervovať pravidelne">
        <Typography variant="body1" color="text.secondary">
          Črevné parazity oslabujú psa, zhoršujú trávenie a niektoré sa môžu preniesť aj na človeka.
          Pravidelné odčervenie udržuje psa v kondícii a znižuje riziko nákazy v domácnosti.
        </Typography>
      </LandingSection>

      <LandingSection title="Ako často a čím">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Dospelý pes: spravidla každé 3 mesiace.</li>
          <li>Šteňatá a brezivé/dojčiace sučky: častejšie podľa odporúčania veterinára.</li>
          <li>Prípravok a dávkovanie vždy podľa hmotnosti psa a pokynov veterinára.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Na čo si dať pozor">
        <Typography variant="body1" color="text.secondary">
          Odčervenie nenahrádza ochranu proti kliešťom a blchám — sú to dve samostatné veci. Obe si
          vieš prehľadne viesť v{' '}
          <Link component={RouterLink} to="/digitalny-zdravotny-pas-pre-psa">
            digitálnom zdravotnom pase
          </Link>{' '}
          spolu s pripomienkami.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Nezmeškaj ďalšie odčervenie psa"
        buttonLabel="Vytvoriť zdravotný pas"
        to="/register"
        intent="passport"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/ockovanie-psa">
            Očkovanie psa
          </Link>
          {' · '}
          <Link component={RouterLink} to="/digitalny-zdravotny-pas-pre-psa">
            Digitálny zdravotný pas pre psa
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
