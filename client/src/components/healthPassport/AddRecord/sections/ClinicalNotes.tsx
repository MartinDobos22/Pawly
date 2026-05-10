import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, NotesOutlined as NotesIcon } from '@mui/icons-material';

import type { ClinicalNotesValues } from '../formTypes';

interface ClinicalNotesProps {
  values: ClinicalNotesValues;
  expanded: boolean;
  onExpand: (next: boolean) => void;
  onChange: <K extends keyof ClinicalNotesValues>(field: K, value: ClinicalNotesValues[K]) => void;
}

export default function ClinicalNotes({
  values,
  expanded,
  onExpand,
  onChange,
}: ClinicalNotesProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, next) => onExpand(next)}
      disableGutters
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" gap={1}>
          <NotesIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Klinický záznam
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Nález"
            value={values.findings}
            onChange={(e) => onChange('findings', e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            size="small"
            label="Diagnóza"
            value={values.diagnosis}
            onChange={(e) => onChange('diagnosis', e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            size="small"
            label="Odporúčania"
            value={values.recommendations}
            onChange={(e) => onChange('recommendations', e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
