import { Box, Card, Chip, Stack, Typography } from '@mui/material';
import { LocalHospitalOutlined as HospitalIcon } from '@mui/icons-material';
import type { VetVisitRecord } from '../../types/dogHealth';
import AiFormattedText from '../AiFormattedText';

interface Props {
  visits: VetVisitRecord[];
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' });
}

function FieldBlock({ label, text }: { label: string; text: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', mb: 0.25 }}>
        {label}
      </Typography>
      <AiFormattedText text={text} />
    </Box>
  );
}

export default function RecentVisitsCard({ visits }: Props) {
  if (visits.length === 0) return null;

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <HospitalIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Posledné klinické záznamy
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {visits.map((v) => (
          <Card key={v.id} variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1 }}>
              <Chip label={formatDate(v.date)} size="small" color="success" variant="outlined" />
              <Chip label={v.clinicName} size="small" variant="outlined" />
              {v.aiExamType && (
                <Chip label={v.aiExamType} size="small" color="primary" variant="outlined" />
              )}
            </Stack>

            {v.reason && (
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {v.reason}
              </Typography>
            )}

            {v.diagnosis && <FieldBlock label="Diagnóza" text={v.diagnosis} />}
            {v.findings && <FieldBlock label="Nález" text={v.findings} />}
            {v.recommendations && <FieldBlock label="Odporúčania" text={v.recommendations} />}
          </Card>
        ))}
      </Stack>
    </Card>
  );
}
