import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Chip, Divider, Stack, Typography, useTheme } from '@mui/material';
import type { CheckIn, CheckInSeverity } from '../../types/petHealth';
import { recentSymptomCounts, recurringSymptoms, type SymptomField } from '../../utils/checkInTrends';
import { useCheckInLabels } from '../../hooks/useCheckInLabels';

interface Props {
  checkIns: CheckIn[];
}

const TREND_WINDOW_DAYS = 30;
const SYMPTOM_FIELDS: SymptomField[] = ['appetite', 'energy', 'stool', 'skinCoat', 'behavior'];
const MAX_ROWS = 8;

const SEVERITY_COLOR: Record<CheckInSeverity, 'success' | 'warning' | 'error'> = {
  none: 'success',
  mild: 'warning',
  attention: 'error',
};

export default function CheckInHistory({ checkIns }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const labels = useCheckInLabels();

  const sorted = useMemo(
    () => [...checkIns].sort((a, b) => b.date.localeCompare(a.date)),
    [checkIns]
  );
  const trend = useMemo(() => recentSymptomCounts(checkIns, TREND_WINDOW_DAYS), [checkIns]);
  const recurring = useMemo(() => recurringSymptoms(checkIns, TREND_WINDOW_DAYS), [checkIns]);

  const severityLabel = (s: CheckInSeverity): string =>
    s === 'attention'
      ? t('checkIn.severityAttention')
      : s === 'mild'
        ? t('checkIn.severityMild')
        : t('checkIn.severityNone');

  const abnormalLabels = (c: CheckIn): string[] =>
    SYMPTOM_FIELDS.flatMap((field) => {
      const value = c[field];
      return value && value !== 'normal' ? [labels[field][value] ?? value] : [];
    });

  if (sorted.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('checkIn.historyEmpty')}
      </Typography>
    );
  }

  return (
    <Stack spacing={theme.spacing(2)}>
      {recurring.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/dennik')}>
              {t('checkIn.createEpisode')}
            </Button>
          }
        >
          {t('checkIn.recurringHint', {
            symptom: labels[recurring[0].field][recurring[0].value] ?? recurring[0].value,
          })}
        </Alert>
      )}

      {trend.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: theme.spacing(1) }}>
            {t('checkIn.trendTitle')}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: theme.spacing(1) }}>
            {trend.map((o) => (
              <Chip
                key={`${o.field}:${o.value}`}
                size="small"
                label={`${labels[o.field][o.value] ?? o.value} ×${o.count}`}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Typography variant="subtitle2" sx={{ mb: theme.spacing(1) }}>
          {t('checkIn.historyTitle')}
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={theme.spacing(1)}>
          {sorted.slice(0, MAX_ROWS).map((c) => {
            const symptoms = abnormalLabels(c);
            return (
              <Stack
                key={c.id}
                direction="row"
                alignItems="center"
                spacing={theme.spacing(1)}
                sx={{ py: theme.spacing(0.5) }}
              >
                <Chip
                  size="small"
                  color={SEVERITY_COLOR[c.severity]}
                  variant="outlined"
                  label={severityLabel(c.severity)}
                />
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {c.date}
                </Typography>
                <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {symptoms.length > 0 ? symptoms.join(', ') : t('checkIn.noSymptoms')}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
