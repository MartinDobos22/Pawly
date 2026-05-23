import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

import { usePetProfiles } from '../../../hooks/usePetProfiles';
import {
  IDENTIFIER_LABELS,
  type IdentifierKey,
  type MergeAcceptance,
  type PetProfilePatch,
  mergePetProfile,
} from '../../../utils/petProfileMerge';

interface Props {
  dogId: string;
  patch: PetProfilePatch;
  onDone: (changedFields: string[]) => void;
  onSkip: () => void;
}

const SEX_LABEL: Record<'MALE' | 'FEMALE' | 'UNKNOWN', string> = {
  MALE: 'samec',
  FEMALE: 'samica',
  UNKNOWN: 'neuvedené',
};

function describeValue(key: IdentifierKey, value: string | undefined): string {
  if (!value) return '';
  if (key === 'sex' && (value === 'MALE' || value === 'FEMALE' || value === 'UNKNOWN')) {
    return SEX_LABEL[value];
  }
  return value;
}

export default function AiProfileMergeReview({ dogId, patch, onDone, onSkip }: Props) {
  const { profiles, updateProfile } = usePetProfiles();
  const profile = useMemo(() => profiles.find((p) => p.id === dogId) ?? null, [profiles, dogId]);

  const identifierEntries = useMemo(() => {
    if (!patch.identifiers) return [];
    return (Object.keys(IDENTIFIER_LABELS) as IdentifierKey[])
      .map((key) => {
        const incoming = patch.identifiers?.[key];
        if (!incoming || (typeof incoming === 'string' && incoming.trim() === '')) return null;
        const existing = profile ? profile[key] : undefined;
        const existingStr = typeof existing === 'string' ? existing : '';
        return {
          key,
          incoming: incoming as string,
          existingStr,
          isEmptyExisting: existingStr.trim() === '',
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [patch.identifiers, profile]);

  const allergyEntries = useMemo(() => {
    if (!patch.allergies) return [];
    const existing = new Set((profile?.allergies ?? []).map((a) => a.trim().toLowerCase()));
    return patch.allergies
      .map((a) => a.trim())
      .filter((a) => a !== '')
      .filter((a) => !existing.has(a.toLowerCase()));
  }, [patch.allergies, profile]);

  const chronicEntries = useMemo(() => {
    if (!patch.chronicConditions) return [];
    const existing = new Set(
      (profile?.chronicConditions ?? []).map((c) => c.title.trim().toLowerCase())
    );
    return patch.chronicConditions
      .map((c) => c.trim())
      .filter((c) => c !== '')
      .filter((c) => !existing.has(c.toLowerCase()));
  }, [patch.chronicConditions, profile]);

  const initialIdentifierAcceptance = useMemo(() => {
    const acc: Partial<Record<IdentifierKey, boolean>> = {};
    identifierEntries.forEach((entry) => {
      acc[entry.key] = entry.isEmptyExisting;
    });
    return acc;
  }, [identifierEntries]);

  const [identifierAccept, setIdentifierAccept] = useState<Partial<Record<IdentifierKey, boolean>>>(
    initialIdentifierAcceptance
  );
  const [allergyAccept, setAllergyAccept] = useState<string[]>(allergyEntries);
  const [chronicAccept, setChronicAccept] = useState<string[]>(chronicEntries);

  if (!profile) {
    return (
      <Alert severity="info">
        AI navrhla doplniť profil zvieraťa, ale aktívny profil nebol nájdený. Doplň údaje ručne v
        sekcii Profily.
      </Alert>
    );
  }

  const hasAnything =
    identifierEntries.length > 0 || allergyEntries.length > 0 || chronicEntries.length > 0;

  if (!hasAnything) return null;

  const toggleIdentifier = (key: IdentifierKey) =>
    setIdentifierAccept((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleAllergy = (value: string) =>
    setAllergyAccept((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const toggleChronic = (value: string) =>
    setChronicAccept((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );

  const canApply =
    Object.values(identifierAccept).some(Boolean) ||
    allergyAccept.length > 0 ||
    chronicAccept.length > 0;

  const handleApply = async () => {
    const acceptance: MergeAcceptance = {
      identifiers: identifierAccept,
      allergies: allergyAccept,
      chronicConditions: chronicAccept,
    };
    const { merged, changedFields } = mergePetProfile(profile, patch, acceptance);
    await updateProfile(merged.id, merged);
    onDone(changedFields);
  };

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Doplniť do profilu „{profile.name}"
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          AI extrahovala z pasu nové údaje o zvierati. Vyber, čo má pridať do profilu. Existujúce
          neprázdne polia nikdy nepretkávame bez tvojho súhlasu.
        </Typography>

        {identifierEntries.length > 0 && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Základné údaje
            </Typography>
            <Stack>
              {identifierEntries.map((entry) => {
                const label = IDENTIFIER_LABELS[entry.key];
                const incomingLabel = describeValue(entry.key, entry.incoming);
                const existingLabel = entry.isEmptyExisting
                  ? '(prázdne)'
                  : describeValue(entry.key, entry.existingStr);
                return (
                  <FormControlLabel
                    key={entry.key}
                    control={
                      <Checkbox
                        size="small"
                        checked={Boolean(identifierAccept[entry.key])}
                        onChange={() => toggleIdentifier(entry.key)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          <strong>{label}:</strong> {incomingLabel}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            textTransform: 'none',
                            letterSpacing: 0,
                            fontSize: '0.75rem',
                            fontWeight: 400,
                          }}
                        >
                          aktuálne: {existingLabel}
                          {!entry.isEmptyExisting && ' (zachované, ak nezatrhneš)'}
                        </Typography>
                      </Box>
                    }
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {allergyEntries.length > 0 && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Nové alergie
            </Typography>
            <Stack>
              {allergyEntries.map((a) => (
                <FormControlLabel
                  key={a}
                  control={
                    <Checkbox
                      size="small"
                      checked={allergyAccept.includes(a)}
                      onChange={() => toggleAllergy(a)}
                    />
                  }
                  label={<Typography variant="body2">{a}</Typography>}
                />
              ))}
            </Stack>
          </Box>
        )}

        {chronicEntries.length > 0 && (
          <Box>
            <Typography variant="overline" color="text.secondary">
              Nové chronické stavy
            </Typography>
            <Stack>
              {chronicEntries.map((c) => (
                <FormControlLabel
                  key={c}
                  control={
                    <Checkbox
                      size="small"
                      checked={chronicAccept.includes(c)}
                      onChange={() => toggleChronic(c)}
                    />
                  }
                  label={<Typography variant="body2">{c}</Typography>}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button onClick={onSkip} size="small">
            Preskočiť
          </Button>
          <Button variant="contained" onClick={handleApply} size="small" disabled={!canApply}>
            Pridať do profilu
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
