import type { Theme } from '@mui/material/styles';

/**
 * Maps a 0–100 quality/health score to a theme palette colour.
 * ≤30 poor → error, ≤60 average → warning, ≤80 good → success, >80 excellent → success.dark.
 */
export function scoreColor(score: number, theme: Theme): string {
  if (score <= 30) return theme.palette.error.main;
  if (score <= 60) return theme.palette.warning.main;
  if (score <= 80) return theme.palette.success.main;
  return theme.palette.success.dark;
}
