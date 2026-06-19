import { Box, Card, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PublicContentHeader from '../components/content/PublicContentHeader';
import VerdictBadge from '../components/content/VerdictBadge';
import LandingFooter from '../components/landing/LandingFooter';
import Seo from '../components/Seo';
import { FOOD_SAFETY_ARTICLES, buildFoodSafetyPath } from '../content/foodSafety';
import type { ContentSpecies } from '../content/foodSafety';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const SPECIES_LABEL: Record<ContentSpecies, string> = {
  dog: 'Pre psa',
  cat: 'Pre mačku',
};

export default function FoodSafetyHubPage({ darkMode, onToggleTheme }: Props) {
  const speciesGroups = (['dog', 'cat'] as ContentSpecies[])
    .map((species) => ({
      species,
      articles: FOOD_SAFETY_ARTICLES.filter((article) => article.species === species),
    }))
    .filter((group) => group.articles.length > 0);

  return (
    <>
      <Seo
        title="Môže pes alebo mačka jesť...? — Pawly"
        description="Zoznam potravín a látok, ktoré sú pre psa alebo mačku bezpečné, rizikové alebo nebezpečné. Overené veterinárne a toxikologické zdroje."
        path="/moze-pes-jest"
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <PublicContentHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
            Môže pes alebo mačka jesť...?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Prehľad bežných potravín a látok — či sú pre psa alebo mačku bezpečné, vyžadujú
            opatrnosť alebo sú nebezpečné. Každý článok cituje konkrétny veterinárny alebo
            toxikologický zdroj.
          </Typography>

          {speciesGroups.map(({ species, articles }) => (
            <Box key={species} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {SPECIES_LABEL[species]}
              </Typography>
              <Stack spacing={1.5}>
                {articles.map((article) => (
                  <Card
                    key={article.slug}
                    component={RouterLink}
                    to={buildFoodSafetyPath(article)}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {article.title}
                    </Typography>
                    <VerdictBadge verdict={article.verdict} size="small" />
                  </Card>
                ))}
              </Stack>
            </Box>
          ))}

          <MuiLink component={RouterLink} to="/rady-pre-majitelov" underline="hover">
            Pozri aj rady pre majiteľov →
          </MuiLink>
        </Container>
        <LandingFooter />
      </Box>
    </>
  );
}
