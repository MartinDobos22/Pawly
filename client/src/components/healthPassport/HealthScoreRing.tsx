import { useTranslation } from 'react-i18next';
import { Box, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';

export interface ScoreBreakdownItem {
  label: string;
  shortLabel?: string;
  status: 'good' | 'soon' | 'bad' | 'unknown';
  detail?: string;
}

interface Props {
  score: number | null;
  size?: number;
  label?: string;
  breakdown?: ScoreBreakdownItem[];
  incomplete?: boolean;
}

export default function HealthScoreRing({
  score,
  size = 96,
  label,
  breakdown,
  incomplete = false,
}: Props) {
  const { t } = useTranslation('healthPassport');
  const theme = useTheme();
  const stroke = Math.max(8, Math.round(size * 0.1));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const resolvedLabel = label ?? t('score.overallStatus');

  const labelForScore = (value: number) => {
    if (value >= 85) return t('score.excellent');
    if (value >= 70) return t('score.good');
    if (value >= 50) return t('score.average');
    return t('score.needsAttention');
  };

  const hasScore = score !== null && !Number.isNaN(score);
  const value = hasScore ? Math.max(0, Math.min(100, score!)) : 0;

  const color = !hasScore
    ? theme.palette.divider
    : value >= 70
      ? theme.palette.success.main
      : value >= 50
        ? theme.palette.warning.main
        : theme.palette.error.main;

  const statusDot: Record<ScoreBreakdownItem['status'], string> = {
    good: theme.palette.success.main,
    soon: theme.palette.warning.main,
    bad: theme.palette.error.main,
    unknown: theme.palette.text.secondary,
  };

  const trackColor = alpha(theme.palette.text.primary, 0.1);

  const glowFilter =
    theme.palette.mode === 'dark' && hasScore ? `drop-shadow(0 0 6px ${color}55)` : undefined;

  const center = size / 2;
  const dash = (value / 100) * circumference;

  const ring = (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="img"
        aria-label={t('score.aria', { value: hasScore ? Math.round(value) : '—' })}
        style={{ filter: glowFilter }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {hasScore && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dasharray 400ms ease' }}
          />
        )}
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: size * 0.33,
            fontWeight: 700,
            lineHeight: 1,
            color: hasScore ? 'text.primary' : 'text.secondary',
            letterSpacing: '-0.02em',
          }}
        >
          {hasScore ? Math.round(value) : '—'}
        </Typography>
      </Box>
    </Box>
  );

  const tooltipContent =
    breakdown && breakdown.length > 0 ? (
      <Stack spacing={0.5} sx={{ py: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.85, fontSize: '0.7rem' }}>
          {t('score.basedOn')}
        </Typography>
        {breakdown.map((b) => (
          <Stack key={b.label} direction="row" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: statusDot[b.status],
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'inherit',
                textTransform: 'none',
                letterSpacing: 0,
                fontSize: '0.75rem',
              }}
            >
              {b.label}
              {b.detail ? ` — ${b.detail}` : ''}
            </Typography>
          </Stack>
        ))}
      </Stack>
    ) : null;

  return (
    <Stack alignItems="center" spacing={0.75}>
      {tooltipContent ? (
        <Tooltip title={tooltipContent} placement="left" arrow>
          {ring}
        </Tooltip>
      ) : (
        ring
      )}
      {breakdown && breakdown.length > 0 && (
        <Stack
          direction="row"
          gap={1.25}
          sx={{ mt: 0.75, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 220 }}
        >
          {breakdown.map((b, idx) => (
            <Tooltip key={idx} title={`${b.label}${b.detail ? ` — ${b.detail}` : ''}`}>
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ cursor: 'default' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: statusDot[b.status],
                    opacity: b.status === 'unknown' ? 0.45 : 1,
                    boxShadow:
                      theme.palette.mode === 'dark' && b.status !== 'unknown'
                        ? `0 0 5px ${statusDot[b.status]}77`
                        : undefined,
                    border:
                      b.status === 'unknown' ? `1px dashed ${theme.palette.divider}` : undefined,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'none',
                    letterSpacing: 0,
                    lineHeight: 1,
                  }}
                >
                  {b.shortLabel ?? b.label}
                </Typography>
              </Stack>
            </Tooltip>
          ))}
        </Stack>
      )}
      <Stack alignItems="center" spacing={0}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            letterSpacing: 0,
            fontSize: '0.78rem',
            lineHeight: 1.25,
          }}
        >
          {resolvedLabel}
        </Typography>
        {hasScore && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color, fontSize: '0.85rem', lineHeight: 1.3 }}
          >
            {labelForScore(value)}
          </Typography>
        )}
        {incomplete && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: '0.68rem',
              fontStyle: 'italic',
              mt: 0.25,
            }}
          >
            {t('score.incompleteData')}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
