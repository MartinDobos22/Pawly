import { useTranslation } from 'react-i18next';
import { Stack, TextField, useTheme } from '@mui/material';
import SymptomToggleGroup, { type SymptomOption } from './SymptomToggleGroup';

export type SymptomField = 'appetite' | 'energy' | 'stool' | 'skinCoat' | 'behavior';

export interface DetailedState {
  appetite?: string;
  energy?: string;
  stool?: string;
  skinCoat?: string;
  behavior?: string;
  weight: string;
  note: string;
}

interface Props {
  state: DetailedState;
  onSymptom: (field: SymptomField, value?: string) => void;
  onWeight: (value: string) => void;
  onNote: (value: string) => void;
}

export default function DetailedCheckInForm({ state, onSymptom, onWeight, onNote }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const appetiteOptions: SymptomOption[] = [
    { value: 'normal', label: t('checkIn.appetite.normal') },
    { value: 'less', label: t('checkIn.appetite.less') },
    { value: 'more', label: t('checkIn.appetite.more') },
    { value: 'refuses', label: t('checkIn.appetite.refuses') },
  ];
  const energyOptions: SymptomOption[] = [
    { value: 'normal', label: t('checkIn.energy.normal') },
    { value: 'lower', label: t('checkIn.energy.lower') },
    { value: 'higher', label: t('checkIn.energy.higher') },
    { value: 'very_low', label: t('checkIn.energy.very_low') },
  ];
  const stoolOptions: SymptomOption[] = [
    { value: 'normal', label: t('checkIn.stool.normal') },
    { value: 'soft', label: t('checkIn.stool.soft') },
    { value: 'diarrhea', label: t('checkIn.stool.diarrhea') },
    { value: 'constipation', label: t('checkIn.stool.constipation') },
    { value: 'blood_mucus', label: t('checkIn.stool.blood_mucus') },
  ];
  const skinCoatOptions: SymptomOption[] = [
    { value: 'normal', label: t('checkIn.skinCoat.normal') },
    { value: 'itching', label: t('checkIn.skinCoat.itching') },
    { value: 'redness', label: t('checkIn.skinCoat.redness') },
    { value: 'dandruff', label: t('checkIn.skinCoat.dandruff') },
    { value: 'hair_loss', label: t('checkIn.skinCoat.hair_loss') },
  ];
  const behaviorOptions: SymptomOption[] = [
    { value: 'normal', label: t('checkIn.behavior.normal') },
    { value: 'apathetic', label: t('checkIn.behavior.apathetic') },
    { value: 'nervous', label: t('checkIn.behavior.nervous') },
    { value: 'aggressive', label: t('checkIn.behavior.aggressive') },
    { value: 'pain', label: t('checkIn.behavior.pain') },
  ];

  return (
    <Stack spacing={theme.spacing(2.5)}>
      <SymptomToggleGroup
        label={t('checkIn.groupAppetite')}
        value={state.appetite}
        options={appetiteOptions}
        onChange={(v) => onSymptom('appetite', v)}
      />
      <SymptomToggleGroup
        label={t('checkIn.groupEnergy')}
        value={state.energy}
        options={energyOptions}
        onChange={(v) => onSymptom('energy', v)}
      />
      <SymptomToggleGroup
        label={t('checkIn.groupStool')}
        value={state.stool}
        options={stoolOptions}
        onChange={(v) => onSymptom('stool', v)}
      />
      <SymptomToggleGroup
        label={t('checkIn.groupSkinCoat')}
        value={state.skinCoat}
        options={skinCoatOptions}
        onChange={(v) => onSymptom('skinCoat', v)}
      />
      <SymptomToggleGroup
        label={t('checkIn.groupBehavior')}
        value={state.behavior}
        options={behaviorOptions}
        onChange={(v) => onSymptom('behavior', v)}
      />
      <TextField
        label={t('checkIn.weight')}
        type="number"
        value={state.weight}
        onChange={(e) => onWeight(e.target.value)}
        inputProps={{ min: 0, step: 0.1 }}
        sx={{ maxWidth: 200 }}
      />
      <TextField
        label={t('checkIn.note')}
        placeholder={t('checkIn.notePlaceholder')}
        value={state.note}
        onChange={(e) => onNote(e.target.value)}
        multiline
        minRows={2}
      />
    </Stack>
  );
}
