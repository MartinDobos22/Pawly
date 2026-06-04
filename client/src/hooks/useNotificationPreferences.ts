import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  notificationsApi,
  type NotificationPreferences,
  type UpcomingItem,
} from '../services/notificationsApi';
import { logger } from '../utils/logger';
import i18n from '../i18n';
import { useHealthData } from './useHealthData';

interface State {
  prefs: NotificationPreferences | null;
  upcoming: UpcomingItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export function useNotificationPreferences() {
  const { vaccinations, dewormings, ectos, visits, medications } = useHealthData();

  const [state, setState] = useState<State>({
    prefs: null,
    upcoming: [],
    loading: true,
    saving: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const prefs = await notificationsApi.getPreferences();
        if (active) setState((s) => ({ ...s, prefs, loading: false }));
      } catch (err) {
        if (active)
          setState((s) => ({
            ...s,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : i18n.t('notifications.loadError', { ns: 'landing' }),
          }));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const healthSignature = useMemo(() => {
    const parts: string[] = [];
    for (const v of vaccinations) parts.push(`v:${v.id}:${v.validUntil ?? ''}`);
    for (const d of dewormings) parts.push(`d:${d.id}:${d.nextDueDate ?? ''}`);
    for (const e of ectos) parts.push(`e:${e.id}:${e.nextDueDate ?? ''}`);
    for (const vi of visits) parts.push(`vi:${vi.id}:${vi.nextCheckDate ?? ''}`);
    for (const m of medications) parts.push(`m:${m.id}:${m.endDate ?? ''}`);
    return parts.join('|');
  }, [vaccinations, dewormings, ectos, visits, medications]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const upcoming = await notificationsApi.getUpcoming();
        if (active) setState((s) => ({ ...s, upcoming: upcoming.items }));
      } catch (err) {
        logger.error('Načítanie najbližších termínov zlyhalo', {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [healthSignature]);

  const save = useCallback(async (patch: Partial<NotificationPreferences>) => {
    let snapshot: NotificationPreferences | null = null;
    setState((s) => {
      snapshot = s.prefs;
      if (!s.prefs) return { ...s, error: null };
      return { ...s, prefs: { ...s.prefs, ...patch }, error: null };
    });
    try {
      const prefs = await notificationsApi.updatePreferences(patch);
      setState((s) => ({ ...s, prefs }));
    } catch (err) {
      logger.error('Uloženie notifikačných nastavení zlyhalo', {
        message: err instanceof Error ? err.message : String(err),
      });
      setState((s) => ({
        ...s,
        prefs: snapshot,
        error:
          err instanceof Error
            ? err.message
            : i18n.t('notifications.saveFailed', { ns: 'landing' }),
      }));
    }
  }, []);

  return { ...state, save };
}
