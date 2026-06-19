import { Box, Chip, Stack, alpha, useTheme } from '@mui/material';
import {
  CheckCircle as SafeIcon,
  ErrorOutline as UnsafeIcon,
  WarningAmber as CautionIcon,
} from '@mui/icons-material';
import type { FoodSafetyVerdict } from '../../content/foodSafety/types';

export type VerdictIconType = typeof SafeIcon;

export const VERDICT_ICON: Record<FoodSafetyVerdict, VerdictIconType> = {
  SAFE: SafeIcon,
  CAUTION: CautionIcon,
  UNSAFE: UnsafeIcon,
};

export const VERDICT_TONE: Record<FoodSafetyVerdict, 'success' | 'warning' | 'error'> = {
  SAFE: 'success',
  CAUTION: 'warning',
  UNSAFE: 'error',
};

export const VERDICT_LABEL: Record<FoodSafetyVerdict, string> = {
  SAFE: 'Bezpečné',
  CAUTION: 'Opatrne',
  UNSAFE: 'Nebezpečné',
};

interface Props {
  verdict: FoodSafetyVerdict;
  size?: 'small' | 'medium';
}

export default function VerdictBadge({ verdict, size = 'medium' }: Props) {
  const theme = useTheme();
  const Icon = VERDICT_ICON[verdict];
  const toneKey = VERDICT_TONE[verdict];
  const toneColor = theme.palette[toneKey].main;
  const isSmall = size === 'small';

  return (
    <Stack direction="row" alignItems="center" gap={1.25}>
      <Box
        sx={{
          width: isSmall ? 28 : 40,
          height: isSmall ? 28 : 40,
          borderRadius: '50%',
          bgcolor: alpha(toneColor, 0.18),
          color: toneColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon fontSize={isSmall ? 'small' : 'medium'} />
      </Box>
      <Chip
        size={isSmall ? 'small' : 'medium'}
        label={VERDICT_LABEL[verdict]}
        sx={{
          bgcolor: toneColor,
          color: theme.palette[toneKey].contrastText,
          fontWeight: 700,
        }}
      />
    </Stack>
  );
}
