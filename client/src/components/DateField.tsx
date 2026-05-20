import type { SxProps, Theme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

interface Props {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const toDate = (iso: string): Date | null => {
  if (!iso) return null;
  try {
    const d = parseISO(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const toIso = (d: Date | null): string => {
  if (!d || Number.isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
};

export default function DateField({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
  fullWidth,
  size = 'small',
  sx,
}: Props) {
  return (
    <DatePicker
      label={label}
      value={toDate(value)}
      onChange={(d) => onChange(toIso(d))}
      format="d. M. yyyy"
      slotProps={{
        textField: {
          size,
          required,
          error,
          helperText,
          fullWidth,
          sx,
        },
      }}
    />
  );
}
