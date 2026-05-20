import { Box, Stack, Typography, useTheme } from '@mui/material';

interface Props {
  score: number | null;
  size?: number;
  label?: string;
}

const labelForScore = (score: number) => {
  if (score >= 85) return 'Výborný';
  if (score >= 70) return 'Dobrý';
  if (score >= 50) return 'Priemerný';
  return 'Vyžaduje pozornosť';
};

export default function HealthScoreRing({ score, size = 120, label = 'Celkový stav' }: Props) {
  const theme = useTheme();
  const stroke = Math.max(6, Math.round(size * 0.07));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasScore = score !== null && !Number.isNaN(score);
  const value = hasScore ? Math.max(0, Math.min(100, score!)) : 0;

  const color = !hasScore
    ? theme.palette.divider
    : value >= 70
      ? theme.palette.success.main
      : value >= 50
        ? theme.palette.warning.main
        : theme.palette.error.main;

  const trackColor =
    theme.palette.mode === 'light' ? 'rgba(15,76,92,0.08)' : 'rgba(255,255,255,0.08)';

  const center = size / 2;
  const dash = (value / 100) * circumference;

  return (
    <Stack alignItems="center" spacing={1}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          role="img"
          aria-label={`Health skóre ${hasScore ? Math.round(value) : 'neznáme'}`}
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
            gap: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: size * 0.27,
              fontWeight: 700,
              lineHeight: 1,
              color: hasScore ? 'text.primary' : 'text.secondary',
              letterSpacing: '-0.02em',
            }}
          >
            {hasScore ? Math.round(value) : '—'}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: size * 0.075, mt: 0.5 }}
          >
            zo 100
          </Typography>
        </Box>
      </Box>
      <Stack alignItems="center" spacing={0.25}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        {hasScore && (
          <Typography variant="body2" sx={{ fontWeight: 600, color }}>
            {labelForScore(value)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
