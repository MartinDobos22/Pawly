import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Cancel as ExpiredIcon,
  HelpOutline as UnknownIcon,
  Vaccines as VaccinesIcon,
} from '@mui/icons-material';
import type { ValidityStatus } from '../../types/dogHealth';
import { statusColor } from '../healthPassport/utils.ts';

export interface PreventiveItem {
  name: string;
  dateGiven: string;
  validUntil?: string;
  batch?: string;
  status: ValidityStatus;
  statusLabel: string;
}

interface Props {
  items: PreventiveItem[];
}

function statusIconFor(status: ValidityStatus) {
  if (status === 'VALID') return <CheckIcon />;
  if (status === 'EXPIRING_SOON') return <WarningIcon />;
  if (status === 'UNKNOWN') return <UnknownIcon />;
  return <ExpiredIcon />;
}

function formatDateShort(value?: string): string {
  if (!value) return '–';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PreventiveCareCard({ items }: Props) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: 'action.hover',
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 22 },
          }}
        >
          <VaccinesIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Preventívna starostlivosť
        </Typography>
      </Stack>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Žiadne záznamy o očkovaniach
        </Typography>
      ) : (
        <Stack spacing={1}>
          {items.map((item, i) => (
            <Box
              key={`${item.name}-${i}`}
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                py: 1,
                borderBottom: i < items.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Podané {formatDateShort(item.dateGiven)}
                  {item.batch ? ` · šarža ${item.batch}` : ''}
                </Typography>
              </Box>
              <Chip
                icon={statusIconFor(item.status)}
                label={item.statusLabel}
                size="small"
                color={statusColor(item.status)}
                variant="outlined"
              />
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
