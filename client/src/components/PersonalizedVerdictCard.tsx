import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { PersonalizedNote } from '../types';

// Verdict → theme palette key (severity scale, mirrors the score colours).
const VERDICT_PALETTE: Record<string, 'error' | 'warning' | 'success'> = {
  NEBEZPEČNÉ: 'error',
  'S VÝHRADAMI': 'warning',
  VHODNÉ: 'success',
  VÝBORNÉ: 'success',
};

interface PersonalizedVerdictCardProps {
  note: PersonalizedNote;
}

export default function PersonalizedVerdictCard({ note }: PersonalizedVerdictCardProps) {
  const { t } = useTranslation('analyze');
  const theme = useTheme();
  const paletteKey = VERDICT_PALETTE[note.overallVerdict] ?? 'warning';
  const verdictStyle = {
    bg:
      note.overallVerdict === 'VÝBORNÉ'
        ? theme.palette.success.dark
        : theme.palette[paletteKey].main,
    color: theme.palette[paletteKey].contrastText,
  };

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {t('personalizedVerdict.title', { name: note.petName })}
        </Typography>

        <Box
          sx={{
            display: 'inline-block',
            px: 2.5,
            py: 0.75,
            borderRadius: 2,
            backgroundColor: verdictStyle.bg,
            color: verdictStyle.color,
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: 0.5,
            mb: 2,
          }}
        >
          {note.overallVerdict}
        </Box>

        <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.7 }}>
          {note.explanation}
        </Typography>
      </CardContent>
    </Card>
  );
}
