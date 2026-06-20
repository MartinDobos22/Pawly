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

const PATH = '/digitalny-zdravotny-pas-pre-psa';

const FAQS: FaqItem[] = [
  {
    q: 'Čo je digitálny zdravotný pas pre psa?',
    a: 'Je to prehľadná evidencia zdravia psa na jednom mieste — očkovania, odčervenia, ošetrenia proti parazitom, vyšetrenia, alergie a chronické stavy. Máš ho vždy po ruke v telefóne.',
  },
  {
    q: 'Môžem si do neho preniesť starý očkovací preukaz?',
    a: 'Áno. Stránku preukazu odfotíš a Pawly z nej pomocou AI vytiahne údaje (napr. vakcinácie), ktoré si potom potvrdíš.',
  },
  {
    q: 'Pripomenie mi Pawly termíny očkovania a odčervenia?',
    a: 'Áno, vieš si nastaviť pripomienky a Pawly ťa upozorní pred blížiacim sa termínom.',
  },
  {
    q: 'Sú moje údaje v bezpečí?',
    a: 'Dáta sú uložené zabezpečene a viazané na tvoj účet. Prístup k nim máš len ty.',
  },
];

export const seo = {
  title: 'Digitálny zdravotný pas pre psa online | Pawly',
  description:
    'Maj očkovania, odčervenia, vyšetrenia a alergie psa na jednom mieste. Digitálny zdravotný preukaz psa s pripomienkami a kartou pre veterinára. Zadarmo.',
  path: PATH,
  jsonLd: landingJsonLd({
    faqs: FAQS,
    breadcrumbs: [
      { name: 'Pawly', path: '/' },
      { name: 'Digitálny zdravotný pas pre psa', path: PATH },
    ],
  }),
};

export default function HealthPassportLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo {...seo} />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Digitálny zdravotný pas pre psa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Očkovania, odčervenia, vyšetrenia aj alergie tvojho psa prehľadne na jednom mieste — vždy po
        ruke.
      </Typography>

      <LandingSection title="Čo si v ňom vieš viesť">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Očkovania a termíny preočkovania.</li>
          <li>Odčervenia a ošetrenia proti kliešťom a blchám.</li>
          <li>Vyšetrenia, lieky a chronické stavy.</li>
          <li>Alergie a intolerancie — využijú sa aj pri analýze krmiva.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Import zo starého preukazu cez AI">
        <Typography variant="body1" color="text.secondary">
          Nemusíš nič prepisovať ručne. Odfoť stránku očkovacieho preukazu a Pawly z nej vytiahne
          údaje, ktoré už len potvrdíš.
        </Typography>
      </LandingSection>

      <LandingSection title="Pripomienky a karta pre veterinára">
        <Typography variant="body1" color="text.secondary">
          Pawly ťa upozorní pred termínom očkovania či odčervenia a pred návštevou veterinára
          pripraví prehľadnú kartu so súhrnom dôležitých údajov.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Vytvor si digitálny zdravotný pas pre svojho psa"
        buttonLabel="Vytvoriť zdravotný pas"
        to="/register"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/analyza-krmiva-pre-psa">
            Analýza krmiva pre psa
          </Link>
          .
        </Typography>
      </Box>
    </PublicPageLayout>
  );
}
