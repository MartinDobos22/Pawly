import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { VISIT_CATEGORY_OPTIONS } from '../../constants';
import type { ErrorMap, VisitBasicsValues } from '../formTypes';
import SectionCard from './SectionCard';
import DateField from '../../../DateField';

interface VisitBasicsProps {
  values: VisitBasicsValues;
  errors: ErrorMap;
  onChange: <K extends keyof VisitBasicsValues>(field: K, value: VisitBasicsValues[K]) => void;
}

export default function VisitBasics({ values, errors, onChange }: VisitBasicsProps) {
  const { t } = useTranslation('healthPassport');
  const subOptions =
    VISIT_CATEGORY_OPTIONS.find((opt) => opt.key === values.mainCategory)?.sub ?? [];

  return (
    <SectionCard title={t('addRecord.basics.title')} icon={<InfoIcon />}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <DateField
            label={t('addRecord.basics.date')}
            value={values.date}
            onChange={(v) => onChange('date', v)}
            error={Boolean(errors['basics.date'])}
            helperText={errors['basics.date']}
            sx={{ width: { xs: '100%', sm: 200 } }}
          />
          <TextField
            size="small"
            label={t('addRecord.basics.clinic')}
            value={values.clinicName}
            onChange={(e) => onChange('clinicName', e.target.value)}
            error={Boolean(errors['basics.clinicName'])}
            helperText={errors['basics.clinicName']}
            fullWidth
            required
          />
        </Stack>
        <TextField
          size="small"
          label={t('addRecord.basics.reason')}
          placeholder={t('addRecord.basics.reasonPlaceholder')}
          value={values.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          fullWidth
        />
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0, mt: -0.5 }}
        >
          {t('addRecord.basics.categoryHint')}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <FormControl size="small">
            <InputLabel>{t('addRecord.basics.mainCategory')}</InputLabel>
            <Select
              label={t('addRecord.basics.mainCategory')}
              value={values.mainCategory}
              onChange={(e) => {
                onChange('mainCategory', e.target.value);
                onChange('subcategory', '');
              }}
            >
              <MenuItem value="">
                <em>{t('visitCategory.notSelected')}</em>
              </MenuItem>
              {VISIT_CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt.key} value={opt.key}>
                  {t(`visitCategory.${opt.key}` as never)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" disabled={!values.mainCategory}>
            <InputLabel>{t('addRecord.basics.subcategory')}</InputLabel>
            <Select
              label={t('addRecord.basics.subcategory')}
              value={values.subcategory}
              onChange={(e) => onChange('subcategory', e.target.value)}
            >
              <MenuItem value="">
                <em>{t('visitCategory.notSelected')}</em>
              </MenuItem>
              {subOptions.map((sub) => (
                <MenuItem key={sub.key} value={sub.key}>
                  {t(`visitCategory.${sub.key}` as never)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </SectionCard>
  );
}
