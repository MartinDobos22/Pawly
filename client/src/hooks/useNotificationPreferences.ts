import { useCallback, useEffect, useState } from 'react';

import {
  notificationsApi,
  type NotificationPreferences,
  type UpcomingItem,
} from '../services/notificationsApi';
import { logger } from '../utils/logger';

interface State {
  prefs: NotificationPreferences | null;
  upcoming: UpcomingItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export function useNotificationPreferences() {
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
        const [prefs, upcoming] = await Promise.all([
          notificationsApi.getPreferences(),
          notificationsApi.getUpcoming(),
        ]);
        if (active) setState((s) => ({ ...s, prefs, upcoming: upcoming.items, loading: false }));
      } catch (err) {
        if (active)
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : 'Načítanie zlyhalo.',
          }));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = useCallback(async (patch: Partial<NotificationPreferences>) => {
    setState((s) => ({ ...s, saving: true, error: null }));
    try {
      const prefs = await notificationsApi.updatePreferences(patch);
      setState((s) => ({ ...s, prefs, saving: false }));
    } catch (err) {
      logger.error('Uloženie notifikačných nastavení zlyhalo', {
        message: err instanceof Error ? err.message : String(err),
      });
      setState((s) => ({
        ...s,
        saving: false,
        error: err instanceof Error ? err.message : 'Uloženie zlyhalo.',
      }));
    }
  }, []);

  return { ...state, save };
}
