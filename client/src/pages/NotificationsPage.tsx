import { useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { NotificationsActive as NotifyIcon } from '@mui/icons-material';

import { useAuth } from '../hooks/useAuth';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationPreferences } from '../services/notificationsApi';

const LEAD_DAY_OPTIONS = [30, 14, 7, 1];

const TYPE_TOGGLES: { key: keyof NotificationPreferences; label: string }[] = [
  { key: 'notifyVaccinations', label: 'Očkovania' },
  { key: 'notifyDewormings', label: 'Odčervenie' },
  { key: 'notifyEctoparasites', label: 'Ektoparazity (kliešte/blchy)' },
  { key: 'notifyVetChecks', label: 'Kontroly u veterinára' },
  { key: 'notifyMedications', label: 'Koniec liekov' },
];

function statusColor(status: string): 'error' | 'warning' | 'success' {
  if (status === 'OVERDUE') return 'error';
  if (status === 'DUE_SOON') return 'warning';
  return 'success';
}

/** 1 deň · 2-4 dni · 5+ dní */
function dayWord(n: number): string {
  const abs = Math.abs(n);
  if (abs === 1) return 'deň';
  if (abs >= 2 && abs <= 4) return 'dni';
  return 'dní';
}

function dueText(days: number): string {
  if (days < 0) return `po termíne o ${-days} ${dayWord(days)}`;
  if (days === 0) return 'dnes';
  return `o ${days} ${dayWord(days)}`;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { prefs, upcoming, loading, saving, error, save } = useNotificationPreferences();
  const [localError, setLocalError] = useState<string | null>(null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!prefs) {
    return <Alert severity="error">{error ?? 'Nastavenia sa nepodarilo načítať.'}</Alert>;
  }

  const toggleLeadDay = (day: number) => {
    const has = prefs.leadDays.includes(day);
    const next = has ? prefs.leadDays.filter((d) => d !== day) : [...prefs.leadDays, day];
    if (next.length === 0) {
      setLocalError('Nechaj aspoň jeden interval pripomienky.');
      return;
    }
    setLocalError(null);
    void save({ leadDays: next });
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 720, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <NotifyIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Notifikácie
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Upozorníme ťa, keď sa blíži termín očkovaní, odčervenia, antiparazitík, kontroly u
        veterinára alebo koniec liečby liekom.
      </Typography>

      {(error || localError) && <Alert severity="warning">{localError ?? error}</Alert>}

      <Card sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            E-mail
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={prefs.emailEnabled}
                disabled={saving}
                onChange={(e) => save({ emailEnabled: e.target.checked })}
              />
            }
            label="Posielať pripomienky e-mailom"
          />
          <Typography variant="caption" color="text.secondary">
            {user?.email
              ? `Pripomienky chodia na ${user.email}`
              : 'Tvoj účet nemá e-mail — pridaj ho cez prihlásenie e-mailom.'}
          </Typography>
        </Stack>
      </Card>

      <Card sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Koľko dní vopred
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {LEAD_DAY_OPTIONS.map((day) => (
              <Chip
                key={day}
                label={`${day} ${dayWord(day)}`}
                color={prefs.leadDays.includes(day) ? 'primary' : 'default'}
                variant={prefs.leadDays.includes(day) ? 'filled' : 'outlined'}
                onClick={() => toggleLeadDay(day)}
                disabled={saving}
              />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Pripomenieme aj v deň termínu a hneď po ňom.
          </Typography>
        </Stack>
      </Card>

      <Card sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Typy záznamov
          </Typography>
          {TYPE_TOGGLES.map(({ key, label }) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={prefs[key] as boolean}
                  disabled={saving}
                  onChange={(e) => save({ [key]: e.target.checked })}
                />
              }
              label={label}
            />
          ))}
        </Stack>
      </Card>

      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Najbližšie termíny
        </Typography>
        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Žiadne termíny v najbližšom období.
          </Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {upcoming.map((item) => (
              <Stack
                key={`${item.type}-${item.recordId}`}
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ py: 1 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {item.petName} · {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.typeLabel} · {item.dueDate}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color={statusColor(item.status)}
                  label={dueText(item.daysUntil)}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Card>

      <Typography variant="caption" color="text.secondary">
        Push notifikácie do telefónu pripravujeme.
      </Typography>
    </Stack>
  );
}
