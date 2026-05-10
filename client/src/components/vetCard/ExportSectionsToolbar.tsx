import { Box, Chip, Stack, Typography } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

export type ExportSectionId =
  | 'identity'
  | 'conditions'
  | 'medications'
  | 'prevention'
  | 'visits'
  | 'history';

export type ExportSectionsState = Record<ExportSectionId, boolean>;

export const DEFAULT_EXPORT_SECTIONS: ExportSectionsState = {
  identity: true,
  conditions: true,
  medications: true,
  prevention: true,
  visits: true,
  history: true,
};

const SECTION_LABELS: Record<ExportSectionId, string> = {
  identity: 'Identita',
  conditions: 'Diagnózy',
  medications: 'Lieky',
  prevention: 'Preventíva',
  visits: 'Klinické záznamy',
  history: 'História',
};

const ORDER: ExportSectionId[] = [
  'identity',
  'conditions',
  'medications',
  'prevention',
  'visits',
  'history',
];

interface ExportSectionsToolbarProps {
  value: ExportSectionsState;
  onChange: (next: ExportSectionsState) => void;
}

export default function ExportSectionsToolbar({ value, onChange }: ExportSectionsToolbarProps) {
  const toggle = (id: ExportSectionId) => onChange({ ...value, [id]: !value[id] });

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      gap={1}
      flexWrap="wrap"
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
        Sekcie pre export:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {ORDER.map((id) => {
          const on = value[id];
          return (
            <Chip
              key={id}
              label={SECTION_LABELS[id]}
              icon={on ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
              size="small"
              clickable
              variant={on ? 'filled' : 'outlined'}
              color={on ? 'primary' : 'default'}
              onClick={() => toggle(id)}
            />
          );
        })}
      </Box>
    </Stack>
  );
}
