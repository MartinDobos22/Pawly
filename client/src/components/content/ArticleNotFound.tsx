import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArticleShell from './ArticleShell';
import PublicContentHeader from './PublicContentHeader';
import Seo from '../Seo';

interface Props {
  darkMode: boolean;
  onToggleTheme: () => void;
  backHref: string;
  backLabel: string;
  hubLabel: string;
}

export default function ArticleNotFound({
  darkMode,
  onToggleTheme,
  backHref,
  backLabel,
  hubLabel,
}: Props) {
  const location = useLocation();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Seo title="Článok sa nenašiel — Pawly" noindex path={location.pathname} />
      <PublicContentHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <ArticleShell backHref={backHref} backLabel={backLabel}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Článok sa nenašiel
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Tento článok momentálne neexistuje. Skús sa vrátiť na zoznam, alebo si vytvor bezplatný
          účet a opýtaj sa nášho AI asistenta priamo na konkrétnu potravinu.
        </Typography>
        <Stack direction="row" gap={1.5}>
          <Button variant="outlined" component={RouterLink} to={backHref}>
            {hubLabel}
          </Button>
          <Button variant="contained" component={RouterLink} to="/register">
            Vytvoriť účet zadarmo
          </Button>
        </Stack>
      </ArticleShell>
    </Box>
  );
}
