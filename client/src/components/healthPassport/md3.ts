import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { surfaceTokens, shadowTokens } from '../../theme';

export type Md3TypeRole =
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium';

interface TypeStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
}

const TYPE: Record<Md3TypeRole, TypeStyle> = {
  headlineSmall: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
  titleLarge: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
  titleMedium: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0.01em' },
  titleSmall: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4 },
  bodyMedium: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.45 },
  bodySmall: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
  labelLarge: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.01em' },
  labelMedium: { fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.35, letterSpacing: '0.04em' },
};

export interface Md3Tokens {
  surface: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  elevation1: string;
  elevation2: string;
  elevation3: string;
  shape: { xs: number; sm: number; md: number; lg: number; xl: number };
  type: Record<Md3TypeRole, TypeStyle>;
  state: (color: string, level?: 'hover' | 'focus' | 'press') => string;
}

/**
 * Lokálny Material 3 token systém pre screen Zdravotného pasu. Odvodené z existujúcej
 * MUI témy (paleta + exportované surface/shadow tokeny) — nemení globálnu tému.
 */
export function md3(theme: Theme): Md3Tokens {
  const dark = theme.palette.mode === 'dark';
  const s = dark ? surfaceTokens.dark : surfaceTokens.light;
  const sh = dark ? shadowTokens.dark : shadowTokens.light;

  return {
    surface: s.default,
    surfaceContainerLowest: dark ? s.default : s.paper,
    surfaceContainerLow: dark ? s.paper : s.default,
    surfaceContainer: s.variant,
    surfaceContainerHigh: s.variantStrong,
    surfaceContainerHighest: s.variantStrong,
    outline: alpha(theme.palette.text.primary, dark ? 0.3 : 0.22),
    outlineVariant: theme.palette.divider,
    primaryContainer: alpha(theme.palette.primary.main, dark ? 0.24 : 0.12),
    onPrimaryContainer: dark ? theme.palette.primary.light : theme.palette.primary.dark,
    secondaryContainer: alpha(theme.palette.secondary.main, dark ? 0.26 : 0.14),
    onSecondaryContainer: dark ? theme.palette.secondary.light : theme.palette.secondary.dark,
    elevation1: sh.s1,
    elevation2: sh.s2,
    elevation3: sh.s3,
    shape: { xs: 0.5, sm: 1, md: 1.5, lg: 2, xl: 3.5 },
    type: TYPE,
    state: (color, level = 'hover') =>
      alpha(color, level === 'press' ? 0.12 : level === 'focus' ? 0.1 : 0.08),
  };
}
