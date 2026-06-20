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

const PATH = '/ockovanie-psa';

const FAQS: FaqItem[] = [
  {
    q: 'Aké očkovania pes potrebuje?',
    a: 'Základ tvorí kombinovaná vakcína proti psinke, parvoviróze, infekčnej hepatitíde a leptospiróze, plus očkovanie proti besnote (na Slovensku povinné). Veterinár môže odporučiť aj ďalšie podľa rizika (napr. psincový kašeľ).',
  },
  {
    q: 'Ako často sa očkovanie opakuje?',
    a: 'Šteňatá majú základnú sériu vo viacerých dávkach, potom nasleduje preočkovanie. Dospelé psy sa preočkúvajú spravidla raz ročne alebo podľa typu vakcíny a odporúčania veterinára.',
  },
  {
    q: 'Čo ak zmeškám termín preočkovania?',
    a: 'Pri väčšom oneskorení môže byť potrebné sériu zopakovať. Preto sa oplatí mať termíny pod kontrolou — Pawly ti pripomenie blížiace sa preočkovanie.',
  },
  {
    q: 'Kde mám očkovania evidované?',
    a: 'V digitálnom zdravotnom pase Pawly. Záznamy si pridáš ručne alebo importuješ z fotky očkovacieho preukazu.',
  },
];

export default function VaccinationLandingPage({ darkMode, onToggleTheme }: Props) {
  const theme = useTheme();
  return (
    <PublicPageLayout darkMode={darkMode} onToggleTheme={onToggleTheme}>
      <Seo
        title="Očkovanie psa — kalendár a pripomienky | Pawly"
        description="Prehľad očkovaní psa: čo je povinné, ako často preočkovať a ako nezmeškať termín. Pawly ti vakcinácie eviduje a pripomenie blížiace sa preočkovanie."
        path={PATH}
        jsonLd={landingJsonLd({
          faqs: FAQS,
          breadcrumbs: [
            { name: 'Pawly', path: '/' },
            { name: 'Očkovanie psa', path: PATH },
          ],
        })}
      />

      <Typography variant="h3" component="h1" sx={{ mb: theme.spacing(2) }}>
        Očkovanie psa
      </Typography>
      <Typography
        variant="h6"
        component="p"
        color="text.secondary"
        sx={{ mb: theme.spacing(4), fontWeight: 400 }}
      >
        Maj prehľad o tom, čo a kedy psa očkovať — a nezmeškaj žiadne preočkovanie.
      </Typography>

      <LandingSection title="Prečo je očkovanie dôležité">
        <Typography variant="body1" color="text.secondary">
          Očkovanie chráni psa pred vážnymi a často smrteľnými chorobami (psinka, parvoviróza,
          besnota). Pravidelné preočkovanie udržuje imunitu na potrebnej úrovni počas celého života
          psa.
        </Typography>
      </LandingSection>

      <LandingSection title="Povinné vs. odporúčané">
        <Typography variant="body1" color="text.secondary" component="ul">
          <li>Povinné na Slovensku: očkovanie proti besnote.</li>
          <li>Základné (core): psinka, parvoviróza, infekčná hepatitída, leptospiróza.</li>
          <li>Odporúčané podľa rizika: psincový kašeľ a ďalšie podľa prostredia psa.</li>
        </Typography>
      </LandingSection>

      <LandingSection title="Kalendár a pripomienky">
        <Typography variant="body1" color="text.secondary">
          V{' '}
          <Link component={RouterLink} to="/digitalny-zdravotny-pas-pre-psa">
            digitálnom zdravotnom pase
          </Link>{' '}
          máš všetky vakcinácie aj termíny preočkovania na jednom mieste. Pawly ťa upozorní pred
          blížiacim sa termínom, takže na nič nezabudneš.
        </Typography>
      </LandingSection>

      <LandingCta
        heading="Maj očkovania psa pod kontrolou"
        buttonLabel="Vytvoriť zdravotný pas"
        to="/register"
      />

      <LandingFaq title="Časté otázky" faqs={FAQS} />

      <Box sx={{ mt: theme.spacing(4) }}>
        <Typography variant="body2" color="text.secondary">
          Súvisí s:{' '}
          <Link component={RouterLink} to="/odcervenie-psa">
            Odčervenie psa
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
