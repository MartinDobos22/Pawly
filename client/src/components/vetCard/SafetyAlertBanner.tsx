import { Alert, AlertTitle, Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  allergies: string[];
  intolerances: string[];
}

export default function SafetyAlertBanner({ allergies, intolerances }: Props) {
  const { t } = useTranslation('vetCard');
  if (allergies.length === 0 && intolerances.length === 0) return null;

  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{
        borderRadius: 3,
        alignItems: 'flex-start',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700, mb: allergies.length ? 1 : 0.5 }}>
        {t('safetyAlert.title')}
      </AlertTitle>

      {allergies.length > 0 && (
        <Box sx={{ mb: intolerances.length ? 1 : 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
            {t('safetyAlert.allergies')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {allergies.map((a) => (
              <Chip key={a} label={a} size="small" color="error" sx={{ fontWeight: 700 }} />
            ))}
          </Stack>
        </Box>
      )}

      {intolerances.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
            {t('safetyAlert.intolerances')}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {intolerances.map((it) => (
              <Chip
                key={it}
                label={it}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Alert>
  );
}
