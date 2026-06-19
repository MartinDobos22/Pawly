import { Box, Card, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PublicContentHeader from '../components/content/PublicContentHeader';
import LandingFooter from '../components/landing/LandingFooter';
import Seo from '../components/Seo';
import { GUIDE_ARTICLES, buildGuidePath } from '../content/guides';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function GuideHubPage({ darkMode, onToggleTheme }: Props) {
  return (
    <>
      <Seo
        title="Rady pre majiteľov psov a mačiek — Pawly"
        description="Praktické návody krok za krokom pre majiteľov: odčervenie, otrava, potravinová alergia a ďalšie bežné zdravotné situácie."
        path="/rady-pre-majitelov"
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <PublicContentHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
            Rady pre majiteľov
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
            Návody krok za krokom pre bežné zdravotné situácie u psov a mačiek, s odkazmi na overené
            veterinárne a toxikologické zdroje.
          </Typography>
          <Stack spacing={1.5}>
            {GUIDE_ARTICLES.map((guide) => (
              <Card
                key={guide.slug}
                component={RouterLink}
                to={buildGuidePath(guide)}
                sx={{ p: 2, textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {guide.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {guide.metaDescription}
                </Typography>
              </Card>
            ))}
          </Stack>
          <Box sx={{ mt: 4 }}>
            <MuiLink component={RouterLink} to="/moze-pes-jest" underline="hover">
              Pozri aj zoznam potravín pre psa a mačku →
            </MuiLink>
          </Box>
        </Container>
        <LandingFooter />
      </Box>
    </>
  );
}
