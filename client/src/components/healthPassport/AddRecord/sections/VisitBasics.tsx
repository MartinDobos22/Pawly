import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';

import { VISIT_CATEGORY_OPTIONS } from '../../constants';
import type { ErrorMap, VisitBasicsValues } from '../formTypes';
import SectionCard from './SectionCard';

interface VisitBasicsProps {
  values: VisitBasicsValues;
  errors: ErrorMap;
  onChange: <K extends keyof VisitBasicsValues>(field: K, value: VisitBasicsValues[K]) => void;
}

export default function VisitBasics({ values, errors, onChange }: VisitBasicsProps) {
  const subOptions =
    VISIT_CATEGORY_OPTIONS.find((opt) => opt.main === values.mainCategory)?.sub ?? [];

  return (
    <SectionCard title="Základné info" icon={<InfoIcon />}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            size="small"
            type="date"
            label="Dátum"
            InputLabelProps={{ shrink: true }}
            value={values.date}
            onChange={(e) => onChange('date', e.target.value)}
            error={Boolean(errors['basics.date'])}
            helperText={errors['basics.date']}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <TextField
            size="small"
            label="Klinika / veterinár"
            value={values.clinicName}
            onChange={(e) => onChange('clinicName', e.target.value)}
            error={Boolean(errors['basics.clinicName'])}
            helperText={errors['basics.clinicName'] || 'Povinné'}
            fullWidth
            required
          />
        </Stack>
        <TextField
          size="small"
          label="Stručný popis návštevy"
          placeholder="napr. preventívna prehliadka, akútne vracanie…"
          value={values.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          fullWidth
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <FormControl size="small">
            <InputLabel>Hlavná kategória</InputLabel>
            <Select
              label="Hlavná kategória"
              value={values.mainCategory}
              onChange={(e) => {
                onChange('mainCategory', e.target.value);
                onChange('subcategory', '');
              }}
            >
              <MenuItem value="">
                <em>Nezvolené</em>
              </MenuItem>
              {VISIT_CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.main} value={opt.main}>
                  {opt.main}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={!values.mainCategory}>
            <InputLabel>Podkategória</InputLabel>
            <Select
              label="Podkategória"
              value={values.subcategory}
              onChange={(e) => onChange('subcategory', e.target.value)}
            >
              <MenuItem value="">
                <em>Nezvolené</em>
              </MenuItem>
              {subOptions.map((sub) => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </SectionCard>
  );
}
