import { useState, type KeyboardEvent } from 'react';
import { Box, Chip, IconButton, TextField, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface StringListEditorProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  chipColor?: 'success' | 'error' | 'warning' | 'info' | 'default';
  helperText?: string;
}

export default function StringListEditor({
  label,
  values,
  onChange,
  placeholder,
  chipColor = 'default',
  helperText,
}: StringListEditorProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...values, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    }
  };

  const handleDelete = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          helperText={helperText}
        />
        <IconButton onClick={commit} disabled={!draft.trim()} color="primary" aria-label="Pridať">
          <AddIcon />
        </IconButton>
      </Box>
      {values.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
          {values.map((value) => (
            <Chip
              key={value}
              label={value}
              color={chipColor === 'default' ? undefined : chipColor}
              onDelete={() => handleDelete(value)}
              size="small"
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
