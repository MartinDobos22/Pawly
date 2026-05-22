import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { LocalHospitalOutlined as HospitalIcon } from '@mui/icons-material';
import type { VetVisitRecord } from '../../types/dogHealth';
import AiFormattedText from '../AiFormattedText';

interface Props {
  visits: VetVisitRecord[];
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

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
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(visits.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visits.slice(start, start + pageSize);
  }, [visits, page, pageSize]);

  if (visits.length === 0) return null;

  const rangeStart = visits.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, visits.length);

  return (
    <Card variant="outlined" sx={{ p: { xs: 1.75, md: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <HospitalIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Posledné klinické záznamy
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {paged.map((v) => (
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

      {visits.length > PAGE_SIZE_OPTIONS[0] && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          gap={1.5}
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              letterSpacing: 0,
              fontSize: '0.78rem',
            }}
          >
            {rangeStart}–{rangeEnd} z {visits.length} návštev
          </Typography>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '0.78rem',
                }}
              >
                Na stránku
              </Typography>
              <FormControl size="small">
                <Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  sx={{ '& .MuiSelect-select': { py: 0.5, fontSize: '0.85rem' } }}
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              size="small"
              shape="rounded"
              siblingCount={0}
            />
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
