import { Stack, TextField } from '@mui/material';
import { NotesOutlined as NotesIcon } from '@mui/icons-material';

import type { ClinicalNotesValues } from '../formTypes';
import SectionCard from './SectionCard';

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
    <SectionCard
      title="Klinický záznam"
      icon={<NotesIcon />}
      collapsible
      expanded={expanded}
      onExpandChange={onExpand}
    >
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label="Nález"
          placeholder="Klinický nález pri vyšetrení…"
          value={values.findings}
          onChange={(e) => onChange('findings', e.target.value)}
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
        />
        <TextField
          size="small"
          label="Diagnóza"
          placeholder="Stanovená diagnóza alebo predbežné podozrenie…"
          value={values.diagnosis}
          onChange={(e) => onChange('diagnosis', e.target.value)}
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
        />
        <TextField
          size="small"
          label="Odporúčania"
          placeholder="Postup liečby, kontrola, životospráva…"
          value={values.recommendations}
          onChange={(e) => onChange('recommendations', e.target.value)}
          multiline
          minRows={3}
          maxRows={8}
          fullWidth
        />
      </Stack>
    </SectionCard>
  );
}
