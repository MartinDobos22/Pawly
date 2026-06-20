import { Box, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';

export interface SymptomOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value?: string;
  options: SymptomOption[];
  onChange: (value: string | undefined) => void;
}

export default function SymptomToggleGroup({ label, value, options, onChange }: Props) {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: theme.spacing(1) }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        value={value ?? null}
        exclusive
        onChange={(_e, next: string | null) => onChange(next ?? undefined)}
        size="small"
        sx={{ flexWrap: 'wrap', gap: theme.spacing(1), '& .MuiToggleButton-root': { borderRadius: 2 } }}
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none' }}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
