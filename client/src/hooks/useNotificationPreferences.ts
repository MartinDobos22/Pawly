import { useCallback, useEffect, useState } from 'react';

import {
  notificationsApi,
  type NotificationPreferences,
  type UpcomingItem,
} from '../services/notificationsApi';
import { logger } from '../utils/logger';
import i18n from '../i18n';

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
