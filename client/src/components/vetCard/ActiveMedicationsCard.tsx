import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import { MedicationOutlined as MedicationIcon } from '@mui/icons-material';
import type { MedicationRecord } from '../../types/dogHealth';

interface Props {
  medications: MedicationRecord[];
}

export default function ActiveMedicationsCard({ medications }: Props) {
  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 }, height: '100%' }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <MedicationIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Aktívne lieky a doplnky
        </Typography>
      </Stack>

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
