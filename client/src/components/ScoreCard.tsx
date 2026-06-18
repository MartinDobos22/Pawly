import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import HelpHint from './HelpHint';
import { scoreColor } from '../utils/scoreColor';

interface ScoreCardProps {
  score: number;
  summary: string;
}

export default function ScoreCard({ score, summary }: ScoreCardProps) {
  const theme = useTheme();
  const { t } = useTranslation('analyze');
  const color = scoreColor(score, theme);

  const getScoreLabel = (s: number): string => {
    if (s <= 30) return t('score.poor');
    if (s <= 60) return t('score.average');
    if (s <= 80) return t('score.good');
    return t('score.excellent');
  };

  return (
    <Card
      sx={{
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(
          color,
          theme.palette.mode === 'dark' ? 0.08 : 0.06
        )} 100%)`,
      }}
    >
      <CardContent sx={{ py: 4 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          {/* Background track */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={160}
            thickness={4}
            sx={{
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
          {/* Score arc */}
          <CircularProgress
            variant="determinate"
            value={score}
            size={160}
            thickness={4}
            sx={{
              color,
              position: 'absolute',
              left: 0,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          {/* Score number in center */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
              {score}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {t('score.outOf')}
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={0.5}
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color }}>
            {getScoreLabel(score)}
          </Typography>
          <HelpHint text={t('hints.score')} />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('score.totalQuality')}
        </Typography>

        <Typography variant="body1" sx={{ mt: 2, maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
          {summary}
        </Typography>
      </CardContent>
    </Card>
  );
}
