import { Box, Card, CardContent, Chip, Typography, useTheme, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Recommendation } from '../types';

interface RecommendationChipProps {
  recommendation: Recommendation;
}

export default function RecommendationChip({ recommendation }: RecommendationChipProps) {
  const theme = useTheme();
  const { t } = useTranslation('analyze');

  return (
    <Card>
      <CardContent>
        {/* Vhodné pre */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('recommendation.suitableFor')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendation.suitableFor.map((item, i) => (
              <Chip
                key={i}
                label={item}
                sx={{
                  backgroundColor: alpha(
                    theme.palette.success.main,
                    theme.palette.mode === 'dark' ? 0.15 : 0.08
                  ),
                  color: theme.palette.success.main,
                  fontWeight: 500,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.19)}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Nevhodné pre */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
            {t('recommendation.notRecommendedFor')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {recommendation.notRecommendedFor.map((item, i) => (
              <Chip
                key={i}
                label={item}
                variant="outlined"
                sx={{
                  borderColor: theme.palette.error.main + '60',
                  color: theme.palette.error.main,
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
