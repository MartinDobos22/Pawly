import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import { Medication as MedicationIcon } from '@mui/icons-material';
import type { MedicationRecord } from '../../types/dogHealth';

interface Props {
  medications: MedicationRecord[];
}

function SectionHeader() {
  return (
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
        <MedicationIcon />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Aktívne lieky a doplnky
      </Typography>
    </Stack>
  );
}

export default function ActiveMedicationsCard({ medications }: Props) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, height: '100%' }}>
      <SectionHeader />

      {medications.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Bez aktívnych liekov
        </Typography>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1.25}>
          {medications.map((m) => (
            <Stack key={m.id} direction="row" gap={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  mt: '6px',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {m.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {m.dose} · {m.frequency}
                  {m.reason ? ` · ${m.reason}` : ''}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
