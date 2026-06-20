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
        sx={{
          flexWrap: 'wrap',
          gap: theme.spacing(1),
          '& .MuiToggleButton-root': {
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            textTransform: 'none',
            px: theme.spacing(1.5),
          },
          '& .MuiToggleButton-root.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
            fontWeight: 600,
            '&:hover': { backgroundColor: 'primary.dark' },
          },
        }}
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
