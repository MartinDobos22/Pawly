import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ExpiredIcon,
  HelpOutline as UnknownIcon,
} from '@mui/icons-material';
import type { ReactElement } from 'react';
import type { ValidityStatus } from '../../types/dogHealth';

interface Props {
  icon: ReactElement;
  label: string;
  status: ValidityStatus;
  detail?: string;
}

const STATUS_META: Record<
  ValidityStatus,
  { toneKey: 'success' | 'warning' | 'error' | 'neutral'; Icon: typeof CheckIcon; label: string }
> = {
  VALID: { toneKey: 'success', Icon: CheckIcon, label: 'Platné' },
  EXPIRING_SOON: { toneKey: 'warning', Icon: WarningIcon, label: 'Vyprší čoskoro' },
  EXPIRED: { toneKey: 'error', Icon: ExpiredIcon, label: 'Po termíne' },
  UNKNOWN: { toneKey: 'neutral', Icon: UnknownIcon, label: 'Nezadané' },
};

export default function VetCardStatusCell({ icon, label, status, detail }: Props) {
  const theme = useTheme();
  const meta = STATUS_META[status];

  const toneColor =
    meta.toneKey === 'success'
      ? theme.palette.success.main
      : meta.toneKey === 'warning'
        ? theme.palette.warning.main
        : meta.toneKey === 'error'
          ? theme.palette.error.main
          : theme.palette.text.disabled;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(toneColor, 0.3)}`,
        bgcolor: alpha(toneColor, theme.palette.mode === 'light' ? 0.05 : 0.12),
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="flex-start" gap={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(toneColor, 0.18),
            color: toneColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1.2 }}
            noWrap
          >
            {label}
          </Typography>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <meta.Icon sx={{ fontSize: 14, color: toneColor, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: toneColor, fontSize: '0.82rem', lineHeight: 1.25 }}
              noWrap
            >
              {meta.label}
            </Typography>
          </Stack>
          {detail && detail !== meta.label && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                letterSpacing: 0,
                fontSize: '0.72rem',
                lineHeight: 1.3,
              }}
            >
              {detail}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
