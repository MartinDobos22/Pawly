import { Button } from '@mui/material';

import { useManualEntry } from './ManualEntry';

export default function ManualEntryFooter() {
  const { submit, cancel } = useManualEntry();
  return (
    <>
      <Button onClick={cancel}>Zrušiť</Button>
      <Button variant="contained" onClick={submit}>
        Uložiť záznam
      </Button>
    </>
  );
}
