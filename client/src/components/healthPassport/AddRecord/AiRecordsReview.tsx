import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { AiDetectedDraftRecord, AiDetectedRecordType } from '../hpTypes';

interface AiRecordsReviewProps {
  records: AiDetectedDraftRecord[];
  onChange: (id: string, patch: Partial<AiDetectedDraftRecord>) => void;
}

const TARGET_LABEL: Record<AiDetectedRecordType, string> = {
  VACCINATION: 'Očkovanie',
  DEWORMING: 'Odčervenie',
  ECTOPARASITE: 'Ektoparazity',
  MEDICATION: 'Liek',
  NOTE: 'Poznámka',
  SKIP: 'Preskočiť',
};

const CONFIDENCE_COLOR: Record<
  AiDetectedDraftRecord['sourceConfidence'],
  'success' | 'warning' | 'error'
> = {
  high: 'success',
  medium: 'warning',
  low: 'error',
};

const CONFIDENCE_LABEL: Record<AiDetectedDraftRecord['sourceConfidence'], string> = {
  high: 'Vysoká',
  medium: 'Stredná',
  low: 'Nízka',
};

export default function AiRecordsReview({ records, onChange }: AiRecordsReviewProps) {
  if (records.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Po analýze sa tu zobrazia rozpoznané záznamy. Žiadne zatiaľ nie sú extrahované.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        Skontroluj rozpoznané záznamy. Pre každý nastav cieľový typ alebo ho preskoč.
      </Typography>
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }} flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                {record.sourceDisease || record.productName || 'Záznam'}
              </Typography>
              {record.isDuplicate && (
                <Chip size="small" label="Už existuje" color="warning" variant="filled" />
              )}
              <Chip
                size="small"
                label={`Istota: ${CONFIDENCE_LABEL[record.sourceConfidence]}`}
                color={CONFIDENCE_COLOR[record.sourceConfidence]}
                variant="outlined"
              />
            </Stack>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}
            >
              <FormControl size="small">
                <InputLabel>Cieľový typ</InputLabel>
                <Select
                  label="Cieľový typ"
                  value={record.targetType}
                  onChange={(e) =>
                    onChange(record.id, { targetType: e.target.value as AiDetectedRecordType })
                  }
                >
                  {(Object.keys(TARGET_LABEL) as AiDetectedRecordType[]).map((key) => (
                    <MenuItem key={key} value={key}>
                      {TARGET_LABEL[key]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Názov"
                value={record.productName}
                onChange={(e) => onChange(record.id, { productName: e.target.value })}
              />
              <TextField
                size="small"
                type="date"
                label="Dátum"
                InputLabelProps={{ shrink: true }}
                value={record.date}
                onChange={(e) => onChange(record.id, { date: e.target.value })}
              />
              <TextField
                size="small"
                type="date"
                label="Platnosť do"
                InputLabelProps={{ shrink: true }}
                value={record.validUntil}
                onChange={(e) => onChange(record.id, { validUntil: e.target.value })}
              />
              <TextField
                size="small"
                label="Šarža (voliteľné)"
                value={record.batchNumber}
                onChange={(e) => onChange(record.id, { batchNumber: e.target.value })}
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
