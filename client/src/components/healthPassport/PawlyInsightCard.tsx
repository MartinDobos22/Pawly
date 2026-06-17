import { useTranslation } from 'react-i18next';
import { Box, Card, Divider, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  SentimentSatisfiedAlt as FaceIcon,
} from '@mui/icons-material';

interface Props {
  headline: string;
  bullets: string[];
  footer: string;
}

export default function PawlyInsightCard({ headline, bullets, footer }: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();

  return (
    <Card
      sx={{ p: { xs: 2, md: 3 }, mb: 0, borderRadius: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2.5 }}>
        <SparkleIcon sx={{ fontSize: 21, color: 'primary.light' }} />
        <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 700 }}>
          {t('insight.title')}
        </Typography>
      </Stack>

      <Stack direction="row" gap={2} alignItems="flex-start">
        <Box
          sx={{
            position: 'relative',
            width: 76,
            height: 76,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 40%, ${alpha(theme.palette.success.light, 0.22)}, ${alpha(theme.palette.success.light, 0.1)})`,
          }}
        >
          <FavoriteIcon sx={{ fontSize: 50, color: 'success.light' }} />
          <FaceIcon sx={{ position: 'absolute', fontSize: 26, color: 'success.dark' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, mb: 1.5 }}>{headline}</Typography>
          <Stack spacing={1}>
            {bullets.map((line, idx) => (
              <Stack key={idx} direction="row" gap={1} alignItems="flex-start">
                <CheckIcon sx={{ fontSize: 18, color: 'success.main', mt: '2px', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.45 }}>
                  {line}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'text.secondary' }}>
        <Typography variant="body2">{footer}</Typography>
        <FavoriteBorderIcon sx={{ fontSize: 17 }} />
      </Stack>
    </Card>
  );
}
