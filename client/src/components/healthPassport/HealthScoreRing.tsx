import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';

export interface ScoreBreakdownItem {
  label: string;
  status: 'good' | 'soon' | 'bad' | 'unknown';
  detail?: string;
}

interface Props {
  score: number | null;
  size?: number;
  label?: string;
  breakdown?: ScoreBreakdownItem[];
}

const labelForScore = (score: number) => {
  if (score >= 85) return 'Výborný';
  if (score >= 70) return 'Dobrý';
  if (score >= 50) return 'Priemerný';
  return 'Vyžaduje pozornosť';
};

const statusDot: Record<ScoreBreakdownItem['status'], string> = {
  good: '#2F7D5B',
  soon: '#B8860B',
  bad: '#B4452C',
  unknown: '#9AA0A2',
};

export default function HealthScoreRing({
  score,
  size = 96,
  label = 'Celkový stav',
  breakdown,
}: Props) {
  const theme = useTheme();
  const stroke = Math.max(8, Math.round(size * 0.1));
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
    theme.palette.mode === 'light' ? 'rgba(15,76,92,0.10)' : 'rgba(255,255,255,0.10)';

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
        aria-label={`Health skóre ${hasScore ? Math.round(value) : 'neznáme'}`}
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
          Skóre vychádza z:
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
        <Stack direction="row" gap={0.5} sx={{ mt: 0.25 }}>
          {breakdown.map((b, idx) => (
            <Tooltip key={idx} title={`${b.label}${b.detail ? ` — ${b.detail}` : ''}`}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: statusDot[b.status],
                  opacity: b.status === 'unknown' ? 0.4 : 1,
                  cursor: 'default',
                }}
              />
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
          {label}
        </Typography>
        {hasScore && (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color, fontSize: '0.85rem', lineHeight: 1.3 }}
          >
            {labelForScore(value)}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
